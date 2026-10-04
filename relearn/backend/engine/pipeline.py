"""Step 9 - Hybrid diagnosis pipeline.

Given the line before the error and the student's wrong line:
  1. trained model  -> probabilities over all labels (always computed)
  2. rule matcher   -> exact reproduction by a generator: source "rule", 0.95
  2b. answer match  -> the student's line has exactly the solution a
                       misconception produces (e.g. jumped straight to
                       x=5.5): source "rule", 0.80
  3. trusted model  -> top label (not NONE) with prob >= 0.60: source "model",
                       confidence capped at 0.90
  4. LLM fallback   -> taxonomy-checked label, confidence capped at 0.70
  5. unknown

Returns (diagnosis, trace). diagnosis matches schemas.Diagnosis; trace records
what each stage said, for the evaluation ablation (Step 12).
"""
from ..dataset.factory import solutions
from ..model.predict import predict
from .fallback import classify
from .generators import GENERATORS
from .matcher import match

MODEL_THRESHOLD = 0.60
MODEL_CAP = 0.90
RULE_CONFIDENCE = 0.95
ANSWER_CONFIDENCE = 0.80

ROOT_CONCEPT = {
    "PARTIAL_DISTRIBUTION": "DISTRIBUTIVE_LAW",
    "SQUARE_OF_SUM": "DISTRIBUTIVE_LAW",
    "NEGATIVE_DISTRIBUTION": "DISTRIBUTIVE_LAW",
    "TRANSPOSITION": "EQUALITY_BALANCE",
    "UNLIKE_TERMS": "LIKE_TERMS",
    "NEG_TIMES_NEG": "INTEGER_RULES",
    "ARITHMETIC_SLIP": None,
    "unknown": None,
}

# Used when the model decides and no rule produced a specific sentence.
MODEL_EVIDENCE = {
    "PARTIAL_DISTRIBUTION": "The number outside the bracket was not multiplied by every term inside it.",
    "SQUARE_OF_SUM": "The square of a sum was expanded without the middle (2ab) term.",
    "NEGATIVE_DISTRIBUTION": "The minus sign before the bracket was applied to only one term.",
    "TRANSPOSITION": "A term was moved across '=' without changing its sign.",
    "UNLIKE_TERMS": "An x-term and a number were added together as if they were like terms.",
    "NEG_TIMES_NEG": "A negative times a negative was treated as negative.",
    "ARITHMETIC_SLIP": "The method is right, but a calculation in this step is wrong.",
}


def _diagnosis(label, source, confidence, evidence, candidates):
    return {
        "label": label,
        "source": source,
        "confidence": round(float(confidence), 2),
        "evidence": evidence,
        "root_concept": ROOT_CONCEPT.get(label),
        "candidates": candidates,
    }


def match_by_answer(prev_line: str, student_line: str) -> list[str]:
    """Labels whose generator output has the same solution as the student's line."""
    try:
        target = solutions(student_line)
        if target == solutions(prev_line):
            return []  # not an error at all
    except Exception:
        return []
    labels = []
    for label, generator in GENERATORS.items():
        if label == "ARITHMETIC_SLIP":
            continue
        wrong = generator(prev_line)
        try:
            if wrong and solutions(wrong) == target:
                labels.append(label)
        except Exception:
            continue
    return labels


def _as_equation(line: str) -> str:
    """'(x+5)^2' -> '(x+5)^2=0'. For a chain like '8+8=16' use the last part."""
    return line.split("=")[-1] + "=0"


def diagnose(prev_line: str, student_line: str):
    # Expression questions ("Expand (x+5)^2", "Simplify 3x+5", "Calculate (-3)*(-4)")
    # have no '='. The generators, matcher and model all work on equations, so
    # both lines are rewritten as "<expression>=0". Answer matching is skipped
    # for expressions, because "solutions of E=0" mean nothing there.
    expression_mode = "=" not in prev_line or "=" not in student_line
    if expression_mode:
        prev_line, student_line = _as_equation(prev_line), _as_equation(student_line)

    candidates = predict(prev_line, student_line, top_k=3)  # [] if no model saved
    rules = match(prev_line, student_line)
    trace = {
        "expression_mode": expression_mode,
        "model": candidates[0] if candidates else None,
        "rule_labels": [r["label"] for r in rules],
        "llm": None,
        "decided_by": None,
    }

    # Model probabilities for display; fall back to the rule labels if no model.
    shown = candidates or [{"label": r["label"], "prob": round(1 / len(rules), 4)} for r in rules]

    # 2. Rule match. If several rules match, prefer the one the model rates highest.
    if rules:
        prob = {c["label"]: c["prob"] for c in candidates}
        best = max(rules, key=lambda r: prob.get(r["label"], 0.0))
        trace["decided_by"] = "rule"
        trace["model_agrees"] = bool(candidates) and candidates[0]["label"] == best["label"]
        return _diagnosis(best["label"], "rule", RULE_CONFIDENCE, best["evidence"], shown), trace

    # 2b. Answer match: the student skipped the working but landed exactly on
    #     the answer a misconception produces.
    by_answer = [] if expression_mode else match_by_answer(prev_line, student_line)
    trace["answer_labels"] = by_answer
    if by_answer:
        prob = {c["label"]: c["prob"] for c in candidates}
        best = max(by_answer, key=lambda l: prob.get(l, 0.0))
        trace["decided_by"] = "answer"
        evidence = MODEL_EVIDENCE[best] + " The answer is exactly what this mistake produces."
        return _diagnosis(best, "rule", ANSWER_CONFIDENCE, evidence, shown), trace

    # 3. Trusted model. NONE means the model thinks the step is fine, which
    #    contradicts the checker, so it is not trusted here.
    if candidates:
        top = candidates[0]
        if top["label"] != "NONE" and top["prob"] >= MODEL_THRESHOLD:
            trace["decided_by"] = "model"
            return _diagnosis(top["label"], "model", min(top["prob"], MODEL_CAP),
                              MODEL_EVIDENCE[top["label"]], shown), trace

    # 4. LLM fallback.
    llm = classify(prev_line, student_line)
    trace["llm"] = llm
    if llm and llm["label"] != "unknown":
        trace["decided_by"] = "llm"
        return _diagnosis(llm["label"], "llm", llm["confidence"], llm["evidence"], shown), trace

    # 5. Unknown.
    trace["decided_by"] = "unknown"
    return _diagnosis("unknown", "model" if candidates else "rule", 0.0,
                      "This mistake does not match a known misconception pattern.", shown), trace

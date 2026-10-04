"""Step 11/12 - Evaluation runner.

Builds backend/eval/eval_results.json in the exact format Member 3's Model
Performance panel reads (member-3-visuals/.../mocks/evalSummary.json):

  headline          dataset size, accuracy on unseen templates, accuracy on the
                    test traces, how often the wrong step is found, unknown rate
  labels +          confusion matrix of the FULL system on the test traces
  confusion_matrix
  ablation          rules only / model only / LLM only / full hybrid
  composition       rows per label, synthetic vs test traces
  leave_one_out     a misconception removed from training entirely: how often
                    its examples are sent to "unknown" instead of a wrong label

Run:  python -m backend.eval.run_eval
      python -m backend.eval.run_eval --traces-are-real   (ONLY if the test traces
                                                           were collected from real
                                                           students)
"""
import argparse
import csv
import json
import time
from collections import Counter
from pathlib import Path

import numpy as np

from ..engine import fallback
from ..engine.checker import check_attempt
from ..engine.matcher import match
from ..engine.parser import StepParseError, extract_math
from ..engine.pipeline import _as_equation, diagnose
from ..model.features import extract
from ..model.predict import predict
from ..model.train import DATA as DATASET_CSV, make_model

ROOT = Path(__file__).parents[2]
TRACES = ROOT / "member-4-content-teacher-pitch" / "data" / "evaluation_set.json"
OUT = Path(__file__).parent / "eval_results.json"
TRAINING_REPORT = Path(__file__).parents[1] / "model" / "training_report.json"

MISCONCEPTIONS = ["PARTIAL_DISTRIBUTION", "SQUARE_OF_SUM", "NEGATIVE_DISTRIBUTION",
                  "TRANSPOSITION", "UNLIKE_TERMS", "NEG_TIMES_NEG"]
LABELS = MISCONCEPTIONS + ["ARITHMETIC_SLIP", "UNKNOWN"]
NO_ERROR = {"NO_ERROR", "NONE", None}
MODEL_THRESHOLD = 0.60


def _norm(label):
    """Pipeline says 'unknown'; Member 3's panel says 'UNKNOWN'."""
    return "UNKNOWN" if label in (None, "unknown", "NONE") else label


def _question_text(equation: str) -> str:
    return equation if any(w in equation for w in ("Solve", "Simplify", "Expand", "Calculate", "Evaluate")) \
        else f"Solve {equation}"


def _error_pair(trace, error_index):
    """(previous line, wrong line) for the step the checker flagged."""
    prev = extract_math(_question_text(trace["equation"])) if error_index == 0 \
        else trace["student_steps"][error_index - 1]
    return prev, trace["student_steps"][error_index]


# ---------------------------------------------------------------- systems for the ablation
def rules_only(prev, student):
    if "=" not in prev or "=" not in student:
        prev, student = _as_equation(prev), _as_equation(student)
    found = match(prev, student)
    return found[0]["label"] if found else "unknown"


def model_only(prev, student):
    if "=" not in prev or "=" not in student:
        prev, student = _as_equation(prev), _as_equation(student)
    top = predict(prev, student, top_k=1)
    return top[0]["label"] if top and top[0]["prob"] >= MODEL_THRESHOLD else "unknown"


def llm_only(prev, student):
    result = fallback.classify(prev, student)
    return result["label"] if result else "unknown"


def hybrid(prev, student):
    return diagnose(prev, student)[0]["label"]


# ---------------------------------------------------------------- evaluation on test traces
def evaluate_traces(traces):
    step_hits, step_total = 0, 0
    pairs = []  # (truth, prev, student) for rows with a real error that the checker located
    for t in traces:
        truth_index = t.get("error_step_index")
        try:
            found = check_attempt(_question_text(t["equation"]), t["student_steps"]).error_step_index
        except StepParseError:
            found = "unparseable"
        step_total += 1
        step_hits += found == truth_index
        if truth_index is not None and found == truth_index and t["ground_truth_label"] not in NO_ERROR:
            pairs.append((t["ground_truth_label"], *_error_pair(t, found)))

    systems = {"Rules only": rules_only, "Model only": model_only, "Hybrid (full)": hybrid}
    if fallback.llm_available():
        systems["LLM only"] = llm_only
    predictions = {name: [_norm(fn(p, s)) for _, p, s in pairs] for name, fn in systems.items()}
    truths = [truth for truth, _, _ in pairs]

    index = {label: i for i, label in enumerate(LABELS)}
    matrix = [[0] * len(LABELS) for _ in LABELS]
    for truth, pred in zip(truths, predictions["Hybrid (full)"]):
        if truth in index:
            matrix[index[truth]][index[pred]] += 1

    accuracy = lambda preds: round(float(np.mean([p == t for p, t in zip(preds, truths)])), 4) if truths else None
    order = ["Rules only", "Model only", "LLM only", "Hybrid (full)"]
    return {
        "error_step_accuracy": round(step_hits / step_total, 4) if step_total else None,
        "diagnosis_accuracy": accuracy(predictions["Hybrid (full)"]),
        "unknown_rate": round(predictions["Hybrid (full)"].count("UNKNOWN") / len(truths), 4) if truths else None,
        "diagnosed_rows": len(truths),
        "confusion_matrix": matrix,
        "ablation": [{"system": n, "accuracy": accuracy(predictions[n])} for n in order if n in predictions],
        "llm_included": "LLM only" in predictions,
    }


# ---------------------------------------------------------------- leave one misconception out
def leave_one_out(rows, sample_per_label=150, seed=0):
    """Retrain without one misconception; how often are its examples sent to unknown
    (top probability below the trust threshold, or 'NONE') instead of a wrong label?"""
    X = np.array([extract(r["prev_step"], r["student_step"]) for r in rows])
    y = np.array([r["label"] for r in rows])
    rng = np.random.RandomState(seed)
    results = []
    for held in MISCONCEPTIONS:
        train = y != held
        model = make_model(150).fit(X[train], y[train])
        idx = np.where(y == held)[0]
        idx = rng.choice(idx, min(sample_per_label, len(idx)), replace=False)
        probs = model.predict_proba(X[idx])
        top = probs.argmax(axis=1)
        routed = (probs.max(axis=1) < MODEL_THRESHOLD) | (model.classes_[top] == "NONE")
        results.append({"held_out": held, "routed_to_unknown": round(float(routed.mean()), 4)})
    return results


# ---------------------------------------------------------------- main
def run(traces_are_real: bool = False, out: Path = OUT):
    t0 = time.time()
    with open(DATASET_CSV, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    traces = json.loads(TRACES.read_text(encoding="utf-8")) if TRACES.exists() else []
    report = json.loads(TRAINING_REPORT.read_text(encoding="utf-8")) if TRAINING_REPORT.exists() else {}

    trace_eval = evaluate_traces(traces) if traces else {}
    synthetic = Counter(r["label"] for r in rows)
    test_counts = Counter(t["ground_truth_label"] for t in traces)
    kind = "real" if traces_are_real else "hand_authored"

    summary = {
        "_note": ("Generated by backend/eval/run_eval.py. Test traces are "
                  + ("REAL student work." if traces_are_real else
                     "HAND-AUTHORED test cases, not collected from real students. "
                     "Do not present them as real student work.")),
        "test_traces_kind": kind,
        "headline": {
            "dataset_size": len(rows) + len(traces),
            "synthetic_rows": len(rows),
            "real_rows": len(traces) if traces_are_real else 0,
            "hand_authored_rows": 0 if traces_are_real else len(traces),
            "unseen_template_accuracy": report.get("unseen_templates", {}).get("model_accuracy"),
            "unseen_equation_accuracy": report.get("unseen_equations", {}).get("model_accuracy"),
            "baseline_unseen_template_accuracy": report.get("unseen_templates", {}).get("baseline_accuracy"),
            # Member 3's panel shows this as "accuracy on real student work", so it is
            # only filled in when the traces really are real.
            "real_trace_accuracy": trace_eval.get("diagnosis_accuracy") if traces_are_real else None,
            "test_trace_accuracy": trace_eval.get("diagnosis_accuracy"),
            "error_step_accuracy": trace_eval.get("error_step_accuracy"),
            "unknown_rate": trace_eval.get("unknown_rate"),
        },
        "labels": LABELS,
        "confusion_matrix": trace_eval.get("confusion_matrix"),
        "ablation": trace_eval.get("ablation", []),
        "llm_included_in_ablation": trace_eval.get("llm_included", False),
        "composition": [
            {"label": label,
             "synthetic": synthetic.get(label, 0),
             "real": test_counts.get(label, 0) if traces_are_real else 0,
             "hand_authored": 0 if traces_are_real else test_counts.get(label, 0)}
            for label in MISCONCEPTIONS + ["ARITHMETIC_SLIP", "NONE"]
        ],
        "leave_one_out": leave_one_out(rows),
        "diagnosed_test_rows": trace_eval.get("diagnosed_rows", 0),
        "seconds": round(time.time() - t0, 1),
    }
    out.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary


def main():
    ap = argparse.ArgumentParser(description="Build eval_results.json for GET /eval/summary")
    ap.add_argument("--traces-are-real", action="store_true",
                    help="only if evaluation_set.json was collected from real students")
    args = ap.parse_args()
    s = run(args.traces_are_real)
    h = s["headline"]
    pct = lambda v: "n/a" if v is None else f"{v:.1%}"
    print(f"Wrote {OUT}  ({s['seconds']}s)\n")
    print(f"Test traces: {s['test_traces_kind'].upper()}  ({h['real_rows'] or h['hand_authored_rows']} rows)")
    print(f"  finds the wrong step     {pct(h['error_step_accuracy'])}")
    print(f"  diagnosis accuracy       {pct(h['test_trace_accuracy'])}")
    print(f"  answered unknown         {pct(h['unknown_rate'])}")
    print(f"Unseen equation shapes     {pct(h['unseen_template_accuracy'])}  (baseline {pct(h['baseline_unseen_template_accuracy'])})")
    print("\nAblation:")
    for a in s["ablation"]:
        print(f"  {a['system']:15} {pct(a['accuracy'])}")
    if not s["llm_included_in_ablation"]:
        print("  (LLM only: skipped - no API key in .env)")
    print("\nLeave one misconception out (sent to unknown instead of a wrong label):")
    for l in s["leave_one_out"]:
        print(f"  {l['held_out']:22} {pct(l['routed_to_unknown'])}")


if __name__ == "__main__":
    main()

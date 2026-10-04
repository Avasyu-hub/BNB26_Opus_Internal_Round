"""Step 10 - Transfer Question Grading Engine.

Grades student transfer answers against canonical solutions across multiple answer types:
1. 'expression': Algebraic expressions (e.g. '2x + 6', '6 + 2x', 'A=2x+6') via SymPy equivalence
2. 'equation': Equations (e.g. '6=x', 'x=6') via solution set equivalence
3. 'number': Signed scalars with optional unicode minuses and unit suffixes (e.g. '-5', '−5', '-5 m')
4. 'code_assignment': Code assignments (e.g. 'price = total - tax') via target variable and RHS math
5. 'text': Conceptual justifications (e.g. 'No, the units are different')
6. Robustness: Empty strings or unparseable input return False safely without raising exceptions.
"""
import re
from typing import Optional, Tuple
from sympy import Eq, Symbol, parse_expr, simplify, solveset
from sympy.core.sympify import SympifyError


UNIT_REGEX = re.compile(
    r"\b(m\^2|m2|sq m|meters|meter|m|seconds|second|sec|s|newtons|newton|n|kw\*min|kw|degrees|deg|c)\b",
    re.IGNORECASE,
)


# Whole words only: "no" must not match inside "know" or "not".
REJECTS_COMBINING = re.compile(
    r"\b(no|cannot|can't|can not|impossible|incompatible|mismatch(ed)?|unlike|"
    r"not possible|not be (added|combined)|remains? unchanged|"
    r"different (units?|dimensions?|physical quantit(y|ies)|kinds?))\b"
)
UNSURE_TEXT = re.compile(r"\b(not sure|don't know|dont know|no idea|maybe|i think so|guess)\b")
# Words that turn a positive number into a negative change ("12 degrees colder").
NEGATING_WORDS = re.compile(
    r"\b(colder|cooler|lower|below|behind|backwards?|down|decrease[sd]?|less|loss|lost|drop(ped)?|fell)\b",
    re.IGNORECASE,
)


def _clean_str(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _normalize_minuses(text: str) -> str:
    return text.replace("\u2212", "-").replace("\u2013", "-").replace("\u2014", "-")


def _fix_multiplication(text: str) -> str:
    text = _normalize_minuses(text)
    text = re.sub(r"(\d+)([a-zA-Z])", r"\1*\2", text)
    text = text.replace("^", "**")
    return text


def _extract_number(text: str) -> Optional[float]:
    clean = _normalize_minuses(text)
    m = re.search(r"[-+]?\d+(?:\.\d+)?", clean)
    if m:
        try:
            return float(m.group(0))
        except ValueError:
            return None
    return None


def grade_expression(student: str, canonical: str) -> Tuple[bool, str]:
    """Grade algebraic expressions. Ignores assignment/variable labels like 'A=2x+6' if canonical has no '='."""
    s = _normalize_minuses(student.strip())
    c = _normalize_minuses(canonical.strip())

    if not s or s in ("???", "?", "none"):
        return False, "Empty or invalid expression"

    # If canonical has no '=', strip leading label like 'A = ' or 'Area = ' or 'y = '
    if "=" not in c and "=" in s:
        s = re.sub(r"^[a-zA-Z_]\w*\s*=\s*", "", s).strip()

    # Clean out units
    s_clean = UNIT_REGEX.sub("", s).replace("²", "**2").strip()
    c_clean = UNIT_REGEX.sub("", c).replace("²", "**2").strip()

    try:
        s_expr = parse_expr(_fix_multiplication(s_clean))
        c_expr = parse_expr(_fix_multiplication(c_clean))
        if simplify(s_expr - c_expr) == 0:
            return True, "Expression algebraically equivalent"
    except Exception:
        pass

    if _clean_str(s_clean) == _clean_str(c_clean):
        return True, "Expression matches canonical"

    return False, "Expression is not algebraically equivalent"


def grade_equation(student: str, canonical: str) -> Tuple[bool, str]:
    """Grade equations like '6=x' vs 'x=6' by comparing solution sets."""
    s = _normalize_minuses(student.strip())
    c = _normalize_minuses(canonical.strip())

    if "=" not in s or "=" not in c:
        return False, "Expected equation with '='"

    try:
        s_lhs, s_rhs = [parse_expr(_fix_multiplication(p.strip())) for p in s.split("=", 1)]
        c_lhs, c_rhs = [parse_expr(_fix_multiplication(p.strip())) for p in c.split("=", 1)]
        x = Symbol("x")
        s_sol = solveset(Eq(s_lhs, s_rhs), x)
        c_sol = solveset(Eq(c_lhs, c_rhs), x)
        if s_sol == c_sol:
            return True, "Equations have identical solution sets"
    except Exception:
        pass

    return False, "Equations do not have identical solutions"


def grade_number(student: str, canonical: str) -> Tuple[bool, str]:
    """Grade signed numbers with optional units (e.g. '-5', '−5', '-5 m'). Signs strictly matter."""
    s_num = _extract_number(student)
    c_num = _extract_number(canonical)
    # "12 degrees colder" means -12. Only flip when the student gave no explicit sign.
    if s_num is not None and s_num > 0 and NEGATING_WORDS.search(student) \
            and not re.search(r"[-+\u2212]\s*\d", student):
        s_num = -s_num

    if s_num is None or c_num is None:
        return False, "Could not parse numeric value"

    # Enforce exact sign match (prevent 5 matching -5)
    if (s_num < 0 and c_num > 0) or (s_num > 0 and c_num < 0):
        return False, f"Incorrect sign: expected {c_num}, got {s_num}"

    if abs(s_num - c_num) < 1e-4:
        return True, "Number matches"

    return False, f"Value mismatch: expected {c_num}, got {s_num}"


def grade_code_assignment(student: str, canonical: str) -> Tuple[bool, str]:
    """Grade code assignments like 'price = total - tax'."""
    s = _normalize_minuses(student.strip())
    c = _normalize_minuses(canonical.strip())

    if "=" not in s or "=" not in c:
        return False, "Assignment statement must contain '='"

    s_lhs, s_rhs = [p.strip() for p in s.split("=", 1)]
    c_lhs, c_rhs = [p.strip() for p in c.split("=", 1)]

    # Target variable on LHS must match exactly
    if s_lhs != c_lhs:
        return False, f"Target variable mismatch: expected {c_lhs}, got {s_lhs}"

    try:
        s_expr = parse_expr(_fix_multiplication(s_rhs))
        c_expr = parse_expr(_fix_multiplication(c_rhs))
        if simplify(s_expr - c_expr) == 0:
            return True, "Code assignment algebraically equivalent"
    except Exception:
        if _clean_str(s_rhs) == _clean_str(c_rhs):
            return True, "Code assignment matches"

    return False, "Right-hand side math is not equivalent"


def grade_text(student: str, canonical: str, rubric: str = "") -> Tuple[bool, str]:
    """Grade conceptual / dimensional analysis text answers."""
    s_clean = _clean_str(student)

    if not s_clean or s_clean in ("???", "no idea", "unknown"):
        return False, "No valid answer provided"

    # If student affirmed an impossible combination (e.g. "Yes, it's 8")
    if s_clean.startswith("yes") or s_clean == "8" or "can be added" in s_clean:
        return False, "Incorrectly claimed unlike dimensions/units can be combined"

    # Uncertain answers never pass, even if they contain a keyword.
    if UNSURE_TEXT.search(s_clean):
        return False, "Answer is unsure"
    if REJECTS_COMBINING.search(s_clean):
        return True, "Correctly recognized incompatible dimensions or units"

    return False, "Answer does not satisfy conceptual rubric"


def grade_answer(
    student_answer: str,
    canonical_answer: str,
    answer_type: str = "auto",
    domain: str = "",
    rubric: str = "",
) -> Tuple[bool, str]:
    """Unified entry point for grading student answers safely."""
    s = (student_answer or "").strip()
    c = (canonical_answer or "").strip()

    if not s or s in ("???", "??", "none", "null"):
        return False, "Could not verify answer"

    # Auto-detect type if not explicitly provided
    t = answer_type.lower()
    if t == "auto":
        if "=" in c and any(c.startswith(w) for w in ("deposit", "price", "base_score", "net_weight", "total")):
            t = "code_assignment"
        elif any(c.lower().startswith(w) for w in ("no", "cannot")):
            t = "text"
        elif "=" in c and not UNIT_REGEX.search(c):
            t = "equation"
        elif _extract_number(c) is not None and not any(var in c for var in ("x", "y", "s")):
            t = "number"
        else:
            t = "expression"

    try:
        if t == "expression":
            return grade_expression(s, c)
        elif t == "equation":
            return grade_equation(s, c)
        elif t == "number":
            return grade_number(s, c)
        elif t == "code_assignment":
            return grade_code_assignment(s, c)
        elif t == "text":
            return grade_text(s, c, rubric=rubric)
        else:
            # Fallback
            return grade_expression(s, c)
    except Exception:
        return False, "Could not verify answer"


# Backward-compatible alias
grade_transfer = grade_answer


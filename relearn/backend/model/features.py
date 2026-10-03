"""Step 8 - Feature extraction for the misconception classifier.

Turns a (prev_step, student_step) pair into a fixed vector of numbers that
capture each misconception's signature: what happened to the brackets, how
the polynomial changed, and how the numbers relate (products, sums, signs).
"""
import re
from functools import lru_cache
from itertools import combinations

from sympy import Poly, Symbol, expand

from ..engine.parser import parse_line

X = Symbol("x")
NUM = re.compile(r"\d+")

FEATURE_NAMES = [
    # structure of the previous step
    "p_bracket", "p_sq_bracket", "p_neg_bracket", "p_coef_bracket", "p_neg_times_neg",
    "p_terms", "p_degree",
    # structure of the student step
    "s_bracket", "s_power", "s_terms", "s_degree", "s_rhs_has_op", "s_lhs_single_term",
    "terms_change", "len_ratio",
    # polynomial comparison (both rewritten as lhs - rhs = 0)
    "scale", "res2", "res1", "res0", "equivalent", "x_coef_ratio", "x_coef_sign_flip",
    "lost_x_term", "const_ratio",
    # solutions (linear steps)
    "both_linear", "root_diff", "root_sign_flip", "root_is_integer",
    # how the student's numbers relate to the previous numbers
    "shared_numbers", "has_product", "has_sum", "has_difference", "new_numbers",
]


@lru_cache(maxsize=None)
def _poly(step: str):
    """Coefficients (c2, c1, c0) of lhs - rhs, degree, and parsed sides."""
    line = parse_line(step, 0)
    poly = Poly(expand(line.lhs - line.rhs), X)
    coeffs = [float(c) for c in poly.all_coeffs()]
    coeffs = [0.0] * (3 - len(coeffs)) + coeffs if len(coeffs) <= 3 else coeffs[-3:]
    return tuple(coeffs), poly.degree()


def _terms(step: str) -> int:
    """Number of +/- separated terms on both sides."""
    return sum(len(re.findall(r"(?<![(^=])[+-]", "=" + side)) + 1 for side in step.split("="))


def _numbers(step: str) -> list[int]:
    return [int(n) for n in NUM.findall(step)]


def extract(prev: str, student: str) -> list[float]:
    f = dict.fromkeys(FEATURE_NAMES, 0.0)
    lhs_s, _, rhs_s = student.partition("=")

    f["p_bracket"] = float("(" in prev)
    f["p_sq_bracket"] = float(")^2" in prev)
    f["p_neg_bracket"] = float("-(" in prev)
    f["p_coef_bracket"] = float(bool(re.search(r"\d\(", prev)))
    f["p_neg_times_neg"] = float(prev.count("(-") >= 2)
    f["p_terms"] = _terms(prev)
    f["s_bracket"] = float("(" in student)
    f["s_power"] = float("^" in student)
    f["s_terms"] = _terms(student)
    f["s_rhs_has_op"] = float(bool(re.search(r"(?<!^)[+\-*/]", rhs_s)))
    f["s_lhs_single_term"] = float(bool(re.fullmatch(r"-?\d*x(\^\d)?|-?\d+", lhs_s)))
    f["terms_change"] = f["s_terms"] - f["p_terms"]
    f["len_ratio"] = len(student) / max(len(prev), 1)

    try:
        (p2, p1, p0), pd = _poly(prev)
        (s2, s1, s0), sd = _poly(student)
    except Exception:
        return [f[n] for n in FEATURE_NAMES]
    f["p_degree"], f["s_degree"] = pd, sd

    # best scale k so that student ~ k * prev (correct steps differ only by k)
    k = s2 / p2 if p2 else s1 / p1 if p1 else s0 / p0 if p0 else 1.0
    if k == 0:
        k = 1.0
    norm = max(abs(p2), abs(p1), abs(p0), 1.0)
    r2, r1, r0 = (s2 - k * p2) / norm, (s1 - k * p1) / norm, (s0 - k * p0) / norm
    f.update(scale=k, res2=r2, res1=r1, res0=r0)
    f["equivalent"] = float(abs(r2) + abs(r1) + abs(r0) < 1e-9)
    if p1:
        f["x_coef_ratio"] = s1 / p1
        f["x_coef_sign_flip"] = float(s1 * p1 < 0)
    f["lost_x_term"] = float(p1 != 0 and s1 == 0)
    if p0:
        f["const_ratio"] = s0 / p0

    if pd == 1 and sd == 1 and p1 and s1:
        rp, rs = -p0 / p1, -s0 / s1
        f["both_linear"] = 1.0
        f["root_diff"] = rs - rp
        f["root_sign_flip"] = float(rp != 0 and abs(rs + rp) < 1e-9)
        f["root_is_integer"] = float(abs(rs - round(rs)) < 1e-9)

    pn, sn = _numbers(prev), _numbers(student)
    sset, pset = set(sn), set(pn)
    f["shared_numbers"] = len(sset & pset) / max(len(sset), 1)
    f["new_numbers"] = len(sset - pset)
    pairs = list(combinations(pn, 2))
    f["has_product"] = float(any(a * b in sset for a, b in pairs if a > 1 and b > 1))
    f["has_sum"] = float(any(a + b in sset for a, b in pairs))
    f["has_difference"] = float(any(abs(a - b) in sset for a, b in pairs if a != b))
    return [f[n] for n in FEATURE_NAMES]

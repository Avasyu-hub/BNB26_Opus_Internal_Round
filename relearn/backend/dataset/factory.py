"""Step 7 - Dataset factory.

Builds the training dataset for the misconception classifier:
    (prev_step, student_step) -> label

For every sampled equation we know the correct next step, so we can make:
  NONE            the correct next step
  <misconception> each generator applied to the previous step
  ARITHMETIC_SLIP the correct next step with one number wrong
  combined        each linear row simplified one step further (same label),
                  so the model cannot learn "unsimplified = wrong"

Run:  python -m backend.dataset.factory --seed 42
"""
import argparse
import csv
import random
from collections import Counter, defaultdict
from pathlib import Path

from functools import lru_cache

from sympy import Poly, S, Symbol, expand
from sympy.sets.conditionset import ConditionSet

from ..engine.checker import solution_set
from ..engine.generators import GENERATORS
from ..engine.parser import StepParseError, parse_line

X = Symbol("x")
OUT_PATH = Path(__file__).parents[1] / "data" / "misconception_dataset.csv"
LABELS = ["NONE", "PARTIAL_DISTRIBUTION", "SQUARE_OF_SUM", "NEGATIVE_DISTRIBUTION",
          "TRANSPOSITION", "UNLIKE_TERMS", "NEG_TIMES_NEG", "ARITHMETIC_SLIP"]
MISCONCEPTIONS = [l for l in LABELS if l not in ("NONE", "ARITHMETIC_SLIP")]
COLUMNS = ["row_id", "template_id", "prev_step", "student_step", "label", "variant", "source"]


# ---------------------------------------------------------------- formatting
def num(n: int) -> str:
    """Signed number for joining: 5 -> '+5', -5 -> '-5'."""
    return f"+{n}" if n >= 0 else str(n)


def coef_x(k: int, power: str = "") -> str:
    """Leading term: 1 -> 'x', -1 -> '-x', 3 -> '3x'."""
    v = f"x{power}"
    return v if k == 1 else f"-{v}" if k == -1 else f"{k}{v}"


def signed_x(k: int, power: str = "") -> str:
    """Non-leading term: 1 -> '+x', -2 -> '-2x'."""
    t = coef_x(k, power)
    return t if t.startswith("-") else "+" + t


# ---------------------------------------------------------------- templates
# Each returns (prev_step, correct_next). x0 is the hidden integer solution,
# so every equation has a clean answer.
def _x0(rng):
    return rng.randint(-6, 10)


def t01(rng):  # a(x+b)=c
    a, b, x0 = rng.randint(2, 9), rng.randint(1, 9), _x0(rng)
    c = a * (x0 + b)
    return f"{a}(x+{b})={c}", f"{a}x{num(a * b)}={c}"


def t02(rng):  # a(x-b)=c
    a, b, x0 = rng.randint(2, 9), rng.randint(1, 9), _x0(rng)
    c = a * (x0 - b)
    return f"{a}(x-{b})={c}", f"{a}x-{a * b}={c}"


def t03(rng):  # -a(x+b)=c
    a, b, x0 = rng.randint(2, 9), rng.randint(1, 9), _x0(rng)
    c = -a * (x0 + b)
    return f"-{a}(x+{b})={c}", f"-{a}x-{a * b}={c}"


def t04(rng):  # -(x+b)=c
    b, x0 = rng.randint(1, 12), _x0(rng)
    c = -(x0 + b)
    return f"-(x+{b})={c}", f"-x-{b}={c}"


def t05(rng):  # c-(x+b)=d
    c, b, x0 = rng.randint(2, 12), rng.randint(1, 9), _x0(rng)
    d = c - (x0 + b)
    return f"{c}-(x+{b})={d}", f"{c}-x-{b}={d}"


def t06(rng):  # (x+a)^2=c
    a, x0 = rng.randint(1, 12), rng.randint(-5, 15)
    c = (x0 + a) ** 2
    return f"(x+{a})^2={c}", f"x^2+{2 * a}x+{a * a}={c}"


def t07(rng):  # (x-a)^2=c
    a, x0 = rng.randint(1, 12), rng.randint(-5, 15)
    c = (x0 - a) ** 2
    return f"(x-{a})^2={c}", f"x^2-{2 * a}x+{a * a}={c}"


def t08(rng):  # x+a=b
    a, x0 = rng.randint(1, 12), _x0(rng)
    b = x0 + a
    return f"x+{a}={b}", f"x={b}-{a}"


def t09(rng):  # x-a=b
    a, x0 = rng.randint(1, 12), _x0(rng)
    b = x0 - a
    return f"x-{a}={b}", f"x={b}+{a}"


def t10(rng):  # ax+b=c
    a, b, x0 = rng.randint(2, 9), rng.randint(1, 12), _x0(rng)
    c = a * x0 + b
    return f"{a}x+{b}={c}", f"{a}x={c}-{b}"


def t11(rng):  # b=x+a
    a, x0 = rng.randint(1, 12), _x0(rng)
    b = x0 + a
    return f"{b}=x+{a}", f"{b}-{a}=x"


def t12(rng):  # (-a)(-bx)=c
    a, b, x0 = rng.randint(2, 9), rng.randint(1, 9), rng.choice([i for i in range(-9, 10) if i])
    c = a * b * x0
    bx = "x" if b == 1 else f"{b}x"  # (-3)(-x) as well as (-3)(-2x)
    return f"(-{a})(-{bx})={c}", f"{a * b}x={c}"


def t13(rng):  # a(x+b)+dx=e
    a, b, d, x0 = rng.randint(2, 6), rng.randint(1, 6), rng.randint(1, 5), _x0(rng)
    e = a * (x0 + b) + d * x0
    return f"{a}(x+{b}){signed_x(d)}={e}", f"{a}x{num(a * b)}{signed_x(d)}={e}"


# T06/T07 are the only source of SQUARE_OF_SUM and T12 of NEG_TIMES_NEG,
# and those rows have no "combined" variant, so they are sampled more.
SAMPLE_WEIGHT = {"T06": 2, "T07": 2, "T12": 5}

TEMPLATES = {f"T{i:02d}": f for i, f in enumerate(
    [t01, t02, t03, t04, t05, t06, t07, t08, t09, t10, t11, t12, t13], start=1)}


# ---------------------------------------------------------------- combined variant
def combine_one_step(step: str):
    """Simplify a linear equation one step further: '2x+3=14' -> '2x=11',
    and 'kx=m' -> 'x=m/k'. None if not linear or nothing changes."""
    try:
        line = parse_line(step, 0)
        poly = Poly(expand(line.lhs - line.rhs), X)
    except Exception:
        return None
    if poly.degree() != 1:
        return None
    k, c = poly.all_coeffs()  # k*x + c = 0  ->  k*x = -c
    if not k.is_integer:
        return None
    k, m = int(k), -c
    result = f"{coef_x(k)}={m}"
    if result == step and k != 1:
        result = f"x={m / k}"  # already kx=m: go one step further to x=m/k
    return None if result == step else result


# ---------------------------------------------------------------- generation
def _raw_rows(seed: int, per_template: int):
    rng = random.Random(seed)
    slip = GENERATORS["ARITHMETIC_SLIP"]
    for tid, template in TEMPLATES.items():
        for _ in range(per_template * SAMPLE_WEIGHT.get(tid, 1)):
            prev, correct = template(rng)
            candidates = [("NONE", correct)]
            for label in MISCONCEPTIONS:
                out = GENERATORS[label](prev)
                if out:
                    candidates.append((label, out))
            slipped = slip(correct, rng)  # slip the CORRECT step, not prev
            if slipped:
                candidates.append(("ARITHMETIC_SLIP", slipped))
            for label, student in candidates:
                yield tid, prev, student, label, "direct"
                combined = combine_one_step(student)
                if combined:
                    yield tid, prev, combined, label, "combined"


@lru_cache(maxsize=None)
def solutions(step: str):
    """Real solution set of an equation, fast for polynomials (degree <= 2).
    Returns a frozenset of roots, "ALL" (identity) or raises on failure."""
    line = parse_line(step, 0)
    expr = expand(line.lhs - line.rhs)
    try:
        poly = Poly(expr, X)
    except Exception:
        poly = None
    if poly is not None:
        if poly.is_zero:
            return "ALL"
        if poly.degree() > 2:
            raise ValueError("degree above 2 is out of scope")
        return frozenset(poly.real_roots())
    result = solution_set(line, X)  # slow general fallback (non-polynomial)
    if isinstance(result, ConditionSet):
        raise ValueError("cannot verify")
    return "ALL" if result == S.Reals else frozenset(result)


def _validate(prev: str, student: str, label: str):
    """Return None if the row is valid, else the reason it is dropped."""
    if " " in student or "1*" in student or "+-" in student:
        return "bad_format"
    if student == prev:
        return "unchanged"
    try:
        sp, ss = solutions(prev), solutions(student)
    except StepParseError:
        return "parse_error"
    except Exception:
        return "cannot_verify"
    if label == "NONE" and sp != ss:
        return "none_not_equivalent"
    if label != "NONE" and sp == ss:
        return "wrong_step_is_equivalent"
    return None


def build(seed: int = 42, per_template: int = 200, cap: int = 800, min_per_label: int = 300):
    dropped = Counter()
    seen = {}
    labels_for = defaultdict(set)
    for tid, prev, student, label, variant in _raw_rows(seed, per_template):
        reason = _validate(prev, student, label)
        if reason:
            dropped[reason] += 1
            continue
        key = (prev, student)
        labels_for[key].add(label)
        seen.setdefault((prev, student, label), (tid, prev, student, label, variant))

    conflicts = {k for k, v in labels_for.items() if len(v) > 1}
    rows = [r for (p, s, l), r in seen.items() if (p, s) not in conflicts]

    # balance: downsample any label above `cap`
    rng = random.Random(seed + 1)
    by_label = defaultdict(list)
    for r in rows:
        by_label[r[3]].append(r)
    final = []
    for label in LABELS:
        group = sorted(by_label[label])
        if len(group) > cap:
            group = rng.sample(group, cap)
        final.extend(group)
    rng.shuffle(final)

    table = [
        {"row_id": i + 1, "template_id": t, "prev_step": p, "student_step": s,
         "label": l, "variant": v, "source": "synthetic"}
        for i, (t, p, s, l, v) in enumerate(final)
    ]
    summary = {
        "rows": len(table),
        "per_label": Counter(r["label"] for r in table),
        "per_template": Counter(r["template_id"] for r in table),
        "per_variant": Counter(r["variant"] for r in table),
        "dropped": dropped,
        "conflicts": len(conflicts),
        "below_minimum": [l for l in LABELS if Counter(r["label"] for r in table)[l] < min_per_label],
    }
    return table, summary


def write_csv(table, path: Path = OUT_PATH):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(table)


def print_summary(summary, path):
    print(f"Wrote {summary['rows']} rows -> {path}\n")
    print("Rows per label:")
    for label in LABELS:
        print(f"  {label:22} {summary['per_label'][label]}")
    print("\nRows per template:", dict(sorted(summary["per_template"].items())))
    print("Rows per variant: ", dict(summary["per_variant"]))
    print("Dropped rows:     ", dict(summary["dropped"]) or "none")
    print("Conflicts dropped:", summary["conflicts"])
    if summary["below_minimum"]:
        print("WARNING - labels below minimum:", summary["below_minimum"])


def main():
    ap = argparse.ArgumentParser(description="Build misconception_dataset.csv")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--per-template", type=int, default=200)
    ap.add_argument("--cap", type=int, default=800)
    ap.add_argument("--out", type=Path, default=OUT_PATH)
    args = ap.parse_args()
    table, summary = build(args.seed, args.per_template, args.cap)
    write_csv(table, args.out)
    print_summary(summary, args.out)


if __name__ == "__main__":
    main()

"""Tests for Step 7 - dataset factory (small sample for speed)."""
import random

import pytest

from backend.dataset.factory import LABELS, TEMPLATES, build, combine_one_step, solutions
from backend.engine.generators import GENERATORS


@pytest.fixture(scope="module")
def small():
    return build(seed=7, per_template=4, cap=10_000, min_per_label=0)


def test_same_seed_same_output():
    a, _ = build(seed=3, per_template=2, cap=10_000, min_per_label=0)
    b, _ = build(seed=3, per_template=2, cap=10_000, min_per_label=0)
    assert a == b


def test_all_labels_present(small):
    table, _ = small
    assert {r["label"] for r in table} == set(LABELS)


def test_student_style_format(small):
    table, _ = small
    for r in table:
        s = r["student_step"]
        assert " " not in s and "1*" not in s and "+-" not in s, s


def test_labels_agree_with_solution_sets(small):
    table, _ = small
    for r in table:
        same = solutions(r["prev_step"]) == solutions(r["student_step"])
        assert same == (r["label"] == "NONE"), r


def test_no_conflicting_labels(small):
    table, _ = small
    seen = {}
    for r in table:
        key = (r["prev_step"], r["student_step"])
        assert seen.setdefault(key, r["label"]) == r["label"]


def test_every_template_produces_a_correct_step():
    rng = random.Random(0)
    for tid, template in TEMPLATES.items():
        prev, correct = template(rng)
        assert solutions(prev) == solutions(correct), tid


@pytest.mark.parametrize("step,expected", [
    ("2x+3=14", "2x=11"),
    ("x=10+5", "x=15"),
    ("3x=12", "x=4"),
    ("x^2+4=25", None),   # not linear
    ("x=5", None),        # nothing left to simplify
])
def test_combine_one_step(step, expected):
    assert combine_one_step(step) == expected


# ---- the two generator patches this step depends on ----
def test_partial_distribution_ignores_coefficient_minus_one():
    assert GENERATORS["PARTIAL_DISTRIBUTION"]("7-(x+2)=1") is None
    assert GENERATORS["PARTIAL_DISTRIBUTION"]("-(x+3)=5") is None


def test_arithmetic_slip_never_changes_an_exponent():
    for seed in range(30):
        out = GENERATORS["ARITHMETIC_SLIP"]("x^2+6x+9=49", random.Random(seed))
        assert out.startswith("x^2"), out

"""Run from project root:  pytest -q"""
import json
import os
import tempfile
from pathlib import Path

import pytest

os.environ["RELEARN_DB"] = str(Path(tempfile.mkdtemp()) / "test.db")

from backend.engine.checker import check_attempt  # noqa: E402
from backend.engine.parser import StepParseError, extract_math, parse_line  # noqa: E402

DATASET = Path(__file__).parents[1] / "data" / "relearn_dataset"
ITEMS = json.loads((DATASET / "items.json").read_text(encoding="utf-8"))


# ---------- parser ----------
def test_unicode_minus_and_implicit_multiplication():
    line = parse_line("\u22123(x \u2212 4) = 18", 0)
    assert str(line.lhs - line.rhs) == "-3*x - 6"


def test_prose_is_rejected_with_line_index():
    with pytest.raises(StepParseError) as e:
        parse_line("Subtract 5 from both sides", 2)
    assert e.value.line_index == 2


def test_broken_line_is_rejected():
    with pytest.raises(StepParseError):
        parse_line("2x+=3", 0)


@pytest.mark.parametrize("question,expected", [
    ("Solve: -3(x - 4) = 18.", "-3(x-4)=18"),
    ("Solve 2(x+3)=14", "2(x+3)=14"),
    ("Solve: x + 5 = 12. Show the operation used to undo +5.", "x+5=12"),
    ("Evaluate: 2^3 + 4*2.", "2^3+4*2"),
])
def test_extract_math(question, expected):
    assert extract_math(question) == expected


# ---------- checker: every answer key in the dataset must check as correct ----------
@pytest.mark.parametrize("item", ITEMS, ids=[q["id"] for q in ITEMS])
def test_dataset_answer_keys(item):
    try:
        extract_math(item["question"])
    except StepParseError:
        pytest.skip("no parseable maths (conceptual item)")
    answer = item["correct_answer"].replace(" ", "")
    result = check_attempt(item["question"], [answer])
    assert result.status == "correct", (item["id"], result.trace)


# ---------- checker: wrong traces built from the response matrix ----------
@pytest.mark.parametrize("question,steps,expected_index", [
    ("Solve 2(x+3)=14", ["2x+3=14", "2x=11", "x=5.5"], 0),             # partial distribution
    ("Solve: 3(x + 2) = 21.", ["3x+2=21", "3x=19", "x=19/3"], 0),       # Q02 / M02
    ("Solve: -3(x - 4) = 18.", ["-3x-12=18", "-3x=30", "x=-10"], 0),    # Q01 / true sign error
    ("Solve: x + 5 = 12.", ["x=12+5", "x=17"], 0),                      # Q03 / M03
    ("Solve: -2(x + 3) = 8.", ["-2x-6=8", "-2x=2", "x=-1"], 1),          # Q16 / slip at step 1
    ("Evaluate: 2^3 + 4*2.", ["8+4*2", "12*2", "24"], 1),              # Q12 / M12 left-to-right
    ("Simplify: 2x + 3x + 4.", ["9x"], 0),                              # Q15 / M05
])
def test_wrong_traces(question, steps, expected_index):
    result = check_attempt(question, steps)
    assert result.status == "step_error"
    assert result.error_step_index == expected_index


def test_correct_but_unfinished_is_incomplete():
    assert check_attempt("Solve 2(x+3)=14", ["2x+6=14", "2x=8"]).status == "incomplete"


# ---------- API ----------
def test_attempt_endpoint():
    from fastapi.testclient import TestClient
    from backend.main import app

    with TestClient(app) as client:
        assert client.get("/health").json()["status"] == "ok"
        assert len(client.get("/questions").json()) > 0

        body = {"student_id": "s_07", "question_id": "PD_02",
                "question": "Solve 2(x+3)=14", "steps": ["2x+3=14", "2x=11", "x=5.5"]}
        r = client.post("/attempt", json=body)
        assert r.status_code == 200
        data = r.json()
        assert data["error_step_index"] == 0 and data["stage"] == "diagnosed"

        bad = {**body, "steps": ["2x+6=14", "2x=+"]}
        r = client.post("/attempt", json=bad)
        assert r.status_code == 422 and r.json()["detail"]["line_index"] == 1

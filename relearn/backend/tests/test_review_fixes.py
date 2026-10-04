"""Regression tests for the Step 10 review fixes."""
import pytest
from fastapi.testclient import TestClient

from backend.engine.transfer_grader import grade_answer
from backend.main import app


# ---- text grading: whole words only, unsure answers never pass ----
@pytest.mark.parametrize("answer,expected", [
    ("No, the units are different", True),
    ("They cannot be added", True),
    ("3x+5 stays as it is because they are unlike terms", True),
    ("I don't know", False),            # "no" inside "know"
    ("not sure, maybe 8x", False),      # "no" inside "not"
    ("you know it's 11", False),
    ("Yes, it's 8", False),
])
def test_text_grading(answer, expected):
    ok, _ = grade_answer(answer, "No; units mismatch. 3x + 5 remains unchanged.", "text")
    assert ok is expected


# ---- number grading: direction words change the sign ----
@pytest.mark.parametrize("answer,expected", [
    ("12", True), ("+12", True), ("12 degrees warmer", True),
    ("12 degrees colder", False), ("-12", False),
])
def test_number_direction_words(answer, expected):
    ok, _ = grade_answer(answer, "+12 (12°C warmer)", "number")
    assert ok is expected


# ---- recurrence and streak ----
def _journey(client, student):
    post = lambda path, body: client.post(path, json={"student_id": student, **body}).json()
    post("/attempt", {"question_id": "PD_01", "question": "Solve 3(x+4)=21", "steps": ["3x+4=21"]})
    post("/retry", {"question_id": "PD_01_R1", "steps": ["4x+8=24", "4x=16", "x=4"]})
    return post


def test_mistake_during_transfer_counts_as_recurred():
    with TestClient(app) as client:
        post = _journey(client, "fix_recur")
        assert post("/transfer", {"question_id": "PD_01_T1", "answer": "3x+12"})["stage"] == "transfer_in_progress"
        again = post("/attempt", {"question_id": "PD_02", "question": "Solve 2(x+3)=14", "steps": ["2x+3=14"]})
        assert again["stage"] == "recurred"


def test_a_new_mistake_breaks_the_transfer_streak():
    with TestClient(app) as client:
        post = _journey(client, "fix_streak")
        post("/transfer", {"question_id": "PD_01_T1", "answer": "3x+12"})                       # pass 1
        post("/attempt", {"question_id": "PD_02", "question": "Solve 2(x+3)=14", "steps": ["2x+3=14"]})  # mistake
        post("/retry", {"question_id": "PD_01_R1", "steps": ["4x+8=24", "4x=16", "x=4"]})
        r = post("/transfer", {"question_id": "PD_02_T1", "answer": "2x+6"})                     # only 1 pass since
        assert r["stage"] == "transfer_in_progress" and r["transfer_verified"] is False


def test_correct_retry_never_calls_the_diagnosis_pipeline(monkeypatch):
    import backend.main as main
    def must_not_run(*a):
        raise AssertionError("a fully correct retry must not be re-diagnosed")
    monkeypatch.setattr(main, "_safe_diagnose", must_not_run)
    with TestClient(app) as client:
        r = client.post("/retry", json={"student_id": "fix_retry", "question_id": "PD_01_R1",
                                        "steps": ["4x+8=24", "4x=16", "x=4"]}).json()
    assert r["stage"] == "retry_passed"

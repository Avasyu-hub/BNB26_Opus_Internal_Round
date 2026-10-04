"""Step 10 Complete Acceptance Criteria Test Suite (test_flow.py).

Implements all 5 test groups from the Acceptance Criteria:
A. Answer grading (unit tests, no server needed)
B. /retry tests (including 'right answer, wrong working' and 'unfinished')
C. /transfer tests (2 consecutive passes policy, bridge explanations)
D. Recurrence and profile tests (recurred vs still active, arithmetic slips ignored)
E. Question bank checks (every diagnostic, retry, and transfer question verified)
"""
import json
import os
import tempfile
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Isolated database for test_flow
os.environ["RELEARN_DB"] = str(Path(tempfile.mkdtemp()) / "test_flow.db")

from backend.main import app, QUESTIONS  # noqa: E402
from backend import database as db  # noqa: E402
from backend.engine.checker import check_attempt  # noqa: E402
from backend.engine.parser import StepParseError, extract_math, parse_line  # noqa: E402
from backend.engine.transfer_grader import grade_answer  # noqa: E402

TAXONOMY_LABELS = {
    "PARTIAL_DISTRIBUTION",
    "SQUARE_OF_SUM",
    "NEGATIVE_DISTRIBUTION",
    "TRANSPOSITION",
    "UNLIKE_TERMS",
    "NEG_TIMES_NEG",
}


@pytest.fixture(autouse=True)
def clean_database():
    db.init_db()


# ===========================================================================
# GROUP A: Answer grading (unit tests, no server needed)
# ===========================================================================

def test_grade_expression_order_invariant():
    ok, _ = grade_answer("6+2x", "2x+6", "expression")
    assert ok is True


def test_grade_expression_label_prefix_ignored():
    ok, _ = grade_answer("A=2x+6", "2x+6", "expression")
    assert ok is True


def test_grade_expression_wrong_value():
    ok, _ = grade_answer("2x+3", "2x+6", "expression")
    assert ok is False


def test_grade_equation_commute():
    ok, _ = grade_answer("6=x", "x=6", "equation")
    assert ok is True


def test_grade_equation_wrong_sign():
    ok, _ = grade_answer("x=-6", "x=6", "equation")
    assert ok is False


def test_grade_number_unicode_and_units():
    assert grade_answer("-5", "-5", "number")[0] is True
    assert grade_answer("\u22125", "-5", "number")[0] is True
    assert grade_answer("-5 m", "-5", "number")[0] is True


def test_grade_number_sign_matters():
    ok, _ = grade_answer("5", "-5", "number")
    assert ok is False


def test_grade_code_assignment_exact():
    ok, _ = grade_answer("price = total - tax", "price = total - tax", "code_assignment")
    assert ok is True


def test_grade_code_assignment_commute_math():
    ok, _ = grade_answer("price=-tax+total", "price = total - tax", "code_assignment")
    assert ok is True


def test_grade_code_assignment_wrong_math():
    ok, _ = grade_answer("price = total + tax", "price = total - tax", "code_assignment")
    assert ok is False


def test_grade_code_assignment_wrong_variable():
    ok, _ = grade_answer("cost = total - tax", "price = total - tax", "code_assignment")
    assert ok is False


def test_grade_text_valid_rubric():
    ok, _ = grade_answer(
        "No, the units are different",
        "No; units mismatch. 3x + 5 remains unchanged.",
        "text",
    )
    assert ok is True


def test_grade_text_invalid_affirmation():
    ok, _ = grade_answer(
        "Yes, it's 8",
        "No; units mismatch. 3x + 5 remains unchanged.",
        "text",
    )
    assert ok is False


def test_grade_any_empty_or_garbage_never_crashes():
    assert grade_answer("", "2x+6", "expression")[0] is False
    assert grade_answer("???", "x=6", "equation")[0] is False
    assert grade_answer("invalid+-syntax***", "-5", "number")[0] is False


# ===========================================================================
# GROUP B: /retry tests
# ===========================================================================

def test_retry_correct():
    with TestClient(app) as client:
        res = client.post("/retry", json={
            "student_id": "std_retry_1",
            "question_id": "PD_02",
            "steps": ["5x-10=20", "5x=30", "x=6"],
        })
        assert res.status_code == 200
        data = res.json()
        assert data["stage"] == "retry_passed"
        assert data["diagnosis"] is None
        assert data["isCorrect"] is True
        assert data["readyForTransfer"] is True

        profile = db.get_profile("std_retry_1")
        row = next(r for r in profile if r["misconception_id"] == "PARTIAL_DISTRIBUTION")
        assert row["stage"] == "retry_passed"


def test_retry_same_mistake_again():
    with TestClient(app) as client:
        res = client.post("/retry", json={
            "student_id": "std_retry_same",
            "question_id": "PD_02",
            "steps": ["5x-2=20", "5x=22", "x=4.4"],
        })
        assert res.status_code == 200
        data = res.json()
        assert data["stage"] == "retry_failed_same"
        assert data["diagnosis"]["label"] == "PARTIAL_DISTRIBUTION"
        assert data["retry_count"] == 1
        assert data["isCorrect"] is False


def test_retry_different_mistake():
    with TestClient(app) as client:
        student_id = "std_retry_diff"
        res = client.post("/retry", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "misconception_id": "PARTIAL_DISTRIBUTION",
            "steps": ["5x-10=20", "5x=20-10", "5x=10", "x=2"],
        })
        assert res.status_code == 200
        data = res.json()
        assert data["stage"] == "retry_failed_new"
        assert data["diagnosis"]["label"] == "TRANSPOSITION"

        # The new misconception is added to the profile
        profile = db.get_profile(student_id)
        assert any(r["misconception_id"] == "TRANSPOSITION" for r in profile)


def test_retry_right_answer_wrong_working():
    """Two mistakes that cancel out and still reach the right answer must NOT pass."""
    with TestClient(app) as client:
        # Prompt: Solve 5(x-2)=20  (solution x=6)
        # Step 0: 5x-2=20    (mistake: partial distribution, left side should be 5x-10)
        # Step 1: 5x=30      (mistake: added 10 instead of 2 to 20; cancels out the error!)
        # Step 2: x=6        (reaches correct answer x=6, but working had invalid steps!)
        res = client.post("/retry", json={
            "student_id": "std_wrong_working",
            "question_id": "PD_02",
            "steps": ["5x-2=20", "5x=30", "x=6"],
        })
        assert res.status_code == 200
        data = res.json()
        assert data["isCorrect"] is False
        assert data["stage"] != "retry_passed"
        assert data["readyForTransfer"] is False


def test_retry_unfinished():
    """Correct steps, but no final x=... must not pass, and prompts student to finish."""
    with TestClient(app) as client:
        # Correct first step, but stopped without solving for x
        res = client.post("/retry", json={
            "student_id": "std_unfinished",
            "question_id": "PD_02",
            "steps": ["5x-10=20", "5x=30"],
        })
        assert res.status_code == 200
        data = res.json()
        assert data["isCorrect"] is False
        assert data["stage"] == "incomplete"
        assert "finish" in data["message"].lower() or "solving" in data["message"].lower()


def test_retry_second_failure_flagged_for_teacher():
    with TestClient(app) as client:
        student_id = "std_teacher_flag"
        # First failure
        client.post("/retry", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "steps": ["5x-2=20", "5x=22", "x=4.4"],
        })
        # Second failure
        res2 = client.post("/retry", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "steps": ["5x-2=20", "5x=22", "x=4.4"],
        })
        assert res2.status_code == 200
        data = res2.json()
        assert data["flagged_for_teacher"] is True
        assert data["stage"] == "teacher_flagged"


def test_retry_bad_input_422():
    with TestClient(app) as client:
        res = client.post("/retry", json={
            "student_id": "std_bad_input",
            "question_id": "PD_02",
            "steps": ["2x+=3"],
        })
        assert res.status_code == 422
        data = res.json()
        assert "line_index" in data["detail"]


def test_retry_unknown_question_404():
    with TestClient(app) as client:
        res = client.post("/retry", json={
            "student_id": "std_404",
            "question_id": "FAKE_QUESTION_ID_999",
            "steps": ["x=5"],
        })
        assert res.status_code == 404


# ===========================================================================
# GROUP C: /transfer tests
# ===========================================================================

def test_transfer_first_pass():
    with TestClient(app) as client:
        student_id = "std_transfer_1st"
        res = client.post("/transfer", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "answer": "2x + 6",
        })
        assert res.status_code == 200
        data = res.json()
        assert data["stage"] == "transfer_in_progress"
        assert data["streak"] == 1
        assert data["next_question_id"] is not None
        assert data["transfer_verified"] is False


def test_transfer_full_pass():
    with TestClient(app) as client:
        student_id = "std_transfer_full"
        # 1st variant (PD_02)
        res1 = client.post("/transfer", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "answer": "2x + 6",
        })
        next_qid = res1.json()["next_question_id"] or "PD_01_T1"

        # 2nd variant
        res2 = client.post("/transfer", json={
            "student_id": student_id,
            "question_id": next_qid,
            "answer": "3x + 12",
        })
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2["stage"] == "transfer_passed"
        assert data2["streak"] == 2
        assert data2["transfer_verified"] is True

        profile = db.get_profile(student_id)
        row = next(r for r in profile if r["misconception_id"] == "PARTIAL_DISTRIBUTION")
        assert row["stage"] == "transfer_passed"


def test_transfer_pass_then_fail_resets_streak_and_includes_bridge():
    with TestClient(app) as client:
        student_id = "std_transfer_pass_fail"
        # Variant 1 right
        client.post("/transfer", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "answer": "2x + 6",
        })
        # Variant 2 wrong
        res2 = client.post("/transfer", json={
            "student_id": student_id,
            "question_id": "PD_01",
            "answer": "3x + 4",
        })
        assert res2.status_code == 200
        data = res2.json()
        assert data["stage"] == "transfer_failed"
        assert data["streak"] == 0
        assert data["bridge_explanation"] is not None
        assert len(data["bridge_explanation"]) > 0


def test_transfer_immediate_fail_includes_bridge():
    with TestClient(app) as client:
        student_id = "std_transfer_imm_fail"
        res = client.post("/transfer", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "answer": "2x + 3",
        })
        assert res.status_code == 200
        data = res.json()
        assert data["stage"] == "transfer_failed"
        assert data["bridge_explanation"] is not None


def test_transfer_not_consecutive_restarts_streak():
    with TestClient(app) as client:
        student_id = "std_transfer_not_consec"
        # Pass 1
        r1 = client.post("/transfer", json={"student_id": student_id, "question_id": "PD_02", "answer": "2x + 6"})
        assert r1.json()["streak"] == 1

        # Fail
        r2 = client.post("/transfer", json={"student_id": student_id, "question_id": "PD_01", "answer": "3x + 4"})
        assert r2.json()["streak"] == 0

        # Pass again
        r3 = client.post("/transfer", json={"student_id": student_id, "question_id": "PD_02", "answer": "2x + 6"})
        assert r3.json()["streak"] == 1
        assert r3.json()["stage"] == "transfer_in_progress"
        assert r3.json()["transfer_verified"] is False


# ===========================================================================
# GROUP D: Recurrence and profile tests
# ===========================================================================

def test_recurrence_of_resolved_misconception():
    with TestClient(app) as client:
        student_id = "std_recur"
        # Student previously resolved TRANSPOSITION
        db.set_stage(student_id, "TRANSPOSITION", "transfer_passed")

        # Now makes the mistake again
        res = client.post("/attempt", json={
            "student_id": student_id,
            "question_id": "TR_01",
            "steps": ["x=12+5", "x=17"],
        })
        assert res.status_code == 200
        assert res.json()["stage"] == "recurred"
        assert res.json()["diagnosis"]["label"] == "TRANSPOSITION"

        profile = db.get_profile(student_id)
        row = next(r for r in profile if r["misconception_id"] == "TRANSPOSITION")
        assert row["stage"] == "recurred"
        assert row["occurrence_count"] >= 2


def test_still_active_not_recurred_after_transfer_fail():
    with TestClient(app) as client:
        student_id = "std_still_active"
        # Misconception was never resolved; student failed transfer
        db.set_stage(student_id, "TRANSPOSITION", "transfer_failed")

        res = client.post("/attempt", json={
            "student_id": student_id,
            "question_id": "TR_01",
            "steps": ["x=12+5", "x=17"],
        })
        assert res.status_code == 200
        assert res.json()["stage"] == "diagnosed"


def test_slips_ignored_by_profile():
    with TestClient(app) as client:
        student_id = "std_slip"
        res = client.post("/attempt", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "steps": ["2x+6=14", "2x=9", "x=4.5"],  # 14-6 = 8, student wrote 9 (arithmetic slip)
        })
        assert res.status_code == 200
        profile = db.get_profile(student_id)
        # Arithmetic slip must NOT create a learner profile misconception row
        assert len([r for r in profile if r["misconception_id"] == "ARITHMETIC_SLIP"]) == 0


def test_get_student_profile_endpoint():
    with TestClient(app) as client:
        student_id = "std_profile_test"
        db.set_stage(student_id, "PARTIAL_DISTRIBUTION", "transfer_passed")

        res = client.get(f"/student/{student_id}/profile")
        assert res.status_code == 200
        profile = res.json()
        assert len(profile) >= 1
        item = profile[0]
        assert "stage" in item
        assert "occurrence_count" in item
        assert "retry_count" in item
        assert "transfer_streak" in item or "consecutive_transfer_count" in item


# ===========================================================================
# GROUP E: Question bank checks (Member 4's content)
# ===========================================================================

def test_question_bank_every_diagnostic_prompt_readable():
    for q in QUESTIONS.values():
        prompt = q.get("prompt")
        assert prompt, f"Missing prompt for {q.get('question_id')}"
        parsed = parse_line(extract_math(prompt), -1)
        assert parsed is not None, f"Could not parse prompt for {q.get('question_id')}"


def test_question_bank_every_retry_canonical_correct():
    for q in QUESTIONS.values():
        retry_obj = q.get("retry_question")
        assert retry_obj, f"Missing retry_question in {q.get('question_id')}"
        r_prompt = retry_obj.get("prompt")
        r_ans = retry_obj.get("canonical_answer")
        res = check_attempt(r_prompt, [r_ans])
        assert res.status == "correct", f"Retry canonical failed for {q.get('question_id')}: {r_prompt} -> {r_ans}"


def test_question_bank_every_transfer_valid_type_and_passes_own_grader():
    valid_types = {"expression", "equation", "number", "code_assignment", "text"}
    for q in QUESTIONS.values():
        t_obj = q.get("transfer_question")
        assert t_obj, f"Missing transfer_question in {q.get('question_id')}"
        ans_type = t_obj.get("answer_type")
        assert ans_type in valid_types, f"Invalid answer_type '{ans_type}' in {q.get('question_id')}"

        canonical = t_obj.get("canonical_answer")
        ok, msg = grade_answer(
            canonical,
            canonical,
            answer_type=ans_type,
            domain=t_obj.get("domain", ""),
            rubric=t_obj.get("rubric", ""),
        )
        assert ok is True, f"Canonical failed own grader for {q.get('question_id')}: {canonical} ({msg})"


def test_question_bank_deliberately_wrong_answer_fails_transfer():
    for q in QUESTIONS.values():
        t_obj = q.get("transfer_question")
        ans_type = t_obj.get("answer_type")
        canonical = t_obj.get("canonical_answer")
        wrong_answer = "999x + 888" if ans_type == "expression" else ("x = 999" if ans_type == "equation" else ("9999" if ans_type == "number" else ("wrong_var = 1" if ans_type == "code_assignment" else "Yes, 8")))
        ok, _ = grade_answer(
            wrong_answer,
            canonical,
            answer_type=ans_type,
            domain=t_obj.get("domain", ""),
            rubric=t_obj.get("rubric", ""),
        )
        assert ok is False, f"Wrong answer falsely passed in {q.get('question_id')}"


def test_question_bank_ids_unique_and_labels_in_taxonomy():
    seen_ids = set()
    for q in QUESTIONS.values():
        qid = q.get("question_id")
        assert qid not in seen_ids, f"Duplicate question_id: {qid}"
        seen_ids.add(qid)

        misc_id = q.get("misconception_id")
        assert misc_id in TAXONOMY_LABELS, f"Invalid misconception label {misc_id} in {qid}"

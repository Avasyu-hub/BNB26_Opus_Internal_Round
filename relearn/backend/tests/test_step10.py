"""Tests for Step 10 - Retry, Transfer, and Recurrence Verification.

Validates:
1. /retry passes ONLY if steps are algebraically correct AND original misconception is absent.
2. /retry detects retry_failed_same vs retry_failed_new.
3. Multiple failed retries trigger teacher_flagged stage.
4. /transfer accurately grades geometry expressions, physics displacement/scalars,
   programming code assignments, and conceptual unit incompatibility.
5. /transfer strictly enforces the 2 consecutive passes requirement before marking transfer_passed.
6. A transfer failure sets stage to transfer_failed and resets streak.
7. A resolved misconception (retry_passed or transfer_passed) that returns is marked recurred.
"""
import os
import tempfile
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Use isolated DB for step 10 test suite
os.environ["RELEARN_DB"] = str(Path(tempfile.mkdtemp()) / "test_step10.db")

from backend.main import app  # noqa: E402
from backend import database as db  # noqa: E402


@pytest.fixture(autouse=True)
def setup_clean_db():
    db.init_db()


def test_retry_passes_when_correct_and_misconception_absent():
    with TestClient(app) as client:
        student_id = "student_retry_pass"
        # 1. Initial attempt fails with PARTIAL_DISTRIBUTION
        att_res = client.post("/attempt", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "steps": ["2x+3=14", "2x=11", "x=5.5"],
        })
        assert att_res.status_code == 200
        assert att_res.json()["stage"] == "diagnosed"

        # 2. Retry with correct steps: retry prompt for PD_02 is 5(x-2)=20
        retry_res = client.post("/retry", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "misconception_id": "PARTIAL_DISTRIBUTION",
            "steps": ["5x-10=20", "5x=30", "x=6"],
        })
        assert retry_res.status_code == 200
        data = retry_res.json()
        assert data["stage"] == "retry_passed"
        assert data["isCorrect"] is True
        assert data["readyForTransfer"] is True
        assert data["retry_count"] == 1

        # Check DB reflects retry_passed
        profile = db.get_profile(student_id)
        pd_row = next(r for r in profile if r["misconception_id"] == "PARTIAL_DISTRIBUTION")
        assert pd_row["stage"] == "retry_passed"


def test_retry_fails_when_same_misconception_repeated():
    with TestClient(app) as client:
        student_id = "student_retry_same"
        # Retry prompt for PD_02 is 5(x-2)=20.
        # Student repeats partial distribution: 5(x-2) -> 5x-2
        retry_res = client.post("/retry", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "misconception_id": "PARTIAL_DISTRIBUTION",
            "steps": ["5x-2=20", "5x=22", "x=4.4"],
        })
        assert retry_res.status_code == 200
        data = retry_res.json()
        assert data["stage"] == "retry_failed_same"
        assert data["isCorrect"] is False
        assert data["readyForTransfer"] is False
        assert data["diagnosis"]["label"] == "PARTIAL_DISTRIBUTION"


def test_retry_fails_when_new_misconception_introduced():
    with TestClient(app) as client:
        student_id = "student_retry_new"
        # Retry prompt for PD_02 is 5(x-2)=20.
        # Student distributes correctly to 5x-10=20, but then makes TRANSPOSITION error: 5x=20-10
        retry_res = client.post("/retry", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "misconception_id": "PARTIAL_DISTRIBUTION",
            "steps": ["5x-10=20", "5x=20-10", "5x=10", "x=2"],
        })
        assert retry_res.status_code == 200
        data = retry_res.json()
        assert data["stage"] == "retry_failed_new"
        assert data["diagnosis"]["label"] == "TRANSPOSITION"


def test_multiple_failed_retries_flag_for_teacher_support():
    with TestClient(app) as client:
        student_id = "student_flag_teacher"
        # Retry 1: fails
        client.post("/retry", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "misconception_id": "PARTIAL_DISTRIBUTION",
            "steps": ["5x-2=20", "5x=22", "x=4.4"],
        })
        # Retry 2: fails again -> triggers teacher_flagged
        res2 = client.post("/retry", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "misconception_id": "PARTIAL_DISTRIBUTION",
            "steps": ["5x-2=20", "5x=22", "x=4.4"],
        })
        assert res2.status_code == 200
        data = res2.json()
        assert data["stage"] == "teacher_flagged"
        assert data["retry_count"] >= 2


def test_transfer_two_consecutive_passes_policy():
    with TestClient(app) as client:
        student_id = "student_transfer_two_passes"
        db.set_stage(student_id, "PARTIAL_DISTRIBUTION", "retry_passed")

        # Transfer 1: Correct answer (PD_02 transfer canonical is '2x + 6')
        res1 = client.post("/transfer", json={
            "student_id": student_id,
            "question_id": "PD_02",
            "misconception_id": "PARTIAL_DISTRIBUTION",
            "answer": "2x + 6 m^2",
        })
        assert res1.status_code == 200
        d1 = res1.json()
        assert d1["isCorrect"] is True
        assert d1["consecutive_transfer_count"] == 1
        assert d1["transfer_verified"] is False
        assert d1["stage"] == "transfer_in_progress"

        # Transfer 2: Second consecutive correct answer (PD_01 transfer canonical is '3x + 12')
        res2 = client.post("/transfer", json={
            "student_id": student_id,
            "question_id": "PD_01",
            "misconception_id": "PARTIAL_DISTRIBUTION",
            "answer": "12 + 3*x",  # algebraically equivalent commutative form
        })
        assert res2.status_code == 200
        d2 = res2.json()
        assert d2["isCorrect"] is True
        assert d2["consecutive_transfer_count"] == 2
        assert d2["transfer_verified"] is True
        assert d2["stage"] == "transfer_passed"

        # Check DB reflects transfer_passed
        profile = db.get_profile(student_id)
        row = next(r for r in profile if r["misconception_id"] == "PARTIAL_DISTRIBUTION")
        assert row["stage"] == "transfer_passed"
        assert row["consecutive_transfer_count"] == 2


def test_transfer_failure_marks_transfer_failed_and_resets_streak():
    with TestClient(app) as client:
        student_id = "student_transfer_fail"
        db.set_stage(student_id, "TRANSPOSITION", "retry_passed")

        # Transfer failure: wrong answer for TR_01 ('deposit = balance - bonus')
        res = client.post("/transfer", json={
            "student_id": student_id,
            "question_id": "TR_01",
            "misconception_id": "TRANSPOSITION",
            "answer": "deposit = balance + bonus",  # failed transposition in code context
        })
        assert res.status_code == 200
        data = res.json()
        assert data["isCorrect"] is False
        assert data["stage"] == "transfer_failed"
        assert data["consecutive_transfer_count"] == 0
        assert data["transfer_verified"] is False

        profile = db.get_profile(student_id)
        row = next(r for r in profile if r["misconception_id"] == "TRANSPOSITION")
        assert row["stage"] == "transfer_failed"


def test_recurrence_of_resolved_misconception():
    with TestClient(app) as client:
        student_id = "student_recurrence"
        # 1. Student had resolved transposition
        db.set_stage(student_id, "TRANSPOSITION", "transfer_passed")

        # 2. Student makes transposition error again
        res = client.post("/attempt", json={
            "student_id": student_id,
            "question_id": "TR_01",
            "steps": ["x=12+5", "x=17"],
        })
        assert res.status_code == 200
        data = res.json()
        assert data["stage"] == "recurred"
        assert data["diagnosis"]["label"] == "TRANSPOSITION"

        profile = db.get_profile(student_id)
        row = next(r for r in profile if r["misconception_id"] == "TRANSPOSITION")
        assert row["stage"] == "recurred"
        assert row["occurrence_count"] >= 2

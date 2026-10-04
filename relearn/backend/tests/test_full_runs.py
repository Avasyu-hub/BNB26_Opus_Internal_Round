"""Part B: The Three Full Student Journey Runs (Automated Verification).

Tests:
Run 1 (Success Path): Attempt (error) -> Intervention -> Retry (pass) -> Transfer 1 (pass) -> Transfer 2 (pass) -> Node GREEN (transfer_passed).
Run 2 (Transfer Failure Path): Attempt (error) -> Intervention -> Retry (pass, BLUE) -> Transfer (fail, RED ring) -> transfer_failed.
Run 3 (Retries failing and Recurrence): Attempt (error) -> Retry fail x2 -> Flagged for teacher support.
       Then repeat Run 1 misconception -> Recurred with occurrence count incremented.
"""
import os
import tempfile
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

os.environ["RELEARN_DB"] = str(Path(tempfile.mkdtemp()) / "test_full_runs.db")

from backend.main import app  # noqa: E402
from backend import database as db  # noqa: E402


@pytest.fixture(autouse=True)
def setup_clean():
    db.init_db()


def execute_three_full_runs(iteration: int = 0):
    with TestClient(app) as client:
        # ===================================================================
        # RUN 1: The Success Path (PARTIAL_DISTRIBUTION)
        # ===================================================================
        s1 = f"student_run_1_iter_{iteration}"

        # 1. Attempt with mistake
        att1 = client.post("/attempt", json={
            "student_id": s1,
            "question_id": "PD_02",
            "steps": ["2x+3=14", "2x=11", "x=5.5"],
        })
        assert att1.status_code == 200
        d1 = att1.json()
        assert d1["stage"] == "diagnosed"
        assert d1["error_step_index"] == 0
        assert d1["diagnosis"]["label"] == "PARTIAL_DISTRIBUTION"
        assert d1["diagnosis"]["confidence"] >= 0.70

        # 2. Intervention screen
        inv1 = client.post("/intervention", json={
            "label": d1["diagnosis"]["label"],
            "evidence": d1["diagnosis"]["evidence"],
            "student_numbers": {"factor": 2, "term2": 3},
            "language": "en",
        })
        assert inv1.status_code == 200
        inv_data = inv1.json()
        assert inv_data["animation_id"] == "area_model"
        assert "rectangle" in inv_data["explanation"].lower() or "area" in inv_data["explanation"].lower()

        # 3. Retry question answered correctly
        ret1 = client.post("/retry", json={
            "student_id": s1,
            "question_id": "PD_02",
            "misconception_id": "PARTIAL_DISTRIBUTION",
            "steps": ["5x-10=20", "5x=30", "x=6"],
        })
        assert ret1.status_code == 200
        assert ret1.json()["stage"] == "retry_passed"
        assert ret1.json()["readyForTransfer"] is True

        # 4. Transfer Question 1 answered correctly
        tr1_a = client.post("/transfer", json={
            "student_id": s1,
            "question_id": "PD_02",
            "misconception_id": "PARTIAL_DISTRIBUTION",
            "answer": "2x + 6",
        })
        assert tr1_a.status_code == 200
        assert tr1_a.json()["stage"] == "transfer_in_progress"
        assert tr1_a.json()["consecutive_transfer_count"] == 1
        assert tr1_a.json()["transfer_verified"] is False

        # 5. Transfer Question 2 answered correctly -> Transfer Verified ✓
        tr1_b = client.post("/transfer", json={
            "student_id": s1,
            "question_id": "PD_01",
            "misconception_id": "PARTIAL_DISTRIBUTION",
            "answer": "3x + 12",
        })
        assert tr1_b.status_code == 200
        assert tr1_b.json()["stage"] == "transfer_passed"
        assert tr1_b.json()["consecutive_transfer_count"] == 2
        assert tr1_b.json()["transfer_verified"] is True

        # Graph node is green (transfer_passed)
        p1 = db.get_profile(s1)
        node1 = next(r for r in p1 if r["misconception_id"] == "PARTIAL_DISTRIBUTION")
        assert node1["stage"] == "transfer_passed"

        # ===================================================================
        # RUN 2: The Transfer-Failure Path, Hero Moment (TRANSPOSITION)
        # ===================================================================
        s2 = f"student_run_2_iter_{iteration}"

        # 1. Transposition mistake
        att2 = client.post("/attempt", json={
            "student_id": s2,
            "question_id": "TR_01",
            "steps": ["x=12+5", "x=17"],
        })
        assert att2.status_code == 200
        d2 = att2.json()
        assert d2["stage"] == "diagnosed"
        assert d2["diagnosis"]["label"] == "TRANSPOSITION"

        # 2. Intervention
        inv2 = client.post("/intervention", json={
            "label": "TRANSPOSITION",
            "evidence": d2["diagnosis"]["evidence"],
            "language": "en",
        })
        assert inv2.status_code == 200
        assert inv2.json()["animation_id"] == "balance_scale"

        # 3. Pass the retry -> node turns blue (retry_passed)
        ret2 = client.post("/retry", json={
            "student_id": s2,
            "question_id": "TR_01",
            "misconception_id": "TRANSPOSITION",
            "steps": ["x=15-7", "x=8"],
        })
        assert ret2.status_code == 200
        assert ret2.json()["stage"] == "retry_passed"

        p2_mid = db.get_profile(s2)
        assert next(r for r in p2_mid if r["misconception_id"] == "TRANSPOSITION")["stage"] == "retry_passed"

        # 4. Fail the transfer question -> "Persists in a new context ✗", red pulsing ring
        tr2 = client.post("/transfer", json={
            "student_id": s2,
            "question_id": "TR_01",
            "misconception_id": "TRANSPOSITION",
            "answer": "deposit = balance + bonus",  # failing transposition in code assignment
        })
        assert tr2.status_code == 200
        d_tr2 = tr2.json()
        assert d_tr2["isCorrect"] is False
        assert d_tr2["stage"] == "transfer_failed"
        assert d_tr2["transfer_verified"] is False

        p2_final = db.get_profile(s2)
        node2 = next(r for r in p2_final if r["misconception_id"] == "TRANSPOSITION")
        assert node2["stage"] == "transfer_failed"

        # ===================================================================
        # RUN 3: Retries Failing and Recurrence (UNLIKE_TERMS & PARTIAL_DISTRIBUTION)
        # ===================================================================
        s3 = f"student_run_3_iter_{iteration}"

        # 1. Mistake in unlike terms
        att3 = client.post("/attempt", json={
            "student_id": s3,
            "question_id": "UT_02",
            "steps": ["11x=23", "x=2.09"],
        })
        assert att3.status_code == 200
        d3 = att3.json()
        assert d3["stage"] == "diagnosed"
        assert d3["diagnosis"]["label"] == "UNLIKE_TERMS"

        # 2. Fail retry #1 (UT_02 retry: Solve 3x+5=20 -> repeats unlike terms: 8x=20)
        r3_1 = client.post("/retry", json={
            "student_id": s3,
            "question_id": "UT_02",
            "misconception_id": "UNLIKE_TERMS",
            "steps": ["8x=20", "x=2.5"],
        })
        assert r3_1.status_code == 200
        assert r3_1.json()["stage"] == "retry_failed_same"

        # 3. Fail retry #2 -> Flagged for teacher support
        r3_2 = client.post("/retry", json={
            "student_id": s3,
            "question_id": "UT_02",
            "misconception_id": "UNLIKE_TERMS",
            "steps": ["8x=20", "x=2.5"],
        })
        assert r3_2.status_code == 200
        assert r3_2.json()["stage"] == "teacher_flagged"

        p3_ut = db.get_profile(s3)
        assert next(r for r in p3_ut if r["misconception_id"] == "UNLIKE_TERMS")["stage"] == "teacher_flagged"

        # 4. Later, repeat a misconception that was already resolved in Run 1 (PARTIAL_DISTRIBUTION)
        # Seed s3 with resolved PARTIAL_DISTRIBUTION first
        db.set_stage(s3, "PARTIAL_DISTRIBUTION", "transfer_passed")

        att3_recur = client.post("/attempt", json={
            "student_id": s3,
            "question_id": "PD_01",
            "steps": ["3x+4=21", "3x=17", "x=5.67"],
        })
        assert att3_recur.status_code == 200
        d3_recur = att3_recur.json()
        assert d3_recur["stage"] == "recurred"
        assert d3_recur["diagnosis"]["label"] == "PARTIAL_DISTRIBUTION"

        p3_final = db.get_profile(s3)
        node_pd = next(r for r in p3_final if r["misconception_id"] == "PARTIAL_DISTRIBUTION")
        assert node_pd["stage"] == "recurred"
        assert node_pd["occurrence_count"] >= 2


def test_three_full_runs_pass_three_consecutive_times():
    """Part C Pass Rule: Must succeed 3 times in a row without crashing or 500 errors."""
    for i in range(3):
        execute_three_full_runs(iteration=i)


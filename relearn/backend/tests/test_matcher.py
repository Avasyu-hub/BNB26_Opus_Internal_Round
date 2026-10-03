"""Tests for Step 5 (matcher) and Step 6 (API integration)."""
import os
import tempfile
from pathlib import Path

import pytest

# Use a temporary database for test runs
os.environ["RELEARN_DB"] = str(Path(tempfile.mkdtemp()) / "test_matcher.db")

from fastapi.testclient import TestClient  # noqa: E402
from backend.main import app  # noqa: E402
from backend.engine.matcher import ROOT_CONCEPTS, match  # noqa: E402
from backend import database as db  # noqa: E402


# ---------------------------------------------------------------------------
# Unit tests for matcher
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "label,prev_line,student_line,expected_root",
    [
        ("PARTIAL_DISTRIBUTION", "2(x+3)=14", "2x+3=14", "DISTRIBUTIVE_LAW"),
        ("SQUARE_OF_SUM", "(x+2)^2=25", "x^2+4=25", "DISTRIBUTIVE_LAW"),
        ("NEGATIVE_DISTRIBUTION", "-(x+4)=6", "-x+4=6", "DISTRIBUTIVE_LAW"),
        ("TRANSPOSITION", "x+5=10", "x=10+5", "EQUALITY_BALANCE"),
        ("UNLIKE_TERMS", "3x+5=16", "8x=16", "LIKE_TERMS"),
        ("NEG_TIMES_NEG", "(-2)(-3x)=12", "-6x=12", "INTEGER_RULES"),
    ],
)
def test_each_misconception_matches_its_label(label, prev_line, student_line, expected_root):
    matches = match(prev_line, student_line)
    assert len(matches) >= 1
    first = matches[0]
    assert first["label"] == label
    assert first["source"] == "rule"
    assert first["confidence"] == 0.95
    assert first["root_concept"] == expected_root
    assert ROOT_CONCEPTS[label] == expected_root
    assert isinstance(first["evidence"], str)
    assert len(first["evidence"]) > 0


def test_correct_step_returns_empty():
    # 2(x+3)=14 -> 2x+6=14 is algebraically correct, so no misconception should match
    assert match("2(x+3)=14", "2x+6=14") == []


def test_no_false_match_for_scaled_equation():
    # 2x+3=14 and 4x+6=28 have the same solution set, but are NOT the same equation;
    # transposition etc. must not falsely match
    assert match("2x+3=14", "4x+6=28") == []


def test_matcher_never_raises_on_invalid_input():
    assert match("", "") == []
    assert match("garbage", "syntax+error===") == []
    assert match("2(x+3)=14", "2x+=") == []
    assert match("2(x+3)=14", "9x") == []  # expression, not equation


def test_matcher_symmetric_sides():
    # 14=2x+3 is algebraically equal to -(2x+3 - 14) = 0
    matches = match("2(x+3)=14", "14=2x+3")
    assert len(matches) >= 1
    assert matches[0]["label"] == "PARTIAL_DISTRIBUTION"


# ---------------------------------------------------------------------------
# API tests for POST /attempt
# ---------------------------------------------------------------------------

def test_api_attempt_partial_distribution():
    with TestClient(app) as client:
        body = {
            "student_id": "student_pd_01",
            "question_id": "PD_01",
            "question": "Solve 2(x+3)=14",
            "steps": ["2x+3=14", "2x=11", "x=5.5"],
        }
        res = client.post("/attempt", json=body)
        assert res.status_code == 200
        data = res.json()
        assert data["error_step_index"] == 0
        assert data["stage"] == "diagnosed"

        diag = data["diagnosis"]
        assert diag is not None
        assert diag["label"] == "PARTIAL_DISTRIBUTION"
        assert diag["confidence"] == 0.95
        assert diag["source"] == "rule"
        assert diag["root_concept"] == "DISTRIBUTIVE_LAW"
        assert len(diag["candidates"]) >= 1
        assert diag["candidates"][0]["label"] == "PARTIAL_DISTRIBUTION"
        assert diag["candidates"][0]["prob"] == 1.0


def test_api_attempt_error_at_step_1_uses_step_0_as_prev_line():
    with TestClient(app) as client:
        # Question: Solve 4+2(x+3)=18  (solution x=4)
        # Step 0:   2(x+3)=14          (correct: 4 subtracted from both sides, solution x=4)
        # Step 1:   2x+3=14            (partial distribution from Step 0, NOT from question)
        # Step 2:   2x=11
        body = {
            "student_id": "student_step1",
            "question_id": "Q_STEP1",
            "question": "Solve 4+2(x+3)=18",
            "steps": ["2(x+3)=14", "2x+3=14", "2x=11"],
        }
        res = client.post("/attempt", json=body)
        assert res.status_code == 200
        data = res.json()
        assert data["error_step_index"] == 1
        assert data["stage"] == "diagnosed"

        diag = data["diagnosis"]
        assert diag is not None
        assert diag["label"] == "PARTIAL_DISTRIBUTION"
        assert diag["confidence"] == 0.95


def test_api_attempt_recurrence_tracking():
    with TestClient(app) as client:
        student_id = "student_recur_01"
        body = {
            "student_id": student_id,
            "question_id": "TR_01",
            "question": "Solve x+5=10",
            "steps": ["x=10+5", "x=15"],
        }
        # First attempt -> diagnosed
        res1 = client.post("/attempt", json=body)
        assert res1.status_code == 200
        assert res1.json()["stage"] == "diagnosed"
        assert res1.json()["diagnosis"]["label"] == "TRANSPOSITION"

        # Mark as resolved
        db.set_stage(student_id, "TRANSPOSITION", "retry_passed")

        # Second attempt with same misconception -> recurred
        res2 = client.post("/attempt", json=body)
        assert res2.status_code == 200
        assert res2.json()["stage"] == "recurred"
        assert res2.json()["diagnosis"]["label"] == "TRANSPOSITION"

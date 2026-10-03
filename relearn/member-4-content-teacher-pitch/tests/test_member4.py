"""Comprehensive Pytest Suite for Member 4 Deliverables.

Validates:
1. Question Bank schema, count, and mathematical integrity.
2. Seeded student profiles (40 students, distribution, research banner).
3. Evaluation dataset (60 authentic traces, ground-truth labels).
4. Constrained LLM fallback taxonomy validation & confidence capping.
5. Visual proof intervention generation across en, hi, bn and demo pre-caching.
6. Teacher dashboard summary aggregation route logic.
"""
import json
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

MEMBER4_DIR = Path(__file__).parent.parent
if str(MEMBER4_DIR) not in sys.path:
    sys.path.insert(0, str(MEMBER4_DIR))

from prompts.fallback_prompt import (
    ALLOWED_LABELS,
    build_fallback_prompt,
    validate_and_sanitize_llm_response,
)
from prompts.intervention_prompt import (
    ANIMATION_MAP,
    DEMO_PRECACHED_EXPLANATIONS,
    generate_intervention,
    get_animation_id,
)
from routes.intervention import InterventionRequest, post_intervention
from routes.teacher_summary import compute_class_summary, get_class_summary
from routes.standalone_app import app

DATA_DIR = Path(__file__).parent.parent / "data"

CORE_MISCONCEPTIONS = [
    "PARTIAL_DISTRIBUTION",
    "SQUARE_OF_SUM",
    "NEGATIVE_DISTRIBUTION",
    "TRANSPOSITION",
    "UNLIKE_TERMS",
    "NEG_TIMES_NEG",
]


class TestQuestionBank:
    """Test questions.json and mock_questions.json."""

    def test_mock_questions_file_exists_and_valid(self):
        mock_file = DATA_DIR / "mock_questions.json"
        assert mock_file.exists(), "mock_questions.json must exist"
        data = json.loads(mock_file.read_text(encoding="utf-8"))
        assert len(data) == 1
        item = data[0]
        assert item["misconception_id"] == "PARTIAL_DISTRIBUTION"
        assert "retry_question" in item
        assert "transfer_question" in item

    def test_questions_bank_schema_and_count(self):
        q_file = DATA_DIR / "questions.json"
        assert q_file.exists(), "questions.json must exist"
        data = json.loads(q_file.read_text(encoding="utf-8"))

        assert len(data) == 24, "Must contain exactly 24 diagnostic questions"

        counts = {m: 0 for m in CORE_MISCONCEPTIONS}
        for q in data:
            misc = q["misconception_id"]
            assert misc in CORE_MISCONCEPTIONS, f"Unknown misconception {misc}"
            counts[misc] += 1

            assert "question_id" in q
            assert "prompt" in q
            assert "root_concept" in q

            retry = q["retry_question"]
            assert "question_id" in retry
            assert "prompt" in retry
            assert "canonical_answer" in retry

            transfer = q["transfer_question"]
            assert "question_id" in transfer
            assert "domain" in transfer
            assert transfer["domain"] in ("geometry", "physics", "programming")
            assert "scenario" in transfer
            assert "canonical_answer" in transfer
            assert "rubric" in transfer

        # Exactly 4 per misconception
        for m, count in counts.items():
            assert count == 4, f"Misconception {m} has {count} questions, expected 4"


class TestSeededStudents:
    """Test seeded_students.json cohort dataset."""

    def test_seeded_students_count_and_distribution(self):
        s_file = DATA_DIR / "seeded_students.json"
        assert s_file.exists(), "seeded_students.json must exist"
        data = json.loads(s_file.read_text(encoding="utf-8"))

        meta = data.get("dataset_metadata", {})
        assert "Simulated Research Data" in meta.get("disclaimer", "")
        assert meta.get("total_students") == 40

        students = data.get("students", [])
        assert len(students) == 40, "Must contain exactly 40 student profiles"

        statuses = [s["status"] for s in students]
        mastered = statuses.count("mastered")
        active = statuses.count("active_misconception")
        transfer_failed = statuses.count("transfer_failed")

        assert mastered == 26, f"Expected 26 mastered students, got {mastered}"
        assert active == 8, f"Expected 8 active misconception students, got {active}"
        assert transfer_failed == 6, f"Expected 6 transfer failed students, got {transfer_failed}"


class TestEvaluationDataset:
    """Test evaluation_set.json authentic traces."""

    def test_eval_dataset_traces(self):
        e_file = DATA_DIR / "evaluation_set.json"
        assert e_file.exists(), "evaluation_set.json must exist"
        data = json.loads(e_file.read_text(encoding="utf-8"))

        assert len(data) >= 50, "Evaluation dataset must contain at least 50 samples"

        for sample in data:
            assert "id" in sample
            assert "equation" in sample
            assert "student_steps" in sample
            assert isinstance(sample["student_steps"], list)
            assert len(sample["student_steps"]) > 0
            assert "ground_truth_label" in sample
            label = sample["ground_truth_label"]
            assert label in CORE_MISCONCEPTIONS or label in ("ARITHMETIC_SLIP", "NO_ERROR")


class TestPromptEngineering:
    """Test constrained fallback and pedagogical intervention prompts."""

    def test_fallback_taxonomy_enforcement(self):
        # Test valid label
        valid_json = json.dumps({
            "label": "PARTIAL_DISTRIBUTION",
            "evidence": "multiplied x but not 3",
            "confidence": 0.65,
            "source": "llm"
        })
        res = validate_and_sanitize_llm_response(valid_json)
        assert res["label"] == "PARTIAL_DISTRIBUTION"
        assert res["confidence"] == 0.65
        assert res["source"] == "llm"
        assert res["root_concept"] == "DISTRIBUTIVE_LAW"

        # Test hallucinated label rejection
        hallucinated_json = json.dumps({
            "label": "INVENTED_MISCONCEPTION_LABEL",
            "evidence": "random error",
            "confidence": 0.90
        })
        res2 = validate_and_sanitize_llm_response(hallucinated_json)
        assert res2["label"] == "unknown", "Must reject hallucinated label"
        assert res2["confidence"] <= 0.70, "Must cap confidence at 0.70"

        # Test over-confident cap
        over_conf_json = json.dumps({
            "label": "TRANSPOSITION",
            "evidence": "did not flip sign",
            "confidence": 0.99
        })
        res3 = validate_and_sanitize_llm_response(over_conf_json)
        assert res3["confidence"] == 0.70, "Confidence > 0.70 must be capped at 0.70"

    def test_intervention_generation_and_demo_path(self):
        # Test demo pathway (2(x+3)=14)
        demo_res = generate_intervention(
            label="PARTIAL_DISTRIBUTION",
            evidence="2 was multiplied with x but not with 3",
            student_numbers={"factor": 2, "term1": "x", "term2": 3, "rhs": 14},
            language="en"
        )
        assert demo_res["animation_id"] == "area_model"
        assert "rectangle" in demo_res["explanation"].lower()
        assert demo_res["explanation"] == DEMO_PRECACHED_EXPLANATIONS["en"]

        # Test Hindi toggle
        hi_res = generate_intervention(
            label="PARTIAL_DISTRIBUTION",
            evidence="2 was multiplied with x but not with 3",
            student_numbers={"factor": 2, "term1": "x", "term2": 3, "rhs": 14},
            language="hi"
        )
        assert hi_res["animation_id"] == "area_model"
        assert "क्षेत्रफल" in hi_res["explanation"]

        # Test Bengali toggle
        bn_res = generate_intervention(
            label="PARTIAL_DISTRIBUTION",
            evidence="2 was multiplied with x but not with 3",
            student_numbers={"factor": 2, "term1": "x", "term2": 3, "rhs": 14},
            language="bn"
        )
        assert bn_res["animation_id"] == "area_model"
        assert "বন্ধনীর" in bn_res["explanation"]

        # Test all 6 animation mappings
        expected_anims = {
            "PARTIAL_DISTRIBUTION": "area_model",
            "SQUARE_OF_SUM": "split_square",
            "NEGATIVE_DISTRIBUTION": "number_line",
            "TRANSPOSITION": "balance_scale",
            "UNLIKE_TERMS": "grouping_tiles",
            "NEG_TIMES_NEG": "rate_pattern",
        }
        for misc, expected_anim in expected_anims.items():
            assert get_animation_id(misc) == expected_anim


class TestFastAPIRoutes:
    """Test API route endpoints using TestClient."""

    @pytest.fixture
    def client(self):
        return TestClient(app)

    def test_health_endpoint(self, client):
        res = client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

    def test_canonical_questions_route(self, client):
        res = client.get("/questions")
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 24

    def test_post_intervention_route(self, client):
        payload = {
            "label": "PARTIAL_DISTRIBUTION",
            "evidence": "2 was multiplied with x but not 3",
            "student_numbers": {"factor": 2, "term1": "x", "term2": 3},
            "language": "en"
        }
        res = client.post("/intervention", json=payload)
        assert res.status_code == 200
        body = res.json()
        assert body["animation_id"] == "area_model"
        assert len(body["explanation"]) > 20

    def test_get_class_summary_route(self, client):
        res = client.get("/class/summary")
        assert res.status_code == 200
        body = res.json()

        assert body["class_name"] == "Class 8-B (Simulated Cohort)"
        assert body["total_students"] == 40
        assert "Simulated Research Data" in body["data_disclaimer"]
        assert len(body["misconception_heatmap"]) == 6
        assert len(body["transfer_failure_alerts"]) == 6
        assert len(body["peer_groups"]) > 0

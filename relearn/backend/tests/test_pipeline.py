"""Tests for Step 9 - LLM fallback validation and the diagnosis cascade."""
import pytest

from backend.engine import fallback, pipeline
from backend.model.predict import model_available

needs_model = pytest.mark.skipif(not model_available(), reason="run python -m backend.model.train first")


# ---------- fallback: strict validation (no network needed) ----------
def test_valid_reply_is_accepted():
    r = fallback.parse_and_validate('{"label": "TRANSPOSITION", "evidence": "moved +5", "confidence": 0.6}')
    assert r == {"label": "TRANSPOSITION", "evidence": "moved +5", "confidence": 0.6}


def test_confidence_is_capped_at_070():
    r = fallback.parse_and_validate('{"label": "UNLIKE_TERMS", "evidence": "e", "confidence": 0.99}')
    assert r["confidence"] == 0.70


def test_invented_label_is_rejected():
    assert fallback.parse_and_validate('{"label": "SIGN_CONFUSION", "evidence": "e", "confidence": 0.5}') is None


def test_json_inside_code_fence_is_accepted():
    r = fallback.parse_and_validate('```json\n{"label": "unknown", "evidence": "", "confidence": 0.1}\n```')
    assert r["label"] == "unknown"


@pytest.mark.parametrize("raw", ["", "not json", '{"evidence": "no label"}', '{"label": "TRANSPOSITION", "confidence": "high"}'])
def test_garbage_is_rejected(raw):
    assert fallback.parse_and_validate(raw) is None


def test_no_api_key_means_no_llm(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    assert fallback.classify("x+5=10", "x=15") is None


# ---------- pipeline cascade ----------
@needs_model
def test_rule_match_wins_with_095():
    d, trace = pipeline.diagnose("2(x+3)=14", "2x+3=14")
    assert (d["label"], d["source"], d["confidence"]) == ("PARTIAL_DISTRIBUTION", "rule", 0.95)
    assert d["root_concept"] == "DISTRIBUTIVE_LAW"
    assert d["candidates"][0]["label"] == "PARTIAL_DISTRIBUTION"
    assert trace["decided_by"] == "rule"


@needs_model
def test_rule_match_also_catches_a_simplified_step():
    # 2x=11 is the same equation as 2x+3=14, so the rule matcher catches it
    d, _ = pipeline.diagnose("2(x+3)=14", "2x=11")
    assert (d["label"], d["confidence"]) == ("PARTIAL_DISTRIBUTION", 0.95)


@needs_model
def test_jump_to_final_answer_is_matched_by_answer():
    d, trace = pipeline.diagnose("2(x+3)=14", "x=5.5")
    assert (d["label"], d["source"], d["confidence"]) == ("PARTIAL_DISTRIBUTION", "rule", 0.80)
    assert trace["decided_by"] == "answer"


def test_model_decides_when_rules_are_silent(monkeypatch):
    monkeypatch.setattr(pipeline, "predict", lambda *a, **k: [{"label": "UNLIKE_TERMS", "prob": 0.97}])
    monkeypatch.setattr(pipeline, "match", lambda *a: [])
    monkeypatch.setattr(pipeline, "match_by_answer", lambda *a: [])
    d, trace = pipeline.diagnose("3x+5=16", "8x=16")
    assert (d["label"], d["source"], d["confidence"]) == ("UNLIKE_TERMS", "model", 0.90)  # capped
    assert trace["decided_by"] == "model"


def test_llm_is_used_when_nothing_else_is_confident(monkeypatch):
    monkeypatch.setattr(pipeline, "predict", lambda *a, **k: [{"label": "TRANSPOSITION", "prob": 0.40}])
    monkeypatch.setattr(pipeline, "match", lambda *a: [])
    monkeypatch.setattr(pipeline, "match_by_answer", lambda *a: [])
    monkeypatch.setattr(pipeline, "classify",
                        lambda *a: {"label": "UNLIKE_TERMS", "evidence": "added 3x and 5", "confidence": 0.65})
    d, trace = pipeline.diagnose("3x+5=16", "8x=16")
    assert (d["label"], d["source"], d["confidence"]) == ("UNLIKE_TERMS", "llm", 0.65)
    assert trace["decided_by"] == "llm"


def test_unknown_when_everything_fails(monkeypatch):
    monkeypatch.setattr(pipeline, "predict", lambda *a, **k: [{"label": "NONE", "prob": 0.90}])
    monkeypatch.setattr(pipeline, "match", lambda *a: [])
    monkeypatch.setattr(pipeline, "match_by_answer", lambda *a: [])
    monkeypatch.setattr(pipeline, "classify", lambda *a: None)
    d, trace = pipeline.diagnose("x+5=10", "x=7")
    assert d["label"] == "unknown" and d["confidence"] == 0.0
    assert trace["decided_by"] == "unknown"


def test_rule_tie_broken_by_model(monkeypatch):
    monkeypatch.setattr(pipeline, "predict", lambda *a, **k: [
        {"label": "TRANSPOSITION", "prob": 0.7}, {"label": "UNLIKE_TERMS", "prob": 0.2}])
    monkeypatch.setattr(pipeline, "match", lambda *a: [
        {"label": "UNLIKE_TERMS", "evidence": "u", "root_concept": "LIKE_TERMS", "source": "rule", "confidence": 0.95},
        {"label": "TRANSPOSITION", "evidence": "t", "root_concept": "EQUALITY_BALANCE", "source": "rule", "confidence": 0.95}])
    d, _ = pipeline.diagnose("a", "b")
    assert d["label"] == "TRANSPOSITION" and d["evidence"] == "t"


# ---------- /attempt uses the pipeline ----------
@needs_model
def test_attempt_endpoint_uses_pipeline():
    from fastapi.testclient import TestClient
    from backend.main import app

    with TestClient(app) as client:
        def attempt(question, steps, student="s_pipe"):
            r = client.post("/attempt", json={"student_id": student, "question_id": "X",
                                              "question": question, "steps": steps})
            assert r.status_code == 200
            return r.json()

        d = attempt("Solve 2(x+3)=14", ["2x+3=14", "2x=11", "x=5.5"])["diagnosis"]
        assert (d["label"], d["source"], d["confidence"]) == ("PARTIAL_DISTRIBUTION", "rule", 0.95)
        assert len(d["candidates"]) >= 1 and d["candidates"][0]["prob"] > 0.5  # real model probabilities

        d = attempt("Solve 2(x+3)=14", ["x=5.5"])["diagnosis"]                 # jumped to the answer
        assert (d["label"], d["confidence"]) == ("PARTIAL_DISTRIBUTION", 0.80)

        body = attempt("Solve x+5=10", ["x=7"], student="s_slip")               # slip: not recorded
        assert body["diagnosis"]["label"] == "ARITHMETIC_SLIP"
        assert body["stage"] == "diagnosed"


def test_attempt_never_500s_when_pipeline_crashes(monkeypatch):
    from fastapi.testclient import TestClient
    import backend.main as main

    def boom(*a):
        raise RuntimeError("pipeline exploded")
    monkeypatch.setattr(main, "diagnose", boom)
    with TestClient(main.app) as client:
        r = client.post("/attempt", json={"student_id": "s", "question_id": "X",
                                          "question": "Solve 2(x+3)=14", "steps": ["2x+3=14"]})
    assert r.status_code == 200
    assert r.json()["diagnosis"]["label"] == "unknown"


# ---------- expression questions (Member 4: "Expand", "Simplify", "Calculate") ----------
@pytest.mark.parametrize("prev,student,label", [
    ("(x+5)^2", "x^2+25", "SQUARE_OF_SUM"),
    ("(2x+3)^2", "4x^2+9", "SQUARE_OF_SUM"),
    ("3x+5", "8x", "UNLIKE_TERMS"),
    ("(-3)*(-4)", "-12", "NEG_TIMES_NEG"),
    ("(-4)*(-3x)", "-12x", "NEG_TIMES_NEG"),
    ("-(x+8)", "-x+8", "NEGATIVE_DISTRIBUTION"),
])
def test_expression_questions_are_diagnosed(prev, student, label):
    d, trace = pipeline.diagnose(prev, student)
    assert d["label"] == label and d["source"] == "rule"
    assert trace["expression_mode"] is True


@pytest.mark.parametrize("question,steps,label", [
    ("Expand (x+5)^2", ["x^2+25"], "SQUARE_OF_SUM"),
    ("Simplify 3x+5", ["8x"], "UNLIKE_TERMS"),
    ("Calculate (-3)*(-4)", ["-12"], "NEG_TIMES_NEG"),
    ("Simplify -(x+8)", ["-x+8"], "NEGATIVE_DISTRIBUTION"),
])
def test_attempt_with_expression_questions(question, steps, label):
    from fastapi.testclient import TestClient
    from backend.main import app

    with TestClient(app) as client:
        r = client.post("/attempt", json={"student_id": "s_expr", "question_id": "X",
                                          "question": question, "steps": steps})
    assert r.status_code == 200
    assert r.json()["diagnosis"]["label"] == label

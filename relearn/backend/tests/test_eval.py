"""Tests for Step 11 - evaluation output matches Member 3's Model Performance panel."""
import json
from pathlib import Path

import pytest

from backend.eval.run_eval import LABELS, run

MOCK = Path(__file__).parents[2] / "member-3-visuals" / "frontend" / "src" / "mocks" / "evalSummary.json"


@pytest.fixture(scope="module")
def summary(tmp_path_factory):
    return run(out=tmp_path_factory.mktemp("eval") / "eval_results.json")


def test_has_every_key_the_panel_reads(summary):
    mock = json.loads(MOCK.read_text(encoding="utf-8"))
    for key in ("headline", "labels", "confusion_matrix", "ablation", "composition", "leave_one_out"):
        assert key in summary, key
    for key in mock["headline"]:
        assert key in summary["headline"], key


def test_confusion_matrix_shape(summary):
    n = len(LABELS)
    assert summary["labels"] == LABELS
    assert len(summary["confusion_matrix"]) == n and all(len(row) == n for row in summary["confusion_matrix"])


def test_traces_are_not_called_real_by_default(summary):
    assert summary["test_traces_kind"] == "hand_authored"
    assert summary["headline"]["real_rows"] == 0
    assert summary["headline"]["real_trace_accuracy"] is None
    assert all(c["real"] == 0 for c in summary["composition"])


def test_ablation_includes_hybrid_and_scores_are_fractions(summary):
    systems = {a["system"]: a["accuracy"] for a in summary["ablation"]}
    assert "Hybrid (full)" in systems
    assert all(0.0 <= v <= 1.0 for v in systems.values())


def test_leave_one_out_covers_all_six(summary):
    assert len(summary["leave_one_out"]) == 6
    assert all(0.0 <= l["routed_to_unknown"] <= 1.0 for l in summary["leave_one_out"])

"""Tests for Step 8 - features, training and prediction."""
import numpy as np
import pytest

from backend.model.features import FEATURE_NAMES, extract
from backend.model.predict import model_available, predict
from backend.model.train import load, train_final


def test_feature_vector_has_fixed_length():
    assert len(extract("2(x+3)=14", "2x+3=14")) == len(FEATURE_NAMES)


def test_features_never_crash_on_odd_input():
    assert len(extract("x^3=8", "x=2")) == len(FEATURE_NAMES)        # cubic
    assert len(extract("2(x+3)=14", "2x+6=14")) == len(FEATURE_NAMES)


def test_correct_step_is_marked_equivalent():
    f = dict(zip(FEATURE_NAMES, extract("2(x+3)=14", "2x+6=14")))
    assert f["equivalent"] == 1.0


def test_training_pipeline_on_small_sample():
    X, y, *_ = load()
    idx = np.random.RandomState(0).choice(len(y), 600, replace=False)
    model = train_final(X[idx], y[idx], n_estimators=30)
    assert set(model.classes_) == set(y[idx])


@pytest.mark.skipif(not model_available(), reason="run python -m backend.model.train first")
@pytest.mark.parametrize("prev,student,label", [
    ("3(x+4)=21", "3x+4=21", "PARTIAL_DISTRIBUTION"),
    ("2(x+3)=14", "2x=11", "PARTIAL_DISTRIBUTION"),      # skipped a step
    ("(x+5)^2=64", "x^2+25=64", "SQUARE_OF_SUM"),
    ("-(x+6)=2", "-x+6=2", "NEGATIVE_DISTRIBUTION"),
    ("x+5=10", "x=15", "TRANSPOSITION"),
    ("4x+3=19", "7x=19", "UNLIKE_TERMS"),
    ("(-2)(-5x)=30", "-10x=30", "NEG_TIMES_NEG"),
    ("2x+6=14", "2x=8", "NONE"),
])
def test_saved_model_predictions(prev, student, label):
    top = predict(prev, student)
    assert top[0]["label"] == label
    assert top == sorted(top, key=lambda p: -p["prob"])

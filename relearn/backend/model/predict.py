"""Load the trained model once and predict misconception probabilities."""
from functools import lru_cache

import joblib

from .features import extract
from .train import MODEL_PATH


@lru_cache(maxsize=1)
def _bundle():
    return joblib.load(MODEL_PATH)


def model_available() -> bool:
    return MODEL_PATH.exists()


def predict(prev_step: str, student_step: str, top_k: int = 3) -> list[dict]:
    """Top-k labels with probabilities, highest first. [] if no model is saved."""
    if not model_available():
        return []
    model = _bundle()["model"]
    probs = model.predict_proba([extract(prev_step, student_step)])[0]
    ranked = sorted(zip(model.classes_, probs), key=lambda p: -p[1])[:top_k]
    return [{"label": str(label), "prob": round(float(p), 4)} for label, p in ranked]

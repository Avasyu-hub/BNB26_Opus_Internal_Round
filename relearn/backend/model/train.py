"""Step 8 - Train and evaluate the misconception classifier.

Run:  python -m backend.model.train

Two honest evaluations, both on data the model never saw while training:
  1. unseen_equations  - 20% of equations held out (grouped by prev_step, so
                         no equation appears in both train and test).
  2. unseen_templates  - leave-one-template-out: train on 12 equation shapes,
                         test on the 13th. Harder, closer to real students.
Each is compared with a TF-IDF character n-gram baseline.

Note: a pure train/test split by template is impossible here, because
SQUARE_OF_SUM and NEG_TIMES_NEG each come from very few templates; holding
those out would remove the label from training entirely.
"""
import argparse
import csv
import json
import time
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit

from .features import FEATURE_NAMES, extract

DATA = Path(__file__).parents[1] / "data" / "misconception_dataset.csv"
MODEL_PATH = Path(__file__).parent / "model.joblib"
REPORT_PATH = Path(__file__).parent / "training_report.json"
SEED = 0


def load(path=DATA):
    with open(path, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    X = np.array([extract(r["prev_step"], r["student_step"]) for r in rows])
    y = np.array([r["label"] for r in rows])
    text = [f"{r['prev_step']} || {r['student_step']}" for r in rows]
    groups = np.array([r["prev_step"] for r in rows])
    templates = np.array([r["template_id"] for r in rows])
    return X, y, text, groups, templates


def make_model(n_estimators=300):
    return RandomForestClassifier(
        n_estimators=n_estimators, min_samples_leaf=2,
        class_weight="balanced", random_state=SEED, n_jobs=-1,
    )


def make_baseline():
    return TfidfVectorizer(analyzer="char", ngram_range=(1, 4)), \
        LogisticRegression(max_iter=3000, class_weight="balanced")


def eval_unseen_equations(X, y, text, groups):
    tr, te = next(GroupShuffleSplit(1, test_size=0.2, random_state=SEED).split(X, y, groups))
    model = make_model().fit(X[tr], y[tr])
    pred = model.predict(X[te])
    vec, lr = make_baseline()
    lr.fit(vec.fit_transform([text[i] for i in tr]), y[tr])
    base = lr.predict(vec.transform([text[i] for i in te]))
    labels = sorted(set(y))
    return {
        "test_rows": int(len(te)),
        "model_accuracy": round(accuracy_score(y[te], pred), 4),
        "baseline_accuracy": round(accuracy_score(y[te], base), 4),
        "per_label": {k: round(v["f1-score"], 4) for k, v in
                      classification_report(y[te], pred, output_dict=True, zero_division=0).items()
                      if k in labels},
        "confusion_matrix": {"labels": labels,
                             "matrix": confusion_matrix(y[te], pred, labels=labels).tolist()},
    }


def eval_unseen_templates(X, y, text, templates):
    per_template, m_scores, b_scores = {}, [], []
    for t in sorted(set(templates)):
        train = templates != t
        test = (templates == t) & np.isin(y, np.unique(y[train]))
        if not test.any():
            continue
        model = make_model(200).fit(X[train], y[train])
        vec, lr = make_baseline()
        lr.fit(vec.fit_transform([text[i] for i in np.where(train)[0]]), y[train])
        m = accuracy_score(y[test], model.predict(X[test]))
        b = accuracy_score(y[test], lr.predict(vec.transform([text[i] for i in np.where(test)[0]])))
        per_template[t] = {"rows": int(test.sum()), "model": round(m, 4), "baseline": round(b, 4)}
        m_scores.append(m)
        b_scores.append(b)
    return {
        "model_accuracy": round(float(np.mean(m_scores)), 4),
        "baseline_accuracy": round(float(np.mean(b_scores)), 4),
        "per_template": per_template,
    }


def train_final(X, y, n_estimators=300):
    return make_model(n_estimators).fit(X, y)


def save(model, report, path=MODEL_PATH):
    joblib.dump({"model": model, "feature_names": FEATURE_NAMES,
                 "labels": list(model.classes_), "report": report}, path, compress=3)


def main():
    ap = argparse.ArgumentParser(description="Train the misconception classifier")
    ap.add_argument("--quick", action="store_true", help="skip leave-one-template-out (faster)")
    args = ap.parse_args()

    t0 = time.time()
    X, y, text, groups, templates = load()
    print(f"Loaded {len(y)} rows, {X.shape[1]} features ({time.time() - t0:.0f}s)")

    report = {"rows": int(len(y)), "features": FEATURE_NAMES}
    report["unseen_equations"] = eq = eval_unseen_equations(X, y, text, groups)
    print(f"\nUnseen equations  ({eq['test_rows']} test rows)")
    print(f"  model    {eq['model_accuracy']:.1%}")
    print(f"  baseline {eq['baseline_accuracy']:.1%}  (TF-IDF + logistic regression)")
    for label, f1 in eq["per_label"].items():
        print(f"    {label:22} F1 {f1:.3f}")

    if not args.quick:
        report["unseen_templates"] = tp = eval_unseen_templates(X, y, text, templates)
        print("\nUnseen equation shapes (leave-one-template-out)")
        print(f"  model    {tp['model_accuracy']:.1%}")
        print(f"  baseline {tp['baseline_accuracy']:.1%}")

    model = train_final(X, y)
    save(model, report)
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"\nSaved {MODEL_PATH.name} and {REPORT_PATH.name} ({time.time() - t0:.0f}s total)")


if __name__ == "__main__":
    main()

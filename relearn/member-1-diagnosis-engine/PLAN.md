# Member 1 Plan (Revised) — Diagnosis Engine + Trained Model

> Updated 4 Oct 2026. This file replaces `work.md`. AI agents working in this repo:
> follow THIS file. Do not change field names in `backend/schemas.py` (the JSON
> contract is shared with Members 2–4). Run `pytest -q` after every change.

## Current status

| Step | What | Status |
|---|---|---|
| 1 | Scaffold: FastAPI, CORS, SQLite, Pydantic schemas | ✅ Done (`backend/main.py`, `database.py`, `schemas.py`) |
| 2 | Parser (`backend/engine/parser.py`) | ✅ Done |
| 3 | Checker (`backend/engine/checker.py`) | ✅ Done — 31 tests pass |
| 4 | Generators | ⏭ Next |
| 5–13 | See "Build steps" below | To do |

**Taxonomy decision (confirm with team):** the classifier is trained on the team's
6 labels + `ARITHMETIC_SLIP` + `NONE`. Misconceptions from our dataset that are not
in these 6 (M03, M07, M08, M09, M11, M12) are used as **unseen misconceptions** in
evaluation: the system should answer `unknown` for them.

## Why this revision

The problem statement requires a **trained** model, a visible misconception dataset,
and evaluation on unseen data. The original plan was rules + LLM only.

| Requirement | Original plan | Change |
|---|---|---|
| Misconception Dataset | Only 50–100 eval traces | Dataset factory builds thousands of labeled rows (correct + incorrect) from the generators |
| Misconception Model | Rules + LLM, nothing trained | scikit-learn classifier on step-pair features |
| Differentiation | Generate-and-match | Kept, plus model top-3 probabilities as `candidates` |
| Resolution Assessment | Retry checked final answer only | Retry steps go through the full diagnosis pipeline |
| Learner Model | One stage per misconception | `occurrence_count` + `recurred` stage |
| Evaluation on unseen data | No train/test split | Held-out templates, leave-one-out, real traces as test set only |

## Hybrid diagnosis pipeline

1. **Localise.** The checker compares solution sets of consecutive lines (question = line −1). First mismatch = `error_step_index`. (If every line is equivalent, the answer is correct — arithmetic slips appear as a normal error step and the classifier labels them `ARITHMETIC_SLIP`.)
2. **Predict.** Classifier takes (previous line, wrong line) → probabilities over 8 classes: 6 misconceptions, `ARITHMETIC_SLIP`, `NONE`.
3. **Verify with rules.** Run all generators on the previous line. Exact reproduction of the student's line → `source: "rule"`, confidence 0.95. Log model disagreements for the ablation.
4. **Trust the model.** No rule match but top probability ≥ 0.60 → `source: "model"`, confidence = probability capped at 0.90.
5. **LLM fallback.** Otherwise constrained LLM; label must be in the taxonomy; confidence clamped to 0.70; `source: "llm"`.
6. **Unknown.** Anything else → `label: "unknown"`.

Every diagnosis includes `candidates` (model top 3 with probabilities).

### Classifier features
Rewrite both lines as `lhs − rhs = 0` and expand. Features: degree, term count,
coefficients; previous line has brackets / squared bracket / minus before bracket;
x coefficient and constant match the correct expansion?; partial-distribution signal
(student constant = un-multiplied bracket constant); square-of-sum signal (missing 2ab);
sign-flip count; transposition signal (term crossed `=` without sign change);
unlike-terms signal (x-term and constant merged); char n-gram TF-IDF of
`prev || student` as backup. Main model: Random Forest (`class_weight="balanced"`).
Baseline: logistic regression on TF-IDF only.

## Build steps

After every step: `pytest -q` → commit → push.

**Step 4 — Generators** (`backend/engine/generators.py`, Hours 3–6)
One function per label taking the previous line (string) and returning the wrong
next line (string) or `None`. Expose `GENERATORS = {label: fn}`. Parse with
`evaluate=False` (SymPy auto-expands `2*(x+3)` otherwise). Never raise.
Examples: `2(x+3)=14 → 2x+3=14` (PARTIAL_DISTRIBUTION), `(x+2)^2=25 → x^2+4=25`
(SQUARE_OF_SUM), `-(x+4)=6 → -x+4=6` (NEGATIVE_DISTRIBUTION), `x+5=10 → x=10+5`
(TRANSPOSITION), `3x+5=16 → 8x=16` (UNLIKE_TERMS), `(-2)(-3x)=12 → -6x=12`
(NEG_TIMES_NEG), one number off by ±1–3 (ARITHMETIC_SLIP).
Done when: each generator works on its example AND on new equations (e.g. `5(x-2)=20`), and returns `None` on unrelated lines.

**Step 5 — Matcher** (`backend/engine/matcher.py`, Hour 6)
Run all generators on the line before the error step; compare outputs to the
student's line by solution set; return all matches.
Done when: `2(x+3)=14 → 2x+3=14` → PARTIAL_DISTRIBUTION, confidence 0.95.

**Step 6 — Integration with Member 2** (Hours 6–7)
Replace the `unknown` placeholder in `/attempt` with the matcher.

**Step 7 — Dataset factory** (`backend/dataset/factory.py`, Hours 7–8.5)
~12 templates (`a(x+b)=c`, `(x+a)^2=c`, `x+a=b`, `-(x+a)=b`, …) × random numbers ×
generators + correct step (`NONE`) + noisy rows. Export
`misconception_dataset.csv` (`row_id,template_id,prev_step,student_step,label,source`).
Done when: 3,000–5,000 rows, ≥300 per label.

**Step 8 — Features + training** (`backend/model/features.py`, `train.py`, Hours 8.5–10)
Split train/test **by `template_id`**, never random rows. Save `model.joblib`.
Done when: held-out-template accuracy printed and beats the TF-IDF baseline.

**Step 9 — Pipeline + LLM fallback** (`backend/engine/pipeline.py`, `fallback.py`, Hours 10–11.5)
Cascade above; `candidates` field; API key from `.env`.

**Step 10 — Retry, transfer, recurrence** (Hours 11.5–12.5)
`/retry` takes `steps`; passes only if correct AND original misconception absent.
`/transfer` grades by `answer_type` (expression: `simplify(a-b)==0`; equation:
solution set; code_assignment: same target + equal RHS; text: LLM rubric at
temperature 0) and requires **two consecutive** passes (dataset resolution policy).
Call `db.record_diagnosis()` on every diagnosis (recurrence logic already exists).

**Step 11 — Core Gate** (Hours 12.5–13)
`backend/eval/run_eval.py` skeleton, `GET /eval/summary`, checklist below, `git tag core-v1`.

**Step 12 — Full evaluation** (Hours 13–15)
Real traces (test only), unseen misconceptions → `unknown` rate, ablation
(rules / model / LLM / hybrid), confusion matrix → `eval_results.json`.

**Step 13 — Wow routes** (Hours 15–18, only if time)
`POST /photo-to-steps`, then `GET /student/{id}/history`.

## Core Gate checklist

- [ ] All 6 generators reproduce their misconception; matcher labels them with 0.95
- [ ] `misconception_dataset.csv` exists with every class including `NONE`
- [ ] Classifier beats TF-IDF baseline on held-out templates
- [ ] LLM fallback rejects out-of-taxonomy labels, never > 0.70
- [ ] `/retry` passes only if correct AND misconception absent
- [ ] `/transfer` grades all answer types correctly
- [ ] Re-diagnosed resolved misconception → `recurred`, `occurrence_count` +1
- [ ] No 500 errors; records persist in `relearn.db`
- [ ] 3 consecutive full-loop runs succeed
- [ ] Committed and tagged `core-v1`

## Contract changes (all optional, safe defaults)

`diagnosis.source`: `"rule" | "model" | "llm"`. New `diagnosis.candidates`:
`[{"label": "...", "prob": 0.91}, …]` (default `[]`). Labels: 6 misconceptions +
`ARITHMETIC_SLIP` + `unknown`. `/attempt` response also has `check_status`
(`correct | step_error | incomplete | cannot_verify`).

`POST /retry` request: `{"student_id", "question_id", "steps": [...]}` → response
`{"stage": "retry_passed" | "retry_failed_same" | "retry_failed_new", "error_step_index", "diagnosis", "retry_count"}`.

`GET /eval/summary`: `dataset` (rows, per_label, real_rows), `error_step_accuracy`,
`diagnosis_accuracy` (heldout_templates, real_traces), `unknown_rate`, `ablation`,
`leave_one_out`, `confusion_matrix`.

## Dependencies

| From | Needed | By hour |
|---|---|---|
| Member 4 | `questions.json` with `answer_type` on transfer items | 3 |
| Member 4 | 2–3 confusable question pairs | 5 |
| Member 4 | LLM fallback prompt | 10 |
| Member 4 | 50–100 real traces — **test set only** | 13 |
| Member 2 | Retry screen sends `steps` | 11 |
| Member 3 | Panel reading `/eval/summary` + `candidates` bars | 15 |

## Pitfalls

- **Data leakage:** split by `template_id`, never random rows.
- **Real traces never in training.**
- **Class imbalance:** check per-label counts; `class_weight="balanced"`.
- **Generators return `None`**, never raise.
- **Implicit multiplication:** always use the `TRANSFORMS` tuple from `parser.py`.
- **`evaluate=False`** when a generator needs to see brackets.
- **`solveset` surprises:** `S.Reals`, `EmptySet`, `ConditionSet` → handled in checker as `cannot_verify`.
- **Confidence caps:** model ≤ 0.90, LLM ≤ 0.70, rule = 0.95.
- **Load `model.joblib` once at startup**; commit it so the demo works without retraining.

# Member 1 Work Distribution — Diagnosis Engine (Backend Brain)

> **Role:** Backend Architecture, Symbolic Engine & Diagnostic Pipeline  
> **Primary Technology Stack:** Python 3.10+, FastAPI, SymPy, SQLite, LLM API (JSON mode)  
> **Key Rule:** Complete **Stage 1 (Core)** and pass the **Core Gate** before touching any Stage 2 Wow tasks.

---

## 1. Responsibility Summary

Member 1 owns the computational brain of Re:Learn:
- Input sanitization and SymPy mathematical expression parsing.
- Deterministic step-by-step equivalence evaluation to pinpoint `error_step_index` (C1).
- The 6 candidate misconception generators and generate-and-match engine (C2).
- Constrained LLM diagnostic fallback engine with strict taxonomy enforcement (C3).
- SQLite persistence schema (`attempts`, `learner_profile`) and state update logic.
- Core API route implementations: `/questions`, `/attempt`, `/retry`, `/transfer`.
- Automated evaluation harness benchmarking real student traces.
- Backend support for Wow features (vision proxy `/photo-to-steps`, `/student/{id}/history`).

---

## 2. Features Owned

### Core Features (Stage 1)
- **C1: Step-Level Error Localisation**
- **C2: Generate-and-Match Diagnosis (6 Misconceptions)**
- **C3: Constrained LLM Fallback**
- **Core API Endpoints:** `GET /questions`, `POST /attempt`, `POST /retry`, `POST /transfer`
- **Database Architecture:** SQLite schema definition and repository operations

### Wow Layer Features (Stage 2)
- **W1 Backend Support:** `/photo-to-steps` endpoint support for Member 2
- **W6 Backend Support:** `GET /student/{id}/history` timeline endpoint
- **Evaluation Execution:** Real data benchmarking script across 50–100 authentic student solutions

---

## 3. Stage 1 — Core Execution Plan (Hours 0–13)

> **Early Completion Protocol:** If you complete your Stage 1 core tasks before Hour 13, **do not write Wow code**. Assist Member 2 and Member 4 with end-to-end integration, edge-case parsing tests, or synthetic validation.

### Ordered Task List

#### Hours 0–1: Foundation & Project Scaffolding
1. Initialize FastAPI application in `backend/main.py`.
2. Configure CORS middleware allowing `http://localhost:5173`.
3. Create SQLite database initializer `backend/database.py` with tables:
   - `attempts` (`attempt_id`, `student_id`, `question_id`, `steps_json`, `error_step_index`, `diagnosis_json`, `telemetry_json`, `created_at`)
   - `learner_profile` (`student_id`, `misconception_id`, `stage`, `last_attempt_id`, `updated_at`)
4. Create Pydantic data schemas mirroring the locked JSON contract.
5. Create temporary mock route for `POST /attempt` to unblock Member 2 frontend setup.

#### Hours 1–6: Mathematical Engine & First 3 Generators
1. **Parser & Normaliser (`backend/engine/parser.py`):**
   - Clean unicode minus `\u2212` $\to$ ASCII `-`.
   - Replace carat `^` with `**`.
   - Configure SymPy `standard_transformations + (implicit_multiplication_application, convert_xor)`.
   - If `parse_expr` fails, catch syntax error and return HTTP 422 with the exact failing line index.
2. **Step Equivalence Checker (`backend/engine/checker.py`):**
   - For step $k$ and step $k-1$: evaluate solution sets via `solveset(Eq(lhs, rhs), x)`.
   - First mismatch flags `error_step_index = k`.
   - If all steps have identical solution sets but final line is incorrect, flag as `arithmetic_slip`.
3. **First 3 Misconception Generators (`backend/engine/generators.py`):**
   - `gen_partial_distribution(prev_step)`: generates $2(x+3) \to 2x+3$ or $a(bx+c) \to abx+c$.
   - `gen_square_of_sum(prev_step)`: generates $(a+b)^2 \to a^2+b^2$.
   - `gen_negative_distribution(prev_step)`: generates $-(x+c) \to -x+c$.
4. **Candidate Matcher (`backend/engine/matcher.py`):**
   - Compare student's `error_step` against generated candidate expressions.
   - If match found: return `label`, `evidence`, `root_concept`, `source: "rule"`, `confidence: 0.95`.

#### Hours 6–7: Integration Milestone #1
- Connect FastAPI `/attempt` with Member 2 frontend for `PARTIAL_DISTRIBUTION`.
- Verify full flow: User types `2(x+3)=14 \to 2x+3=14` $\to$ Backend returns `error_step_index: 0`, `label: "PARTIAL_DISTRIBUTION"`.
- Verify `/retry` and `/transfer` update `stage` in SQLite.

#### Hours 7–13: Remaining Generators, LLM Fallback & Core Gate Prep
1. **Remaining 3 Misconception Generators:**
   - `gen_transposition(prev_step)`: generates $x+5=10 \to x=10+5$ or $x-c=d \to x=d-c$.
   - `gen_unlike_terms(prev_step)`: generates $3x+5 \to 8x$.
   - `gen_neg_times_neg(prev_step)`: generates $(-a)(-b) \to -ab$.
2. **Constrained LLM Fallback (`backend/engine/fallback.py`):**
   - If matcher returns no match, invoke LLM fallback using Member 4's prompt template.
   - Force JSON schema: `{"label": "...", "evidence": "...", "confidence": 0.0}`.
   - Strict validation: Label must be in `["PARTIAL_DISTRIBUTION", "SQUARE_OF_SUM", "NEGATIVE_DISTRIBUTION", "TRANSPOSITION", "UNLIKE_TERMS", "NEG_TIMES_NEG", "unknown"]`.
   - Enforce confidence ceiling: `confidence = min(reported_confidence, 0.70)`. Set `source: "llm"`.
3. **Core Endpoints Finalization:**
   - `GET /questions`: serve Member 4's hand-verified `questions.json`.
   - `POST /retry`: evaluate answer against question rubric, set stage to `retry_passed`.
   - `POST /transfer`: evaluate transfer answer, set stage to `transfer_passed` or `transfer_failed`.
4. **Evaluation Harness Skeleton (`backend/eval/run_eval.py`):**
   - Read JSON array of test cases; compute error localisation accuracy and diagnostic accuracy.

---

## 4. Core Gate Verification (Hour 13)

Before proceeding to Stage 2, verify your share of the Core Gate:
- [ ] All 6 generators correctly identify synthetic wrong steps for their corresponding misconceptions.
- [ ] LLM fallback properly handles unfamiliar errors and strictly rejects out-of-taxonomy labels.
- [ ] `/attempt`, `/retry`, and `/transfer` execute without 500 errors and persist records in SQLite `relearn.db`.
- [ ] 3 consecutive full-loop automated tests run with 100% success.
- [ ] Code is committed and tagged `core-v1`.

---

## 5. Stage 2 — Wow Layer Execution Plan (Hours 13–18)

> **MANDATORY NOTICE:** Do not start until the Core Gate is passed and tagged `core-v1`.
> Work strictly on isolated git branches behind feature toggles.

### Ordered Task List

1. **W1 Backend Support — Vision Route (`POST /photo-to-steps`) (Priority 1):**
   - Receive multipart image upload.
   - Send image to Multimodal LLM API with vision prompt: *"Extract student's handwritten algebra lines into a JSON array of strings in mathematical order."*
   - Return `{"steps": ["2(x+3)=14", "2x+3=14", "2x=11", "x=5.5"]}`.
2. **W6 Backend Support — History Endpoint (`GET /student/{id}/history`) (Priority 5):**
   - Query SQLite `attempts` and `learner_profile` for requested `student_id`.
   - Return chronological array of attempt stages, timestamps, and active node states for Member 3's timeline.
3. **Phase 5 Prep — Real Data Evaluation Harness Execution:**
   - Ingest Member 4's 50–100 authentic student solutions (`evaluation_set.json`).
   - Run benchmark: Calculate Error Step Accuracy, Rule Match Rate, LLM Match Rate, and % "Unknown".

---

## 6. Contracts & Interfaces to Follow

### 6.1 Locked JSON Contract (Attempt Schema)
```json
{
  "attempt_id": "uuid",
  "student_id": "s_07",
  "question_id": "PD_02",
  "question": "Solve 2(x+3)=14",
  "steps": ["2x+3=14", "2x=11", "x=5.5"],
  "input_mode": "typed",
  "explanation": null,
  "telemetry": {"ms_per_step": [9100, 4200, 3000], "deletions": 6, "edits": 3},
  "error_step_index": 0,
  "diagnosis": {
    "label": "PARTIAL_DISTRIBUTION",
    "source": "rule",
    "confidence": 0.95,
    "evidence": "2 was multiplied with x but not with 3",
    "root_concept": "DISTRIBUTIVE_LAW"
  },
  "confidence_signal": null,
  "language": "en",
  "stage": "diagnosed"
}
```

### 6.2 Endpoints Owned
- `GET /questions` $\to$ Returns catalog of questions from `questions.json`.
- `POST /attempt` $\to$ Ingests steps; returns error index and diagnosis.
- `POST /retry` $\to$ Ingests `{ "student_id", "question_id", "answer" }`; updates stage to `retry_passed`.
- `POST /transfer` $\to$ Ingests `{ "student_id", "question_id", "answer" }`; updates stage to `transfer_passed` or `transfer_failed`.
- `GET /student/{id}/history` $\to$ Ingests `student_id`; returns chronological attempt records.

---

## 7. Inputs, Dependencies & Deliverables

| Dependency From | Deliverable Needed | Needed By | What to Use Until Available |
|---|---|---|---|
| **Member 4** | Hand-verified `questions.json` | Hour 3 | Use hardcoded 2-question mock bank |
| **Member 4** | Constrained LLM fallback prompt text | Hour 7 | Use minimal test prompt forcing JSON |
| **Member 4** | 50–100 real student error traces | Hour 18 | Use 10 hand-crafted synthetic cases |
| **Member 2** | Frontend integration requests | Hour 6 | Use Postman / curl / pytest |

### Member 1 Deliverables
1. Working FastAPI backend running on port 8000.
2. SymPy sanitization and solution-set equivalence pipeline.
3. 6 Deterministic misconception generators + candidate matcher.
4. Constrained LLM fallback client with taxonomy validator.
5. SQLite schema and repository methods for persistence.
6. Automated evaluation runner generating benchmark metrics.

---

## 8. Definition of Done

### Stage 1 (Core Gate Contribution)
- All 6 misconceptions are deterministically generated and matched with `confidence: 0.95`.
- Step equivalence checker reliably catches algebraic violations on test suites.
- Core endpoints respond with status 200 adhering strictly to the JSON contract.
- SQLite writes learner profile records accurately.
- Passes all 6 Core Gate verification criteria.

### Stage 2 (Wow Layer Contribution)
- `/photo-to-steps` parses sample handwritten test images into JSON step arrays.
- `/student/{id}/history` returns chronological records formatted for Recharts.
- Evaluation script completes benchmark across real data and outputs summary table.
- All code sits on dedicated branches and merges without breaking `core-v1`.

---

## 9. Implementation Notes & Potential Pitfalls

- **Implicit Multiplication in SymPy:** Never call bare `parse_expr("2(x+3)")`. Always pass the transformations tuple: `standard_transformations + (implicit_multiplication_application, convert_xor)`.
- **Unicode Minus Trap:** Students and web scrapers often use `\u2212` (`−`) instead of ASCII `-` (`\u002d`). Always execute `.replace('\u2212', '-')` before parsing.
- **Equation Solution Sets:** Use `solveset(Eq(lhs, rhs), x, domain=S.Reals)`. Beware of identities (returns `S.Reals`) and contradictions (returns `EmptySet`).
- **LLM Confidence Cap:** Never allow the LLM fallback to set confidence $> 0.70$. Explicitly clamp it in Python code: `conf = min(float(resp.get('confidence', 0.5)), 0.70)`.

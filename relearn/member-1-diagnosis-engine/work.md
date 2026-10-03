# Member 1: Diagnosis Engine (Backend Brain) — Work Specification

> **Module Owner:** Member 1 (P1)  
> **Core Focus:** Symbolic Math Engine, Generate-and-Match Diagnosis, LLM Fallback, Backend APIs, Persistence & Evaluation Script  
> **Key Mantra:** *"Symbolic-first, deterministic, explainable. The LLM only explains or handles cases rules cannot match."*

---

## 1. Responsibility Summary

Member 1 is the backend architect and mathematical engine lead for Re:Learn. You are responsible for:
1. Robustly parsing, sanitizing, and normalizing student-written algebraic equations into SymPy expressions.
2. Checking mathematical equivalence between consecutive steps to pinpoint the exact 0-indexed error step (Feature C1).
3. Implementing the 6 deterministic misconception generator functions that model common cognitive errors and matching them against the student's step to produce explainable diagnoses with evidence (Feature C2).
4. Implementing the constrained LLM fallback prompt for edge cases, guaranteeing it picks strictly from the 6 fixed labels or returns `"unknown"` with confidence capped at $0.70$ (Feature C3).
5. Implementing core FastAPI endpoints: `/attempt`, `/retry`, `/transfer`, and the `/questions` route.
6. Designing and maintaining the SQLite database schema and persisting attempts and learner profile state transitions.
7. Building and running the automated evaluation benchmark script (`evaluate.py`) against 50–100 real student solutions.

---

## 2. Features & Components Owned

| Feature ID | Feature Name | Description | Status / Layer |
|---|---|---|---|
| **C1** | Step-Level Error Localisation | SymPy solution-set equivalence checker between steps $k-1$ and $k$. | Core (Hour 1–6) |
| **C2** | Generate-and-Match Diagnosis | 6 transformation generators + matcher logic returning label, evidence, root concept. | Core (Hour 1–13) |
| **C3** | Constrained LLM Fallback | Guardrailed prompt picking strictly from fixed list + "unknown" (capped at 0.70). | Core (Hour 7–13) |
| **C5 / C6 Backend** | Retry & Transfer Endpoints | Backend verification logic for same-domain retry and cross-domain transfer answers. | Core (Hour 7–13) |
| **API Endpoints** | `/attempt`, `/retry`, `/transfer`, `/questions` | FastAPI endpoints handling JSON payload processing and responses. | Core (Hour 1–13) |
| **Persistence** | SQLite Schema & Learner Profile Writes | Relational database schema for attempts, profiles, and state transitions. | Core (Hour 7–13) |
| **Evaluation** | Benchmark Script (`evaluate.py`) | Automation script calculating step accuracy, diagnosis accuracy, and % unknown. | Eval (Hour 18–20) |

---

## 3. Ordered Task Breakdown & Timeline

### Hours 0 – 1: Foundation & Contracts
- Confirm the Shared JSON Contract in `relearn/memory.md`.
- Set up Python virtual environment (`python -m venv venv`), install `fastapi`, `uvicorn`, `sympy`, `pydantic`, `httpx`, `python-dotenv`.
- Verify Git repository and verify test fixtures.

### Hours 1 – 6: Parallel Core Build on Mocks
- **Task 1.1: Input Sanitization & SymPy Parsing:**
  - Build `parse_eq(s: str) -> sympy.Eq`:
    - Replace unicode minus (`−`, `\u2212`) with standard ASCII `-`.
    - Replace caret `^` with `**`.
    - Parse using standard transformations + `implicit_multiplication_application`.
    - Split on `=` to create LHS and RHS expressions.
    - Gracefully raise a custom `UnparseableLineError` with the line index if parsing fails.
- **Task 1.2: Equivalence Checker:**
  - Build `is_equivalent(eq1, eq2, var='x') -> bool`:
    - Primary check: Compare solution sets `set(solve(eq1, var)) == set(solve(eq2, var))`.
    - Secondary check: Test if `simplify((lhs1 - rhs1) / (lhs2 - rhs2))` is a non-zero constant.
  - Build `first_error(steps: list[str], var='x') -> int | None`:
    - Iterate from line $1$ to $N$; return the first index $k$ where `is_equivalent(eqs[k-1], eqs[k])` is False.
    - If all steps are equivalent but the final answer does not match question target, flag as arithmetic slip.
- **Task 1.3: First 3 Misconception Generators:**
  - `PARTIAL_DISTRIBUTION`: Transforms $a(x+b) \to ax+b$ or $a(x-b) \to ax-b$.
  - `SQUARE_OF_SUM`: Transforms $(a+b)^2 \to a^2+b^2$ or $(a-b)^2 \to a^2-b^2$.
  - `NEGATIVE_DISTRIBUTION`: Transforms $-(ax+b) \to -ax+b$.
- **Task 1.4: Matcher Function:**
  - Build `match_generators(prev_eq, student_eq) -> dict | None`:
    - Executes generators on `prev_eq`, simplifies difference with `student_eq`. If match, returns:
      `{"label": label, "source": "rule", "confidence": 0.95, "evidence": ..., "root_concept": ...}`.
- **Task 1.5: Setup `/attempt` and `/questions` Routes:**
  - Create FastAPI scaffold in `main.py`.
  - Wire `/questions` to serve mock questions provided by Member 4.

### Hours 6 – 7: Integration #1 — PARTIAL_DISTRIBUTION End-to-End
- Connect `/attempt` with Member 2's Step Input frontend.
- Validate live submission of `2(x+3)=14` $\to$ `2x+3=14` $\to$ `error_step_index: 0` $\to$ diagnosis `PARTIAL_DISTRIBUTION` (`confidence: 0.95`, `source: "rule"`).

### Hours 7 – 13: Core Completion (All 6 Misconceptions + Fallback + DB)
- **Task 3.1: Remaining 3 Misconception Generators:**
  - `TRANSPOSITION`: Transforms $x + a = b \to x = b + a$ or $x - a = b \to x = b - a$ (moving term without inverting sign).
  - `UNLIKE_TERMS`: Transforms $ax + b \to (a+b)x$ (merging variable and constant).
  - `NEG_TIMES_NEG`: Transforms $(-a)(-b) \to -ab$ (retaining negative sign).
- **Task 3.2: Constrained LLM Fallback (Feature C3):**
  - Implement fallback function when `match_generators` returns `None`.
  - Prompt enforces:
    - Input: `prev_step`, `student_step`, optional `explanation`.
    - Permitted output: strictly one of the 6 label strings or `"unknown"`.
    - Confidence score capped at `0.70`, returned as `"source: AI estimate"`.
- **Task 3.3: `/retry` and `/transfer` Endpoints:**
  - Validate retry answers against question bank solutions.
  - Advance attempt stage: `diagnosed` $\to$ `retry_passed` $\to$ `transfer_passed` or `transfer_failed`.
- **Task 3.4: SQLite Persistence Layer:**
  - Create tables `attempts`, `learner_states`, `students`.
  - Write helper functions to record attempts and query student history for `/student/{id}/history`.

### Hours 13 – 18: Sleep Rotation & Wow Support
- **13:00 – 15:30:** Assist Member 2 on `/photo-to-steps` vision integration if needed; polish database query performance.
- **15:30 – 18:00:** Scheduled rest / sleep (~2.5 hours).

### Hours 18 – 20: Feature Freeze & Benchmark Evaluation
- Freeze all feature development.
- Execute `evaluate.py` on the 50–100 real student solutions gathered by Member 4.
- Output exact performance metrics for pitch slides. Fix critical parser edge-case crashes.

### Hours 20 – 24: Demo Hardening & Q&A Defense
- Test pre-computed demo caches (`demo_cache.json`).
- Participate in 10+ end-to-end rehearsals.
- Defend the symbolic architecture in judge Q&A drills.

---

## 4. Dependencies & Interface Contracts

### Inputs Needed from Teammates
| Teammate | What You Need | By When | What to Mock Until Received |
|---|---|---|---|
| **Member 4** | `questions.json` (Diagnostic, retry, and transfer questions) | Hour 2 | Use a hardcoded 2-question mock in `main.py`. |
| **Member 4** | Exact fallback prompt text & rules | Hour 7 | Use basic template asking LLM to pick from 6 labels. |
| **Member 4** | 50–100 real student test cases (`eval_real_solutions.json`) | Hour 18 | Test using 10 synthetic unit test cases. |
| **Member 2** | Incoming JSON payload from frontend input screen | Hour 6 | Use `pytest` or `curl`/Postman with the locked contract JSON. |

### Outputs You Deliver to Teammates
| Teammate | Deliverable | By When |
|---|---|---|
| **Member 2** | Working `/attempt` endpoint conforming to Shared Contract | Hour 6 (Integration #1) |
| **Member 2** | Working `/retry` and `/transfer` stage transition endpoints | Hour 10 |
| **Member 3** | Working `/student/{id}/history` endpoint with node states | Hour 12 |
| **Member 4** | Serving `/questions` route and database write operations | Hour 8 |
| **All** | Verified evaluation accuracy numbers from `evaluate.py` | Hour 19 |

---

## 5. API & JSON Contracts to Implement

### 5.1 The Locked Shared Contract (`/attempt` Output)
```json
{
  "attempt_id": "uuid-v4-string",
  "student_id": "s_07",
  "question_id": "PD_02",
  "question": "Solve 2(x+3)=14",
  "steps": ["2x+3=14", "2x=11", "x=5.5"],
  "input_mode": "typed",
  "explanation": "I multiplied the bracket by 2",
  "telemetry": {"ms_per_step": [9100, 4200, 3000], "deletions": 6, "edits": 3},
  "error_step_index": 0,
  "diagnosis": {
    "label": "PARTIAL_DISTRIBUTION",
    "source": "rule",
    "confidence": 0.95,
    "evidence": "2 was multiplied with x but not with 3",
    "root_concept": "DISTRIBUTIVE_LAW"
  },
  "confidence_signal": "low",
  "language": "en",
  "stage": "diagnosed"
}
```

### 5.2 `/retry` and `/transfer` Payload
- **Request (`POST`):**
  ```json
  {
    "attempt_id": "uuid-v4-string",
    "question_id": "PD_RETRY_01",
    "student_answer": "x=6",
    "type": "retry" // or "transfer"
  }
  ```
- **Response:**
  ```json
  {
    "attempt_id": "uuid-v4-string",
    "pass": true,
    "stage": "retry_passed", // or "transfer_passed" / "transfer_failed"
    "feedback": "Correct! You successfully applied the distributive law."
  }
  ```

---

## 6. Definition of Done

### Core Definition of Done (Hour 13 Checkpoint — Non-Negotiable)
- [ ] SymPy cleanly normalizes inputs with implicit multiplication and unicode characters.
- [ ] Equivalence checker accurately localizes the first non-equivalent line across test equations.
- [ ] All 6 misconception generators generate the exact erroneous step patterns.
- [ ] Rule matcher outputs diagnosis with `confidence: 0.95` and human-readable evidence.
- [ ] Constrained LLM fallback correctly catches non-generator errors, picks only from the 6 labels or `"unknown"`, and caps confidence at $\le 0.70$.
- [ ] `/attempt`, `/retry`, `/transfer`, and `/questions` endpoints pass integration tests.
- [ ] SQLite records attempts and learner states accurately.

### Wow & Evaluation Definition of Done (Hour 18–20)
- [ ] `evaluate.py` runs on the 50–100 real student evaluation set and prints formatted accuracy metrics.
- [ ] Demo queries for the live presentation execute within $< 50\text{ ms}$ (backed by `demo_cache.json`).

---

## 7. Implementation Pitfalls & SymPy Quirks

1. **Implicit Multiplication:** Students write `2x` or `3(x+2)`, not `2*x` or `3*(x+2)`. You **must** configure `implicit_multiplication_application` in transformations.
2. **Caret vs Power:** In standard Python, `^` is bitwise XOR. Students write `x^2`. You **must** replace `^` with `**` or use `convert_xor`.
3. **Unicode Minus Signs:** Students and mobile keypads frequently submit unicode minus characters (`\u2212`, `–`) instead of ASCII hyphen `-`. Sanitize strings with `.replace("\u2212", "-")` before passing to SymPy.
4. **Fraction & Float Comparisons:** Never compare floats with `==`. Use `simplify(candidate - student) == 0` or check if `solve(candidate) == solve(student)`.
5. **LLM Hallucinations:** In C3, strictly parse the JSON response and validate `label in GENERATORS.keys() or label == "unknown"`. If the LLM invents an invalid label (e.g. `"SIGN_ERROR"`), reject it programmatically and default to `"unknown"`.

# Re:Learn — Persistent Project Memory & Context Anchor

> **Notice for Developers & AI Coding Agents:** This file serves as the single source of persistent project truth across all sessions, context windows, and subagents. **Read this file before making architectural changes or writing code.** Any deviation from the locked decisions below requires an explicit team consensus.

---

## 1. Project Identity & Purpose

- **Project Name:** Re:Learn — Cross-Domain Misconception Graph Tutor for Algebra
- **One-Line Pitch:** Fixing a wrong answer isn't the same as fixing the misconception. Re:Learn finds the exact step where a student's algebra breaks, diagnoses *why*, teaches it visually, and then checks whether the understanding transfers to physics, geometry and code.
- **Target Audience:** Students in Classes 7–10 (CBSE/ICSE, ages 12–16) and their teachers (who manage classes of 40–60 students).
- **Core Mission:** Traditional tutoring apps mark an incorrect answer, show the worked solution, and move on. Students mimic the mechanical fix without understanding the underlying algebraic structure. The misconception remains active and resurfaces in physics, geometry, and programming. Re:Learn bridges this gap by isolating the step-level breakdown, explaining the conceptual flaw visually, and proving transfer across disciplines.
- **Judge Positioning:** *"Existing systems detect a misconception. We verify whether the fix actually transfers."* We do not claim patentability; we present a novel combination of symbolic error localisation, generate-and-match diagnosis, and cross-domain transfer verification backed by real accuracy numbers.

---

## 2. Core Decisions That Must NOT Change (Locked Directives)

The following architectural and strategic decisions are **permanently locked** for the 24-hour hackathon build. AI agents and contributors must treat them as immutable invariants:

1. **Symbolic-First Diagnosis over Black-Box LLM:**
   - Step equivalence checking and candidate matching **must** run via SymPy first.
   - LLMs must never be the primary judge of algebraic equivalence.
2. **Fixed Label Taxonomy (No Hallucinated Misconceptions):**
   - The diagnosis engine is strictly restricted to the 6 agreed misconceptions:
     1. `PARTIAL_DISTRIBUTION`
     2. `SQUARE_OF_SUM`
     3. `NEGATIVE_DISTRIBUTION`
     4. `TRANSPOSITION`
     5. `UNLIKE_TERMS`
     6. `NEG_TIMES_NEG`
   - If an error does not match any generator rule, the constrained LLM fallback may only choose from these 6 labels or return `"unknown"`. It must never invent new diagnostic tags.
3. **Capped AI Confidence Display:**
   - Diagnostic confidence from generator rules is set to `0.95` (`source: "rule"`).
   - Diagnostic confidence from the LLM fallback is capped at `0.70` (`source: "llm"`) and displayed to the student as `"source: AI estimate"`.
4. **Absolute Exclusion of Webcam / Audio Emotion Monitoring:**
   - No webcam, facial emotion recognition, or audio monitoring.
   - Monitoring minors raises severe COPPA/FERPA/GDPR privacy hurdles and facial emotion recognition is scientifically indefensible in an educational context.
   - Confidence is inferred defensibly through keystroke telemetry (`ms_per_step`, edits, deletions).
5. **Locked Shared JSON Contract:**
   - The contract defined in Section 4 below is locked from Hour 1.
   - No team member or AI agent may rename keys, change data types, or introduce breaking structural changes.
6. **SQLite Single-File Persistence:**
   - No Postgres, MongoDB, Firebase, Supabase, or external auth systems. SQLite handles all attempts and learner profiles with zero infrastructure overhead.
7. **Strict Feature Freeze at Hour 18:**
   - Absolutely no new features after Hour 18, regardless of feasibility. The final 6 hours are strictly reserved for real data evaluation, demo rehearsal, backup video recording, and pitch Q&A prep.
8. **Hand-Verified Content Quality:**
   - All diagnostic, retry, and transfer questions and answer keys must be verified by a human (Member 4). A buggy physics question during live judge evaluation ruins credibility.

---

## 3. High-Level Architecture & Component Map

```text
                               ┌──────────────────────────────────────────────────────────┐
                               │                    FRONTEND (React + Vite)               │
                               │                                                          │
                               │  [Step Input] ──► [Highlight Bad Step] ──► [Diagnosis]  │
                               │        ▲                      │                  │       │
                               │   (W1: Photo)                 ▼                  ▼       │
                               │   (W2: Explain)       [Intervention]      [React Flow]   │
                               │   (W3: Telemetry)     (C4 Visual Proof)   (C7 Graph)     │
                               │                               │                  ▲       │
                               │                               ▼                  │       │
                               │                        [Retry / Transfer]────────┘       │
                               └───────────────────────┬──────────────┬───────────────────┘
                                                       │              │
                                    REST API Requests  │              │  SSE / Data Fetch
                                                       ▼              ▼
                               ┌──────────────────────────────────────────────────────────┐
                               │                    BACKEND (FastAPI)                     │
                               │                                                          │
                               │  /attempt ────────► SymPy Step Equivalence (C1)         │
                               │                            │                             │
                               │                            ▼                             │
                               │                     Generate-and-Match (C2)               │
                               │                            │                             │
                               │                     (if no rule match)                   │
                               │                            ▼                             │
                               │                     Constrained LLM Fallback (C3)        │
                               │                                                          │
                               │  /intervention ───► Visual Proof ID + LLM Text (C4/W5)   │
                               │  /retry, /transfer► Stage Transition Engine (C5/C6)      │
                               │  /questions ──────► Serves Question Bank                 │
                               │  /photo-to-steps ─► Vision OCR Pipeline (W1)             │
                               │  /student/history ─► Learner Profile History (C7/W6)     │
                               │  /class/summary ──► Heatmap & Peer Group Engine (W7)     │
                               └──────────────────────────────┬───────────────────────────┘
                                                              │
                                                              ▼
                               ┌──────────────────────────────────────────────────────────┐
                               │                    DATABASE (SQLite3)                    │
                               │                                                          │
                               │   attempts: [id, student_id, question_id, diagnosis, ...]│
                               │   profiles: [student_id, concept_states, stages, ...]    │
                               │   seeded_class: 40 simulated student profiles            │
                               └──────────────────────────────────────────────────────────┘
```

---

## 4. Locked Shared JSON Contract

Every component and AI agent session must adhere to this exact schema:

```json
{
  "attempt_id": "uuid",
  "student_id": "s_07",
  "question_id": "PD_02",
  "question": "Solve 2(x+3)=14",
  "steps": [
    "2x+3=14",
    "2x=11",
    "x=5.5"
  ],
  "input_mode": "typed | photo",
  "explanation": "I multiplied the bracket by 2",
  "telemetry": {
    "ms_per_step": [9100, 4200, 3000],
    "deletions": 6,
    "edits": 3
  },
  "error_step_index": 0,
  "diagnosis": {
    "label": "PARTIAL_DISTRIBUTION",
    "source": "rule | llm | unknown",
    "confidence": 0.95,
    "evidence": "2 was multiplied with x but not with 3",
    "root_concept": "DISTRIBUTIVE_LAW"
  },
  "confidence_signal": "low | medium | high",
  "language": "en | hi | bn",
  "stage": "diagnosed | retry_passed | transfer_passed | transfer_failed"
}
```

### API Endpoint Index
| Endpoint | Method | Input Summary | Output Summary | Primary Owner |
|---|---|---|---|---|
| `/questions` | `GET` | Optional `?misconception=...` filter | Array of diagnostic, retry, and transfer questions | M1 (Route) / M4 (Content) |
| `/attempt` | `POST` | `question_id`, `steps[]`, `explanation`, `telemetry` | `error_step_index`, `diagnosis` object, `stage` | M1 |
| `/photo-to-steps` | `POST` | `image` (multipart/form-data or base64) | `steps[]` JSON array | M2 (UI & Vision prompt) |
| `/intervention` | `POST` | `label`, `evidence`, `language`, `student_numbers` | `animation_id`, `explanation_text` | M4 (Prompt & Route) |
| `/retry`, `/transfer` | `POST` | `attempt_id`, `question_id`, `student_answer` | `pass: bool`, `stage`, `feedback` | M1 |
| `/student/{id}/history` | `GET` | `student_id` path param | Longitudinal attempt array + current graph node states | M1 (Route) / M3 (Consumer) |
| `/class/summary` | `GET` | Query params (e.g. `class_id`) | Misconception heatmap, peer groups, transfer alerts | M4 (Logic) / M1 (Route) |

---

## 5. Misconception & Root Concept Reference Table

| Misconception ID | Wrong Step Pattern | Root Concept | Visual Proof ID & Model | Transfer Test Domain & Prompt | Expected Verified Answer |
|---|---|---|---|---|---|
| `PARTIAL_DISTRIBUTION` | `2(x+3) -> 2x+3` | `DISTRIBUTIVE_LAW` | `area_model` (Rectangle split into 2·x and 2·3) | Geometry: Rectangle 2 m wide, (x+3) m long. Write area. | `2(x+3) = 2x + 6 m²` |
| `SQUARE_OF_SUM` | `(a+b)² -> a²+b²` | `DISTRIBUTIVE_LAW` | `square_model` (Square split into a², b², and 2ab) | Geometry: Square garden side grows from s to s+2. Area added? | `(s+2)² - s² = 4s + 4` (not 4) |
| `NEGATIVE_DISTRIBUTION` | `-(x+5) -> -x+5` | `DISTRIBUTIVE_LAW`, `INTEGER_RULES` | `number_line_reflect` (Number-line reflection of whole bracket) | Physics: Walk 3 m then 2 m forward; entire trip reversed. Displacement? | `-(3+2) = -5 m` (not `-3+2 = -1`) |
| `TRANSPOSITION` | `x+5=10 -> x=10+5` | `EQUALITY_BALANCE` | `balance_scale` (Balance scale: remove 5 from both pans) | Code: `total = price + tax`. Write line computing price. | `price = total - tax` |
| `UNLIKE_TERMS` | `3x+5 -> 8x` | `LIKE_TERMS` | `tile_grouping` (Grouping tiles: x-tiles vs unit tiles) | Physics: Can you add 3 m + 5 s? What does 3x + 5 mean with units? | `No — different units; 3x + 5 stays as it is` |
| `NEG_TIMES_NEG` | `(-3)(-4) -> -12` | `INTEGER_RULES` | `sign_pattern` (Number line pattern: -3×2, -3×1, -3×0, -3×-1...) | Physics: Temp falls 3°C/h. Time = -4 h. How did it compare 4 hours ago? | `(-3)(-4) = +12 -> 12°C warmer 4 hours ago` |

### Graph Visual State Mapping (C7)
- **`Inactive`** (`#9CA3AF` / Slate Grey): Not yet encountered by this student.
- **`Detected`** (`#F97316` / Vibrant Orange Glow): Diagnosed in Step 6; root concept node glows simultaneously.
- **`Resolved in algebra`** (`#3B82F6` / Electric Blue): Passed same-domain retry question in Step 8.
- **`Transfer verified`** (`#10B981` / Emerald Green): Passed cross-domain transfer challenge in Step 9.
- **`Persists in new context`** (`#EF4444` / Crimson Red Ring): Passed algebra retry but failed cross-domain transfer question.

---

## 6. Current Implementation Status

| Component | Feature ID | Assigned Member | Status | Current Blocker / Dependency | Phase |
|---|---|---|---|---|---|
| SymPy Parser & Equivalence Checker | C1 | Member 1 | Planned | None (starts in Hour 1) | Phase 1 |
| 6 Misconception Generators & Matcher | C2 | Member 1 | Planned | Dependent on C1 parser | Phase 1 & 3 |
| Constrained LLM Fallback Engine | C3 | Member 1 | Planned | Dependent on generator output | Phase 3 |
| Backend API Routes & SQLite Schema | C1, C2, C5, C6 | Member 1 | Planned | Requires locked contract | Phase 1 & 3 |
| Student Input Screen & Error Highlight | C1, C2 shell | Member 2 | Planned | Uses Mock JSON | Phase 1 |
| Retry & Transfer Workflow Screens | C5, C6 | Member 2 | Planned | Dependent on Input screen shell | Phase 3 |
| Photo OCR Pipeline (Vision Model) | W1 | Member 2 | Planned | Requires LLM Vision API key | Phase 4 |
| Confidence Telemetry Capture | W3 | Member 2 | Planned | Independent client-side logic | Phase 4 |
| Hindi / Bengali Language Toggle | W5 | Member 2 | Planned | Dependent on intervention route | Phase 4 |
| 6 SVG/Framer Visual Proof Animations | C4 | Member 3 | Planned | Starts with area & square model | Phase 1 & 3 |
| React Flow Misconception Graph | C7 | Member 3 | Planned | Starts with static skeleton | Phase 1 & 3 |
| Multimodal Fusion Diagnostic Card | W4 | Member 3 | Planned | Dependent on C7 and W1/W2/W3 | Phase 4 |
| Student Knowledge Evolution Timeline | W6 | Member 3 | Planned | Dependent on SQLite schema | Phase 4 |
| Question Bank & Hand-Verified Answers | C1, C5, C6 content | Member 4 | Planned | Hand verification in progress | Phase 1 |
| Prompt Engineering (Fallback & Remediation)| C3, C4 prompts | Member 4 | Planned | Coordinated with Member 1 | Phase 1 |
| Teacher Dashboard & Peer Group Logic | W7 | Member 4 | Planned | Built on seeded 40-student mock | Phase 1 & 4 |
| Real Evaluation Dataset (50–100 samples)| Evaluation | Member 4 | Planned | Gathering from friends/siblings | Phase 1 & 5 |
| Pitch Deck & Demo Script Rehearsal | Pitch | Member 4 | Planned | Continuous iteration | Phase 4, 6, 7 |

---

## 7. Known Issues, Risks & Open Questions

1. **LLM Provider Choice & Rate Limits:**
   - *Risk:* Calling high-latency models during live judging might freeze the UI or hit rate limits.
   - *Mitigation:* Cache the exact demo questions and explanations locally in memory/JSON. If API fails, fallback to local cached responses instantaneously. Support local Ollama (Qwen) as backup.
2. **Messy Handwritten Student Inputs (W1):**
   - *Risk:* Notebook photos may contain crossed-out text, scratch notes, or angled orientations that confuse OCR.
   - *Mitigation:* Explicitly prompt the vision model to ignore crossed-out lines and return strictly sequential valid algebraic equations. If unreadable, fallback to typed input with line-level correction.
3. **Eedi / MAP Data Format Mismatch:**
   - *Risk:* Public Eedi and MAP datasets often contain multiple-choice diagnostic questions or final-answer explanations rather than clean multi-line step derivations.
   - *Mitigation:* Member 4 curates 50–100 authentic step-by-step student attempts directly from school friends, juniors, or siblings. Do not evaluate on synthetic generator outputs to prevent circular accuracy metrics.
4. **SymPy Implicit Multiplication & Unicode Quirks:**
   - *Risk:* Students type `2x`, `3(x+1)`, `x^2`, or use unicode minus characters (`−` vs `-`) and division slashes (`/`), causing `parse_expr` crashes.
   - *Mitigation:* Sanitize strings before parsing: normalize unicode dashes, convert `^` to `**`, apply `implicit_multiplication_application` transformations, and split equations across `=` cleanly.

---

## 8. Maintenance & Update Protocol for Agents

When updating this file during development:
1. **Never delete locked decisions** from Section 2.
2. Update the **Current Implementation Status** table whenever a component advances (e.g. `Planned` -> `In Progress` -> `Testing` -> `Completed`).
3. If a new edge case or pitfall is discovered, document it immediately under Section 7.
4. Keep all feature identifiers strictly aligned with `C1`–`C7` and `W1`–`W7`.

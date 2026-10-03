# Re:Learn — Product Requirements Document (PRD)

---

## 1. Product Overview & Executive Summary

**Re:Learn** is a cross-domain misconception graph tutor for algebra designed for students in Classes 7–10 (CBSE/ICSE, ages 12–16) and their teachers. 

While conventional educational software marks a final answer right or wrong and presents a correct derivation, Re:Learn uses symbolic computation to isolate the precise step where a student's algebraic reasoning breaks, identifies *why* through deterministic generate-and-match diagnosis, remediates the conceptual gap with interactive visual proofs, and verifies whether the conceptual fix successfully transfers across domains into physics, geometry, and computer programming.

---

## 2. Problem Statement & Value Proposition

### 2.1 The Problem
In middle and secondary school algebra:
1. **Mechanical Copying:** When students are shown a correct solution after an incorrect attempt, they copy the mechanical steps without resolving the conceptual misconception.
2. **Silent Persistence:** The misconception remains dormant until the student encounters the same underlying mathematical structure in another discipline (such as physics formulas, geometric expansions, or programming expressions), where neither student nor teacher connects the failure back to algebra.
3. **Teacher Overload:** Teachers managing classrooms of 40–60 students cannot inspect line-by-line working for every student to diagnose latent conceptual gaps.

### 2.2 Re:Learn Solution & Value Proposition
- **Step-Level Explainability:** Evaluates algebraic equivalence step-by-step using SymPy, delivering clear, human-readable evidence for the error.
- **Cross-Domain Transfer Verification (Hero Feature ★):** Verifies if conceptual understanding transfers to other domains, proving whether understanding is genuine or merely memorized.
- **Actionable Teacher Visibility:** Translates individual student attempts into a class-wide misconception graph and actionable transfer alerts.

---

## 3. Target Personas

### 3.1 Student Persona: "Aarav" (Class 8 Student, Age 13)
- **Context:** Struggles with expanding brackets like $2(x+3)$ or negative signs $-(x+5)$. He often remembers rules as disjointed tricks.
- **Pain Point:** Gets frustrated when an app just says "Wrong, answer is $2x+6$". He doesn't see why his $2x+3$ was flawed.
- **Needs:** Clear visual intuition, step-level feedback on his own working, and reassurance in familiar languages (English, Hindi, Bengali).

### 3.2 Teacher Persona: "Mrs. Sharma" (Class 8–9 Math Teacher, 55 Students/Class)
- **Context:** Teaches algebra daily; grading 55 homework notebooks line-by-line is practically impossible.
- **Pain Point:** Sees students pass an algebra quiz, only to hear the physics teacher complain that the same students cannot manipulate $v = u + at$ or $F = ma$.
- **Needs:** An instant heatmap showing which specific misconceptions dominate the class, peer study groups, and alerts for transfer failures.

---

## 4. Core Use Cases

- **UC-1 (Diagnostic Homework Run):** Aarav types or photographs his algebraic derivation for a homework problem. The system highlights his erroneous step, diagnoses `PARTIAL_DISTRIBUTION`, shows an interactive rectangle area model, and tests him on a fresh algebra problem.
- **UC-2 (Cross-Domain Transfer Check):** After Aarav passes the algebra retry, Re:Learn presents a geometry problem (calculating the area of a rectangle with width 2 and length $x+3$). Aarav's response proves whether his understanding is deep or superficial.
- **UC-3 (Teacher Classroom Remediation):** Mrs. Sharma logs in before class, reviews the class heatmap, identifies that 14 students share the `NEGATIVE_DISTRIBUTION` misconception, and groups them for a 10-minute peer remediation session.

---

## 5. Functional Requirements

### 5.1 Core Requirements (C1 – C7)

| Requirement ID | Name | Description | Acceptance Criteria |
|---|---|---|---|
| **FR-C1** | Step-Level Error Localisation | The system must ingest a sequential list of equation steps and evaluate solution-set equivalence between consecutive lines $k-1$ and $k$ using SymPy. | Identifies the exact 0-indexed step where mathematical equivalence breaks. If all steps are equivalent but the final value is wrong, tags as arithmetic slip. |
| **FR-C2** | Generate-and-Match Diagnosis | Apply 6 deterministic misconception transformation generators to step $k-1$. If a generated candidate is algebraically identical to the student's step $k$, assign that diagnosis. | Returns diagnosis with `source: "rule"`, `confidence: 0.95`, and exact evidence sentence describing the error. |
| **FR-C3** | Constrained LLM Fallback | If no deterministic rule matches the student's erroneous step, invoke a constrained LLM fallback prompt. | The LLM may **only** select from the 6 predefined labels or return `"unknown"`. Never hallucinate labels. Confidence is capped at $\le 0.70$ and labelled `"AI estimate"`. |
| **FR-C4** | Visual Proofs | Provide 6 pre-built, deterministic interactive visual animations linked to the 6 misconceptions. | When an error is diagnosed, display the corresponding animation with an LLM-generated explanation using the student's actual numbers. |
| **FR-C5** | Same-Domain Retry | Upon completion of visual remediation, provide a new algebra problem targeting the same misconception. | Correct answer updates student stage to `resolved in algebra`. Incorrect answer triggers an alternate explanation (maximum 2 loops before teacher escalation). |
| **FR-C6** | Cross-Domain Transfer Test ★ | Present a hand-verified transfer question from Physics, Geometry, or Programming testing the same root concept. | Correct answer updates stage to `Transfer verified ✓`. Incorrect answer updates stage to `Persists in a new context ✗`, displays a bridge lesson, and flags the teacher. |
| **FR-C7** | Live Misconception Graph | Display an interactive graph of the 6 misconceptions linked to 4 root concepts using React Flow. | Graph nodes reflect real-time student state: Inactive (grey), Detected (orange glow + root glow), Resolved in algebra (blue), Transfer verified (green), Persists in new context (red ring). |

### 5.2 Wow Layer Requirements (W1 – W7)

| Requirement ID | Name | Description | Acceptance Criteria |
|---|---|---|---|
| **FR-W1** | Photo of Handwritten Work | Allow students to upload a photo of handwritten notebook steps. | Vision LLM extracts sequential equation lines into a clean JSON array feeding the standard `/attempt` pipeline. |
| **FR-W2** | "Explain Your Thinking" Box | Provide an optional free-text sentence input alongside step submission. | Sent to the backend and included as qualitative context for the fallback LLM. |
| **FR-W3** | Confidence Telemetry | Capture passive client telemetry: time per step (ms), backspace/deletion count, and line edit count. | Classifies student confidence into `low`, `medium`, or `high` using deterministic heuristics. No camera or mic. |
| **FR-W4** | Multimodal Fusion Card | Present a consolidated diagnostic card summarizing all attempt modalities. | Simultaneously displays typed steps, photo thumbnail, student explanation, and confidence signal on the diagnosis screen. |
| **FR-W5** | Multi-Language Toggle | Provide language toggles for English, Hindi, and Bengali on the intervention screen. | Re-generates or fetches the pedagogical explanation in the selected language. |
| **FR-W6** | Knowledge Evolution Timeline | Display a per-student historical trajectory of misconception states over time. | Visualizes chronological progression: detected $\to$ resolved $\to$ transfer status using Recharts. |
| **FR-W7** | Teacher Dashboard & Peer Groups | Provide a classroom dashboard aggregating data from 40 seeded students (explicitly labelled "simulated"). | Displays class misconception heatmap, groups students sharing the same misconception, and lists transfer-failure alerts. |

---

## 6. The 6 Misconceptions & Transfer Domain Map

| Misconception ID | Wrong Step Pattern | Root Concept | Visual Proof Model | Cross-Domain Transfer Question | Verified Answer |
|---|---|---|---|---|---|
| `PARTIAL_DISTRIBUTION` | $2(x+3) \to 2x+3$ | `DISTRIBUTIVE_LAW` | Rectangle area model ($2 \cdot x$ and $2 \cdot 3$) | **Geometry:** A rectangle is $2\text{ m}$ wide and $(x+3)\text{ m}$ long. Write its area. | $2(x+3) = 2x + 6\text{ m}^2$ |
| `SQUARE_OF_SUM` | $(a+b)^2 \to a^2+b^2$ | `DISTRIBUTIVE_LAW` | Square split into $a^2, b^2$ and two $ab$ strips | **Geometry:** A square garden's side grows from $s$ to $s+2$. How much area is added? | $(s+2)^2 - s^2 = 4s + 4$ (not $4$) |
| `NEGATIVE_DISTRIBUTION` | $-(x+5) \to -x+5$ | `DISTRIBUTIVE_LAW`, `INTEGER_RULES` | Number-line reflection of whole bracket | **Physics:** You walk $3\text{ m}$ then $2\text{ m}$ forward; the whole trip is reversed. Displacement? | $-(3+2) = -5\text{ m}$ (not $-3+2 = -1$) |
| `TRANSPOSITION` | $x+5=10 \to x=10+5$ | `EQUALITY_BALANCE` | Balance scale: remove $5$ from both pans | **Code:** `total = price + tax`. Write the line that computes price. | `price = total - tax` |
| `UNLIKE_TERMS` | $3x+5 \to 8x$ | `LIKE_TERMS` | Grouping tiles: $x$-tiles vs unit tiles | **Physics:** Can you add $3\text{ m} + 5\text{ s}$? What does $3x + 5$ mean with units? | `No — different units; 3x + 5 stays as it is` |
| `NEG_TIMES_NEG` | $(-3)(-4) \to -12$ | `INTEGER_RULES` | Sign pattern on number line: $-3\times2, -3\times1, -3\times0, -3\times(-1)...$ | **Physics:** Temperature falls $3^\circ\text{C/h}$. Using $t = -4\text{ h}$, how did it compare $4\text{ h}$ ago? | $(-3)(-4) = +12 \to 12^\circ\text{C}$ warmer |

---

## 7. User Flows

### 7.1 Student User Flow (10 Steps)
```text
[Step 1: Pick Question]
        │
        ▼
[Step 2: Enter Working] ◄── [W1: Photo OCR] ── [W2: Explain Box] ── [W3: Telemetry]
        │
        ▼
[Step 3: Parse & Normalise] (SymPy checks syntax; prompts user if line is unparseable)
        │
        ▼
[Step 4: Localise Error] (SymPy compares step k with k-1 to find first mismatch)
        │
        ▼
[Step 5: Diagnose] (6 Generator rules match; fallback to Constrained LLM if needed)
        │
        ▼
[Step 6: Diagnosis Card & Graph] (Highlights error, displays evidence, glows graph node)
        │
        ▼
[Step 7: Intervention] (Shows visual proof animation + LLM explanation; W5 language toggle)
        │
        ▼
[Step 8: Same-Domain Retry]
   ├── Fail ──► Alternate explanation (Max 2 loops, then flag)
   └── Pass ──► Advances to "Resolved in algebra"
        │
        ▼
[Step 9: Cross-Domain Transfer Test ★]
   ├── Pass ──► "Transfer verified ✓"
   └── Fail ──► "Persists in a new context ✗" + Bridge explanation + Teacher alert
        │
        ▼
[Step 10: Update Learner Profile] (Stores attempt & stage in SQLite; updates W6 & W7)
```

### 7.2 Teacher User Flow (4 Steps)
```text
[T1: Class Heatmap] ────► Review overall misconception distribution across 40 seeded students
        │
        ▼
[T2: Student Drill-Down] ─► View individual student's timeline, attempts, and step evidence
        │
        ▼
[T3: Peer Groups] ───────► Inspect auto-generated clusters of students sharing identical misconceptions
        │
        ▼
[T4: Transfer Alerts] ───► Review students who passed algebra retry but failed cross-domain transfer
```
*(Teacher views are strictly read-only from the SQLite learner profile database).*

---

## 8. Non-Functional & System Requirements

1. **Performance & Latency:**
   - SymPy step checking and rule diagnosis must return in $< 200\text{ ms}$.
   - Pre-computed and cached LLM responses for the live demo run must execute instantaneously ($< 50\text{ ms}$).
   - Uncached LLM responses should complete within $2.5\text{ s}$.
2. **Reliability & Resilience:**
   - If an input equation cannot be parsed, the system must not crash; it highlights the problematic line and prompts the student to correct formatting.
   - Offline demo cache (`demo_cache.json`) guarantees flawless execution during presentation even without an active internet connection.
3. **Security, Privacy & Ethics:**
   - **Target Audience Safeguards:** Zero webcam, video, or microphone capture. Strictly compliant with student privacy best practices.
   - **Data Minimization:** No personal student identifiable information (PII) required. Students identified by anonymous IDs (`s_01`, `s_02`).
   - **Ethical AI Transparency:** All synthetic classroom data is explicitly labelled `"simulated"`. LLM diagnoses are capped at confidence $0.70$ and marked `"AI estimate"`.

---

## 9. Evaluation & Success Criteria

1. **Real-World Benchmark Evaluation:**
   - Accuracy must be computed strictly on a curated benchmark of **50–100 authentic student solutions** collected from friends, juniors, or siblings.
   - Metrics to report:
     - Error-step localisation accuracy (%).
     - Diagnosis accuracy: Rule-only (%) and Rule + LLM fallback (%).
     - Percentage of ambiguous attempts returned as `"unknown"`.
     - Performance on unseen algebraic questions.
2. **Hackathon Milestones:**
   - **Hour 6–7:** Integration #1 (`PARTIAL_DISTRIBUTION` working end-to-end).
   - **Hour 13 Checkpoint:** Complete core loop functional across all 6 misconceptions.
   - **Hour 18 Freeze:** Hard feature freeze; zero new code.
   - **Hour 20–23:** Minimum 10 full end-to-end demo dry runs completed without failure, backup video recorded.

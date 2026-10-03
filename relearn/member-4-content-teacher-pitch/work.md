# Member 4: Content, Prompts, Teacher Experience & Pitch Lead — Work Specification

> **Module Owner:** Member 4 (P4)  
> **Core Focus:** Question Bank & Hand-Verified Answer Keys, Pedagogical Prompt Engineering, Teacher Dashboard & Peer Grouping, Real Evaluation Dataset, Pitch Deck & Live Demo Script  
> **Key Mantra:** *"Every question and answer must be hand-verified by a human. A scientifically incorrect physics question in front of judges is a fatal pitch bug."*

---

## 1. Responsibility Summary

Member 4 is the product lead, curriculum architect, prompt engineer, teacher experience lead, and pitch master for Re:Learn. You are responsible for:
1. Hand-authoring and mathematically verifying the full **Question Bank** (`questions.json`) across all 6 misconceptions: diagnostic questions, same-domain retry questions, and cross-domain transfer challenges (Physics, Geometry, Code).
2. Designing, validating, and testing the system prompt templates for **Constrained LLM Fallback** (Feature C3) and **Pedagogical Intervention Explanations** (Feature C4) in English, Hindi, and Bengali.
3. Implementing the backend `/intervention` route and logic.
4. Building the **Teacher Dashboard** (Feature W7), featuring:
   - T1: Class Heatmap (misconception frequency across 40 seeded students).
   - T2: Student Drill-Down (individual history and step evidence).
   - T3: Peer Grouping (clustering students who share identical misconceptions).
   - T4: Cross-Domain Transfer Alerts (*"Fixed in algebra, failed in physics"*).
5. Synthesizing 40 realistic, simulated student profiles (`seeds_40_students.json`), explicitly labelled `"simulated"`.
6. Collecting and curating a benchmark dataset of **50–100 authentic, human-written student solutions** from friends, siblings, and juniors for the final evaluation.
7. Crafting the final pitch slide deck, rehearsing the strict 2-minute live demo script, and drilling judge Q&A defenses.

---

## 2. Features & Components Owned

| Feature ID | Feature Name | Description | Status / Layer |
|---|---|---|---|
| **Content Core** | Question Bank & Verified Keys | 4 diagnostic, retry, and transfer questions per misconception (hand-verified). | Core (Hour 1–6) |
| **C3 / C4 Prompts**| Fallback & Intervention Prompts | Guardrailed JSON fallback prompt; 3–4 sentence pedagogical explanation template. | Core (Hour 1–6) |
| **API Route** | `/intervention` Endpoint | Backend route taking label + evidence + language and returning animation + text. | Core (Hour 7–13) |
| **W7** | Teacher Dashboard & Peer Groups | Class heatmap, student drill-down, peer groups, and transfer alerts. | Wow (Hour 13–18) |
| **Data Engine** | 40 Seeded Students Dataset | Realistic distribution of student profiles marked "simulated" feeding SQLite. | Wow (Hour 7–13) |
| **Evaluation** | Real Student Benchmark Dataset | 50–100 real student solutions gathered for un-biased evaluation. | Eval (Hour 7–18) |
| **Pitch & Demo** | Pitch Deck & 2-Minute Demo Script | Slide deck, stopwatch rehearsal, backup video recording, judge Q&A drill. | Pitch (Hour 13–24) |

---

## 3. Ordered Task Breakdown & Timeline

### Hours 0 – 1: Foundation & Contracts
- Confirm the Shared JSON Contract and the 6 Misconceptions in `relearn/memory.md`.
- Coordinate folder structures and mock data schemas.

### Hours 1 – 6: Parallel Core Build (Curriculum & Prompts)
- **Task 1.1: Question Bank Authoring (`questions.json`):**
  - Create ~4 diagnostic questions per misconception (total ~24 questions).
  - Create retry variants with identical mathematical structures but different numbers.
  - Hand-author the cross-domain transfer questions and answers:
    - `PARTIAL_DISTRIBUTION` (Geometry): Rectangle $2\text{ m}$ wide, $(x+3)\text{ m}$ long $\to$ Area: $2(x+3) = 2x+6\text{ m}^2$.
    - `SQUARE_OF_SUM` (Geometry): Square garden side $s \to s+2$ $\to$ Added area: $(s+2)^2 - s^2 = 4s+4$ (not $4$).
    - `NEGATIVE_DISTRIBUTION` (Physics): Walk $3\text{ m}$ then $2\text{ m}$ forward; whole trip reversed $\to$ Displacement: $-(3+2) = -5\text{ m}$ (not $-1\text{ m}$).
    - `TRANSPOSITION` (Code): `total = price + tax` $\to$ Code: `price = total - tax`.
    - `UNLIKE_TERMS` (Physics): Add $3\text{ m} + 5\text{ s}$ $\to$ Answer: *No — different units; $3x+5$ stays as it is*.
    - `NEG_TIMES_NEG` (Physics): Temp drops $3^\circ\text{C/h}$, $t = -4\text{ h}$ $\to$ Answer: $(-3)(-4) = +12 \to 12^\circ\text{C}$ warmer.
  - Hand-verify every single calculation twice.
- **Task 1.2: Prompt Engineering:**
  - **Constrained Fallback Prompt (C3):**
    - System message: *"You are an algebra error classifier. You must return JSON only: {label, evidence, confidence}. label must be strictly one of: PARTIAL_DISTRIBUTION, SQUARE_OF_SUM, NEGATIVE_DISTRIBUTION, TRANSPOSITION, UNLIKE_TERMS, NEG_TIMES_NEG, or unknown. Reject any other label."*
  - **Pedagogical Intervention Prompt (C4):**
    - System message: *"Explain the conceptual flaw in 3-4 simple sentences using the student's actual numbers. Do NOT re-diagnose. Reference the visual proof."*
    - Add localized system templates for Hindi and Bengali.

### Hours 6 – 7: Integration #1 — PARTIAL_DISTRIBUTION End-to-End
- Provide final prompt and question fixtures for `PARTIAL_DISTRIBUTION`.
- Verify live intervention text matches the area-model animation.

### Hours 7 – 13: Core Completion & Seed Data
- **Task 3.1: Build `/intervention` Backend Route:**
  - Create FastAPI endpoint receiving `label`, `evidence`, `language`, `student_numbers`.
  - Maps label to `animation_id`, calls LLM with prompt, and returns JSON response.
- **Task 3.2: 40 Seeded Student Profiles (`seeds_40_students.json`):**
  - Generate 40 simulated students with realistic, non-uniform distributions:
    - 14 students with `PARTIAL_DISTRIBUTION`
    - 10 students with `NEGATIVE_DISTRIBUTION`
    - 8 students who passed algebra retry but failed physics transfer (for Transfer Alerts)
  - Mark every student profile with `is_simulated: true`.
  - Write ingestion script to populate SQLite `students` and `attempts` tables.
- **Task 3.3: Benchmark Data Collection:**
  - Reach out to friends, juniors, or siblings to collect 50–100 authentic handwritten or typed wrong algebra derivations. Transcribe into `eval_real_solutions.json`.

### Hours 13 – 18: Sleep Rotation, Teacher Dashboard & Pitch Draft
- **13:00 – 15:30:** Scheduled rest / sleep (~2.5 hours) alongside Member 3.
- **15:30 – 18:00 (Active Build Window):**
  - **Task 4.1: Teacher Dashboard (Feature W7):**
    - **T1 Class Heatmap:** Grid displaying misconception counts across the 40 seeded students.
    - **T2 Student Drill-Down:** Detailed view showing student attempts, error step index, and evidence.
    - **T3 Peer Groups:** Auto-clusters students sharing the same root concept for teacher intervention.
    - **T4 Transfer Alerts:** Dedicated panel listing students flagged with `"Fixed in algebra, failed in physics"`.
  - **Task 4.2: Draft Pitch Deck & Demo Script:**
    - Prepare 7-slide deck: Problem $\to$ The Misconception Trap $\to$ Re:Learn Solution $\to$ Live Demo $\to$ Real Evaluation Metrics $\to$ Teacher Value $\to$ Roadmap.

### Hours 18 – 20: Feature Freeze & Benchmark Evaluation
- Finalize `eval_real_solutions.json` with 50–100 real entries.
- Assist Member 1 in running `evaluate.py`.
- Record true headline accuracy numbers on Slide 5.

### Hours 20 – 24: Demo Hardening & Pitch Rehearsal
- Pre-cache demo questions in `demo_cache.json`.
- Lead **10+ full demo run-throughs** strictly keeping to the 2-minute demo script.
- Drill the team on Judge Q&A prep questions.

---

## 4. Dependencies & Interface Contracts

### Inputs Needed from Teammates
| Teammate | What You Need | By When | What to Mock Until Received |
|---|---|---|---|
| **Member 1** | Route registration for `/intervention` and SQLite connection | Hour 7 | Test prompts using direct Python script calling LLM. |
| **Member 1** | Evaluation script (`evaluate.py`) runner | Hour 18 | Manually compute metrics on a spreadsheet if needed. |
| **Member 2** | UI trigger for language toggle and transfer flow | Hour 12 | Test with Postman / curl. |
| **Member 3** | Animation IDs matching the 6 misconceptions | Hour 5 | Use standard IDs (`area_model`, `square_model`, etc.). |

### Outputs You Deliver to Teammates
| Teammate | Deliverable | By When |
|---|---|---|
| **Member 1** | Final `questions.json` for the `/questions` route | Hour 2 |
| **Member 1** | Constrained fallback prompt text & rules | Hour 6 |
| **Member 1** | 50–100 real student evaluation set (`eval_real_solutions.json`) | Hour 18 |
| **Member 2** | Verified transfer questions and answers | Hour 3 |
| **Member 3** | Exact numeric coefficients for animations | Hour 4 |
| **All** | Pitch slide deck and synchronized 2-minute demo script | Hour 20 |

---

## 5. Hand-Verified Content Reference

```json
[
  {
    "id": "PD_01",
    "misconception_id": "PARTIAL_DISTRIBUTION",
    "root_concept": "DISTRIBUTIVE_LAW",
    "diagnostic_question": "Solve for x: 2(x + 3) = 14",
    "expected_error_step": "2x + 3 = 14",
    "correct_solution": ["2x + 6 = 14", "2x = 8", "x = 4"],
    "retry_question": "Solve for x: 5(x - 2) = 20",
    "retry_answer": "x = 6",
    "transfer_domain": "GEOMETRY",
    "transfer_question": "A rectangle is 2 m wide and (x + 3) m long. Write an expression for its total area in square meters.",
    "transfer_answer": "2(x + 3) = 2x + 6 m²",
    "bridge_explanation": "Just as the 2 multiplies both the width and length components in the rectangle, the factor outside the bracket must multiply every term inside."
  }
]
```

---

## 6. Definition of Done

### Core Definition of Done (Hour 13 Checkpoint — Non-Negotiable)
- [ ] All 6 misconceptions have complete, hand-verified diagnostic, retry, and transfer questions in `questions.json`.
- [ ] Fallback prompt enforces strict JSON output and rejects hallucinated labels.
- [ ] Intervention prompt delivers clean, 3–4 sentence explanations referencing the visual proof.
- [ ] `/intervention` endpoint responds with valid `animation_id` and explanation text.

### Wow & Pitch Definition of Done (Hour 18–24)
- [ ] W7 Teacher Dashboard renders Class Heatmap, Student Drill-down, Peer Groups, and Transfer Alerts from 40 seeded students.
- [ ] 50–100 real student solutions curated in `eval_real_solutions.json` and evaluated via `evaluate.py`.
- [ ] Pitch slide deck complete with architecture diagrams, demo callouts, real evaluation numbers, and roadmap.
- [ ] Team has completed 10+ consecutive flawless demo run-throughs and recorded a backup demo video.

---

## 7. Implementation Pitfalls & Pitch Defense Guidelines

1. **Never Falsify Accuracy:** If the evaluation on 60 real student solutions yields $82\%$ accuracy, report $82\%$ proudly. Judges respect honest numbers on real student work far more than a dubious $99\%$ on circular synthetic data.
2. **Transfer Question Realism:** The physics and programming transfer questions must be scientifically flawless. For example, in `UNLIKE_TERMS`, adding $3\text{ m} + 5\text{ s}$ is dimensional nonsense — this exact point proves why unlike algebraic terms cannot be merged.
3. **Simulated Data Disclaimer:** Always ensure the Teacher Dashboard has a visible pill badge: `Class 8-B (40 Students — Simulated Data)`. Transparency prevents judges from questioning student privacy violations.

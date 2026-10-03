# Member 4 Work Distribution — Content, Prompts, Teacher Side & Pitch

> **Role:** Mathematical Content Authoring, AI Prompt Engineering, Teacher Analytics & Pitch Presentation  
> **Primary Technology Stack:** Python (FastAPI routes), React, Recharts, Tailwind CSS, JSON, LLM Prompt Engineering  
> **Key Rule:** Complete **Stage 1 (Core)** and pass the **Core Gate** before touching any Stage 2 Wow tasks.

---

## 1. Responsibility Summary

Member 4 owns the pedagogical substance, instructional prompts, teacher analytical views, and competition presentation for Re:Learn:
- Hand-authoring and mathematically verifying every diagnostic question, retry problem, and cross-domain transfer item.
- Authoring the canonical question bank JSON (`questions.json`).
- Engineering and locking system prompts for Constrained LLM Fallback (C3) and Pedagogical Interventions (C4).
- Implementing the FastAPI `/intervention` route.
- Curating a real-world evaluation dataset of 50–100 authentic student algebra error traces.
- Building the Teacher Dashboard & Peer Grouping views (W7) with 40 seeded simulated student profiles.
- Crafting the pitch deck, script, and leading live demo choreography and Q&A defense.

---

## 2. Features Owned

### Core Features (Stage 1)
- **Mathematical Curriculum Authoring:**
  - 24 Diagnostic questions (~4 per misconception)
  - 12 Same-domain retry variants (2 per misconception)
  - 6 Cross-domain transfer scenarios (Physics, Geometry, Code) with canonical answers
- **Question Bank Asset:** `questions.json` formatted for the `/questions` route
- **Prompt Engineering:**
  - Constrained LLM Fallback prompt (strictly 6 labels + "unknown", JSON format)
  - Visual proof explanation prompt (3–4 sentences using student's numbers)
- **Backend Route:** `POST /intervention` in FastAPI
- **Evaluation Dataset:** Collecting 50–100 authentic student wrong solutions (`evaluation_set.json`)

### Wow Layer Features (Stage 2)
- **W7 (Priority 2):** Teacher Dashboard & Peer Groups (T1 Heatmap, T2 Drill-down, T3 Peer Groups, T4 Transfer Alerts)
- **Seeded Cohort Data:** 40 simulated student profiles (clearly labelled "Simulated Research Data")
- **Teacher Endpoint:** `GET /class/summary` aggregation logic
- **Multilingual Prompts (W5):** Hindi and Bengali pedagogical prompts
- **Competition Pitch & Demo:** Slide deck, 2-minute demo script, and Q&A drill coordination

---

## 3. Stage 1 — Core Execution Plan (Hours 0–13)

> **Early Completion Protocol:** If you finish all curriculum authoring and prompts early, **do not build the Teacher Dashboard**. Assist Member 1 with rigorous edge-case verification of SymPy parsing, expand the real evaluation dataset, or help Member 2 test question rendering in the UI.

### Ordered Task List

#### Hours 0–1: Content Taxonomy & Initial Mock Question
1. Lock the 6 misconception definitions and exact formulas.
2. Produce `data/mock_questions.json` containing 1 complete question chain for `PARTIAL_DISTRIBUTION` (Diagnostic, Retry, Transfer) so Member 1 and Member 2 can wire initial endpoints.
3. Review and freeze the shared JSON contract.

#### Hours 1–6: Complete Question Bank Authoring & Verification
1. **Author All 24 Diagnostic Questions:**
   - 4 distinct algebraic equations for each of the 6 misconceptions.
   - Hand-solve every step and verify that Member 1's generators match the intended misconception.
2. **Author All 12 Same-Domain Retry Questions:**
   - 2 parallel difficulty-matched variants per misconception for immediate re-testing.
3. **Author All 6 Cross-Domain Transfer Questions (Hero Content):**
   - **PARTIAL_DISTRIBUTION:** *Geometry* — Rectangle of width 2 m and length $(x+3)$ m. Calculate area. (Answer: $2x + 6\text{ m}^2$)
   - **SQUARE_OF_SUM:** *Geometry* — Square garden of side $s$ extended by 2 m in both directions. Express added area. (Answer: $4s + 4$)
   - **NEGATIVE_DISTRIBUTION:** *Physics* — Object travels $+3\text{ m}$ then $+2\text{ m}$ forward; entire journey reversed. Net displacement? (Answer: $-5\text{ m}$)
   - **TRANSPOSITION:** *Programming* — Code has `total = price + tax`. Write assignment statement to compute `price`. (Answer: `price = total - tax`)
   - **UNLIKE_TERMS:** *Physics* — Can you evaluate $3\text{ m} + 5\text{ s}$? What does $3x + 5$ mean if $x$ is in meters? (Answer: `No; units mismatch. 3x + 5 remains unchanged.`)
   - **NEG_TIMES_NEG:** *Physics* — Temperature rate is $-3^\circ\text{C}/\text{hr}$. Compare temperature at $\Delta t = -4\text{ hr}$. (Answer: `+12 (12°C warmer)`)
4. **Compile `backend/data/questions.json`** and verify schema validity.

#### Hours 6–7: Integration Milestone #1
- Verify that `GET /questions` successfully delivers the question bank to the frontend.
- Verify `POST /intervention` successfully generates an explanation for `2(x+3)=14` using the student's numbers ($2 \times x$ and $2 \times 3$).

#### Hours 7–13: Prompts, Intervention API & Real Data Sourcing
1. **Intervention Route Implementation (`backend/routes/intervention.py`):**
   - Receives `{ label, evidence, student_numbers, language }`.
   - Maps label to animation ID (e.g. `PARTIAL_DISTRIBUTION` $\to$ `"area_model"`).
   - Queries LLM with pedagogical prompt: *"Write 3-4 clear, encouraging sentences explaining why [evidence] using the student's exact values. Do not re-diagnose."*
   - Return `{ "animation_id": "...", "explanation": "..." }`.
2. **Constrained Fallback Prompt Engineering:**
   - Write system prompt strictly forcing JSON output and bounding labels to the 6 valid IDs or `"unknown"`.
3. **Curate Real Evaluation Dataset (`backend/eval/evaluation_set.json`):**
   - Collect 50–100 authentic student error workings from public exam questions and classroom samples.
   - Annotate ground-truth `error_step_index` and `misconception_label` for each sample.

---

## 4. Core Gate Verification (Hour 13)

Before proceeding to Stage 2, verify your share of the Core Gate:
- [ ] Every single question, retry, and transfer item is mathematically accurate and verified by hand.
- [ ] `questions.json` contains complete rubrics and loads without parse errors in `/questions`.
- [ ] `/intervention` produces 3–4 sentence explanations correctly referencing student numbers.
- [ ] Constrained fallback prompt never hallucinates non-existent misconception labels.
- [ ] Verified across 3 consecutive end-to-end runs.
- [ ] Code committed and tagged `core-v1`.

---

## 5. Stage 2 — Wow Layer Execution Plan (Hours 13–18)

> **MANDATORY NOTICE:** Do not start until the Core Gate is passed and tagged `core-v1`.  
> Build W7 on a dedicated branch (`feat/w7-teacher-dashboard`) behind `features.json`.

### Ordered Task List

1. **W7 — Teacher Dashboard & Seeded Cohort (Priority 2 | Hours 13–16):**
   - **Generate 40 Seeded Student Profiles (`backend/data/seeded_students.json`):**
     - Realistic classroom breakdown: ~26 mastered/clear, ~8 active algebra misconceptions, ~6 transfer-failed persistent misconceptions.
     - Add prominent UI banner: **"Simulated Research Data (Class 8-B, 40 Students)"**.
   - **Implement Aggregation Route (`GET /class/summary`):**
     - Calculate class-wide misconception frequency matrix.
     - Group students sharing identical misconceptions for peer remedial groups (T3).
     - Flag transfer-failed students for high-priority teacher alert (T4).
   - **Build Teacher Dashboard UI (`frontend/src/views/TeacherDashboard.jsx`):**
     - Render T1 Class Heatmap (visual grid showing misconception prevalence).
     - Render T3 Peer Grouping cards (e.g., *"Group A: 4 students struggling with Distributive Law"*).
     - Render T4 Transfer Alerts (students passing algebra drills but failing physics/code transfer).
2. **W5 Prompt Localization (Hours 16–17):**
   - Add multilingual translation templates in Hindi and Bengali for `/intervention`.
3. **Pitch Deck & Demo Choreography (Hours 17–18):**
   - Finalize 2-minute pitch deck slides (Hook $\to$ Problem $\to$ Solution $\to$ Live Demo $\to$ Transfer Hero Moment $\to$ Teacher Dashboard $\to$ Evaluation Accuracy $\to$ Roadmap).
   - Script the exact 2-minute live demo run-through.

---

## 6. Contracts & Interfaces to Follow

### 6.1 Question Bank Entry Schema (`questions.json`)
```json
{
  "question_id": "PD_02",
  "misconception_id": "PARTIAL_DISTRIBUTION",
  "prompt": "Solve 2(x+3)=14",
  "root_concept": "DISTRIBUTIVE_LAW",
  "retry_question": {
    "question_id": "PD_02_R1",
    "prompt": "Solve 5(x-2)=20",
    "canonical_answer": "x=6"
  },
  "transfer_question": {
    "question_id": "PD_02_T1",
    "domain": "geometry",
    "scenario": "A rectangular garden has a width of 2 meters and a length of (x + 3) meters. Express its total area in square meters.",
    "canonical_answer": "2x + 6",
    "rubric": "Must expand both terms with correct units"
  }
}
```

### 6.2 Teacher Summary Endpoint (`GET /class/summary`)
```json
{
  "class_name": "Class 8-B (Simulated Cohort)",
  "total_students": 40,
  "misconception_heatmap": [
    {"label": "PARTIAL_DISTRIBUTION", "count": 6, "percentage": 15.0},
    {"label": "SQUARE_OF_SUM", "count": 8, "percentage": 20.0},
    {"label": "NEGATIVE_DISTRIBUTION", "count": 4, "percentage": 10.0},
    {"label": "TRANSPOSITION", "count": 5, "percentage": 12.5},
    {"label": "UNLIKE_TERMS", "count": 3, "percentage": 7.5},
    {"label": "NEG_TIMES_NEG", "count": 2, "percentage": 5.0}
  ],
  "peer_groups": [
    {
      "misconception": "PARTIAL_DISTRIBUTION",
      "students": ["s_04", "s_07", "s_12", "s_29"],
      "recommended_action": "Peer review: Rectangle Area Model workshop"
    }
  ],
  "transfer_failure_alerts": [
    {
      "student_id": "s_07",
      "misconception": "PARTIAL_DISTRIBUTION",
      "transfer_domain": "geometry",
      "status": "persists_in_new_context"
    }
  ]
}
```

---

## 7. Inputs, Dependencies & Deliverables

| Dependency From | Deliverable Needed | Needed By | What to Use Until Available |
|---|---|---|---|
| **Member 1** | Endpoint scaffolding for `/intervention` | Hour 3 | Local Python mock script |
| **Member 3** | Animation IDs for the 6 visual proofs | Hour 3 | Use IDs: `area_model`, `split_square`, etc. |
| **Member 2** | Teacher dashboard navigation mount | Hour 14 | Direct URL route `/teacher` |

### Member 4 Deliverables
1. Hand-verified `questions.json` containing 42 total items (diagnostic, retry, transfer).
2. Production system prompts for Constrained Fallback and Intervention explanation.
3. Functional FastAPI `/intervention` route handler.
4. Curated 50–100 item authentic student solution dataset (`evaluation_set.json`).
5. Stage 2 W7 Teacher Dashboard with 40 seeded students and `/class/summary` route.
6. 2-minute pitch deck slides and demo presentation script.

---

## 8. Definition of Done

### Stage 1 (Core Gate Contribution)
- Complete question bank is hand-verified and committed in `questions.json`.
- `/intervention` reliably generates 3–4 sentence explanations without hallucinating diagnoses.
- Real evaluation dataset contains 50–100 authentic student solutions with ground truth.
- Core Gate passes with 100% test completion.

### Stage 2 (Wow Layer Contribution)
- Teacher dashboard renders class heatmap, peer groups, and transfer alerts cleanly.
- 40 Seeded student profiles load from SQLite with explicit "Simulated" tags.
- Pitch slides and demo script polished and rehearsed.
- Toggled cleanly via `features.json` with zero regressions on core.

---

## 9. Implementation Notes & Pitfalls

- **Human Hand-Verification is Mandatory:** A single mathematical mistake in a question rubric breaks the entire automated evaluation. Verify every step by hand.
- **Intervention LLM Role Boundary:** The intervention LLM must **never** diagnose or re-classify the error. It is purely an explanatory voice explaining why the specific step was wrong.
- **Labeling Simulated Data:** Judges are sensitive to fake student data. Ensure the Teacher Dashboard explicitly displays: *"Simulated Research Data (Class 8-B, 40 Students)"* to highlight intentional cohort simulation rather than deceptive claims.
- **Hero Moment in Pitch:** The demo script must linger on the Cross-Domain Transfer failure: *"The student aced the algebra retry, but failed when the exact same concept appeared in geometry. That is Re:Learn's breakthrough."*

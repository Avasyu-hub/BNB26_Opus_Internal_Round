# Re:Learn — 24-Hour Phased Execution Plan & Timeline

> This document defines the operational phases, task assignments, hour-by-hour milestones, and dependency gates for the 24-hour hackathon. Every team member operates against these synchronized checkpoints.

---

## 1. Timeline Overview (0 — 24 Hours)

```text
Hour  0 ─── 1: Phase 0: Foundation, Contract Locking & Environment Setup
Hour  1 ─── 6: Phase 1: Parallel Core Build on Mocks
Hour  6 ─── 7: Phase 2: Integration #1 — PARTIAL_DISTRIBUTION End-to-End
Hour  7 ── 13: Phase 3: Core Completion across All 6 Misconceptions
               [★ HOUR 13 CHECKPOINT: Core Loop Demo-Ready ★]
Hour 13 ── 18: Phase 4: Wow Layer Implementation & Sleep Rotation
               [★ HOUR 18 HARD FEATURE FREEZE: Zero New Features ★]
Hour 18 ── 20: Phase 5: Real Benchmark Evaluation, Bug Squashing & Polish
Hour 20 ── 23: Phase 6: Demo Hardening (10+ Runs) & Screen Recording
Hour 23 ── 24: Phase 7: Pitch Rehearsal & Judge Q&A Drill
```

---

## 2. Phase-by-Phase Execution Details

### Phase 0: Foundation, Contract Locking & Setup (Hours 0 – 1)
- **Objective:** Establish common foundation, lock all contracts, initialize repositories and project structure, and create shared mock data fixtures.
- **Tasks:**
  - Verify all 6 misconceptions and 4 root concepts.
  - Review and lock the Shared JSON Contract in `relearn/memory.md`.
  - Scaffold repository folders: frontend (Vite/React/Tailwind) and backend (FastAPI/SymPy).
  - Generate initial mock JSON payload (`attempt_mock.json`, `questions_mock.json`).
- **Responsible Members:** All (Member 1, Member 2, Member 3, Member 4).
- **Dependencies:** None.
- **Expected Output:** Working git repo, runnable blank FastAPI and Vite apps, locked JSON fixtures.
- **Completion Criteria:** All members can run frontend and backend locally and confirm JSON contract consensus.

---

### Phase 1: Parallel Core Build on Mocks (Hours 1 – 6)
- **Objective:** Build primary functional components in total isolation using mock JSON fixtures without blocking on teammates.
- **Tasks:**
  - **Member 1 (Engine):** Implement SymPy parsing pipeline (`parse_expr` with implicit multiplication, unicode sanitization), solution-set equivalence checker (`first_error`), and first 3 generator rules (`PARTIAL_DISTRIBUTION`, `SQUARE_OF_SUM`, `NEGATIVE_DISTRIBUTION`).
  - **Member 2 (Student UI):** Scaffold Step Input Screen (line-by-line inputs, "Add Step" button, timer per row), Error-step highlight view, and Diagnosis screen shell, all driven by mock JSON.
  - **Member 3 (Visuals):** Build the 2 hero visual proof animations (`area_model` for partial distribution and `square_model` for square of sum) in SVG/Framer Motion; assemble React Flow misconception graph skeleton with nodes and edges.
  - **Member 4 (Content & Prompts):** Hand-author question bank (`questions.json`: diagnostic, retry, transfer items for all 6 misconceptions); draft prompts for constrained fallback (C3) and intervention explanation (C4).
- **Dependencies:** Phase 0 completion.
- **Expected Output:** Working parser + first 3 generators; working student UI screens with mock data; 2 interactive SVG animations; complete hand-verified question bank JSON.
- **Completion Criteria:** Unit tests pass for first 3 generators; UI renders mock attempt seamlessly; animations play cleanly.

---

### Phase 2: Integration #1 — PARTIAL_DISTRIBUTION End-to-End (Hours 6 – 7)
- **Objective:** First cross-functional integration test connecting frontend to backend for a single end-to-end misconception flow.
- **Tasks:**
  - Connect Member 2's Step Input Screen to Member 1's FastAPI `/attempt` endpoint.
  - Student submits: `2(x+3)=14` $\to$ `2x+3=14` $\to$ `2x=11` $\to$ `x=5.5`.
  - Backend flags `error_step_index: 0` and diagnoses `PARTIAL_DISTRIBUTION` via rule matcher.
  - Diagnosis screen mounts Member 3's `area_model` visual proof and renders Member 4's intervention prompt output.
  - Test retry submission and graph node highlight (`orange glow`).
- **Responsible Members:** All team members.
- **Dependencies:** Phase 1 deliverables for `PARTIAL_DISTRIBUTION`.
- **Expected Output:** Single complete, unbroken user flow from step input to diagnosis, animation, retry, and graph update.
- **Completion Criteria:** Live submission of `2(x+3)=14` runs end-to-end on localhost without manual intervention.

---

### Phase 3: Core Completion across All 6 Misconceptions (Hours 7 – 13)
- **Objective:** Scale the pipeline to all 6 misconceptions and achieve a fully functional, demo-ready core product.
- **Tasks:**
  - **Member 1 (Engine):** Implement remaining 3 generators (`TRANSPOSITION`, `UNLIKE_TERMS`, `NEG_TIMES_NEG`), matcher logic, constrained LLM fallback prompt (C3), `/retry` and `/transfer` verification endpoints, SQLite schema and profile writes.
  - **Member 2 (Student UI):** Implement same-domain retry flow (C5) with loop-backs (max 2 attempts), cross-domain transfer screen (C6), and state transition triggers.
  - **Member 3 (Visuals):** Implement remaining 4 animations (`number_line_reflect`, `balance_scale`, `tile_grouping`, `sign_pattern`); wire all 5 node states in React Flow (`Inactive`, `Detected`, `Resolved in algebra`, `Transfer verified`, `Persists in new context`).
  - **Member 4 (Teacher & Data):** Seed SQLite database with 40 realistic student profiles (labelled "simulated"); build Teacher Dashboard v1 skeleton; begin collecting real student solutions for benchmark.
- **Dependencies:** Successful Phase 2 integration.
- **Expected Output:** All 6 misconceptions supported across diagnosis, animations, retry, transfer, and graph state updates.
- **Completion Criteria (HOUR 13 CHECKPOINT):** The entire core loop (C1 through C7) works without crashing for any of the 6 misconceptions.

---

### Phase 4: Wow Layer Implementation & Sleep Rotation (Hours 13 – 18)
- **Objective:** Layer on high-impact secondary features to elevate the demo, with structured rest periods.
- **Build Priority:** `W1 (Photo) → W7 (Teacher Dashboard) → W3 (Telemetry) → W5 (Language Toggle) → W6 (Timeline) → W2 (Explain Box) → W4 (Fusion Card)`.
- **Sleep Rotation Schedule:**
  - **13:00 – 15:30:** Member 3 & Member 4 sleep (~2.5 hours). Member 1 & Member 2 build W1 (Photo upload & vision integration) and W3 (Telemetry capture).
  - **15:30 – 18:00:** Member 1 & Member 2 sleep (~2.5 hours). Member 3 & Member 4 build W7 (Teacher dashboard heatmap & peer groups), W5 (Hindi/Bengali toggle), and W6 (Evolution timeline).
- **Responsible Members:** Split per schedule.
- **Dependencies:** Passing Hour 13 Checkpoint.
- **Expected Output:** Functional photo-to-steps OCR, live telemetry tags, teacher heatmap with 40 students, multilingual explanations, and timeline.
- **Completion Criteria (HOUR 18 HARD FREEZE):** All planned wow features merged; feature development ceases immediately.

---

### Phase 5: Feature Freeze, Real Benchmark Evaluation & Bug Fixes (Hours 18 – 20)
- **Objective:** Lock code, evaluate diagnosis engine on authentic student data, squash lingering edge-case bugs, and finalize real performance metrics.
- **Tasks:**
  - **Feature Freeze Enforcement:** No new features permitted under any circumstances.
  - **Member 4 & Member 1:** Run `evaluate.py` against 50–100 real student solutions gathered from friends and siblings. Compute exact metrics:
    - Step-level localisation accuracy (%).
    - Rule-based diagnosis accuracy (%).
    - Combined Rule + LLM diagnosis accuracy (%).
    - Percentage returned as `"unknown"`.
    - Unseen question generalization score.
  - **Member 2 & Member 3:** Fix UI glitches, animation stutter, mobile/desktop responsiveness issues, and graph edge alignment.
- **Dependencies:** Hour 18 code freeze.
- **Expected Output:** Verified evaluation metrics recorded for pitch slides; rock-solid, bug-free codebase.
- **Completion Criteria:** All benchmark metrics documented; zero critical UI/backend errors in test suite.

---

### Phase 6: Demo Hardening & Rehearsal (Hours 20 – 23)
- **Objective:** Practice the exact 2-minute demo sequence until it is muscle memory and prepare fail-safes.
- **Tasks:**
  - Populate `demo_cache.json` with pre-computed LLM explanations to survive internet drops.
  - Execute **10+ full demo run-throughs** strictly adhering to the 2-minute script.
  - Record a flawless backup screen recording (MP4/WebM) during Hour 21 to guard against live hardware failures.
  - Finalize the pitch slide deck with the real evaluation metrics and architecture diagrams.
- **Responsible Members:** All team members.
- **Dependencies:** Phase 5 stabilization.
- **Expected Output:** 10 successful run-throughs completed; backup video stored locally; pitch deck completed.
- **Completion Criteria:** Two consecutive flawless rehearsals without a single glitch or pause.

---

### Phase 7: Pitch Rehearsal & Judge Q&A Drill (Hours 23 – 24)
- **Objective:** Master verbal delivery, timekeeping, and defensive technical responses for judge interactions.
- **Tasks:**
  - Practice 2-minute presentation with stopwatch (strict cut-off at 120 seconds).
  - Run intensive Q&A drill on key defense topics:
    - *"Why not just use GPT-4o to check homework?"* (Symbolic determinism, step-level explainability, capped AI estimates).
    - *"How does this differ from Khan Academy or Eedi?"* (Cross-domain transfer verification and shared root concept graphs).
    - *"Why didn't you train a model?"* (Deliberate 24h prioritization; explainability via symbolic CAS; roadmap slide).
    - *"What about student privacy?"* (No webcam/audio; passive telemetry only).
- **Responsible Members:** All team members.
- **Dependencies:** Final slides and working demo.
- **Expected Output:** Confident, rehearsed presentation and crisp answers for every anticipated question.
- **Completion Criteria:** Team is ready to present on stage.

---

## 3. Dependency Matrix & Parallelization Map

| Component / Task | Can Run in Parallel With | Blocked By | Blocks |
|---|---|---|---|
| **P1: SymPy Parser & Equivalence** | P2 UI on Mocks, P3 Animations, P4 Questions | Phase 0 Contract | P1 Generators, Phase 2 Integration |
| **P1: 6 Generators & Matcher** | P2 Screens, P3 Animations, P4 Prompts | P1 Parser | Phase 2 Integration, Hour 13 Checkpoint |
| **P1: Constrained Fallback & SQLite** | P2 Retry/Transfer, P3 Graph states | P1 Generators | Hour 13 Checkpoint, Evaluation |
| **P2: Step Input & Diagnosis Shell** | P1 Parser, P3 Animations, P4 Questions | Phase 0 Contract (uses mock) | Phase 2 Integration |
| **P2: Retry & Transfer UI Flow** | P1 Fallback, P3 Graph, P4 Teacher seed | Phase 2 Integration | Hour 13 Checkpoint |
| **P2: Photo Vision OCR (W1)** | P1 History/Class routes, P3 Timeline | Hour 13 Checkpoint | Phase 5 Freeze |
| **P3: Hero Animations (Area & Square)** | P1 Parser, P2 Input UI, P4 Questions | Phase 0 Contract | Phase 2 Integration |
| **P3: Remaining 4 Animations & Graph** | P1 Generators, P2 Retry UI | Phase 2 Integration | Hour 13 Checkpoint |
| **P3: Timeline (W6) & Fusion Card (W4)** | P2 Telemetry (W3), P4 Teacher views | Hour 13 Checkpoint | Phase 5 Freeze |
| **P4: Question Bank & Prompts** | P1 Parser, P2 UI, P3 Animations | Phase 0 Contract | Phase 2 Integration, P1 Routes |
| **P4: Seed 40 Students & Dashboard** | P1 Fallback, P2 Screens, P3 Graph | Phase 2 Integration | Hour 13 Checkpoint, Phase 4 W7 |
| **P4: Evaluation Dataset Collection** | P1/P2/P3 core build | Phase 0 Contract | Phase 5 Evaluation Benchmark |
| **P4: Pitch Deck & Demo Script** | All development | Continuous background | Phase 6 Rehearsal |

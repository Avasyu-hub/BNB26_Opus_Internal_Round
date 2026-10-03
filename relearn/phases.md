# Re:Learn — 24-Hour Phased Execution Plan & Timeline

> **Execution Strategy:** Strict Two-Stage Development  
> **Stage 1 (Hours 0–13):** Core Engine & Workflow (C1–C7)  
> **Core Gate (Hour 13):** 6-Point Verification Checkpoint  
> **Stage 2 (Hours 13–18):** Wow Features (W1–W7 in strict priority order behind feature flags)  
> **Hours 18–24:** Feature Freeze, Real Evaluation, 10+ Demo Run-Throughs, Pitch

---

## 1. Master Phase Map

```
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: CORE ENGINE & STUDENT WORKFLOW (Hours 0–13)                   │
├──────────────┬────────────────────────┬────────────────────────────────┤
│ Hours 0–1    │ Phase 0: Foundation    │ Contract, Repo, Mocks, Taxon.  │
│ Hours 1–6    │ Phase 1: Parallel Core │ Build on mocks (M1, M2, M3, M4)│
│ Hours 6–7    │ Phase 2: Integr. #1    │ PARTIAL_DISTRIBUTION End-to-End│
│ Hours 7–13   │ Phase 3: Core Finish   │ All 6 Misconceptions Core Loop │
└──────────────┴────────────────────────┴────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│ CORE GATE CHECKPOINT (Hour 13) — Tag: core-v1                          │
│ All 6 criteria must pass. If failed: continue core, drop Wow features! │
└──────────────────────────────┬─────────────────────────────────────────┘
                               │ (Gate Passed)
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: WOW LAYER (Hours 13–18) — Strict Priority Order               │
├──────────────┬────────────────────────┬────────────────────────────────┤
│ Hours 13–18  │ Phase 4: Wow Layer     │ W1 → W7 → W3 → W5 → W6 → W2 →W4│
│              │                        │ 1 branch/merge at a time       │
│              │                        │ Sleep rotation: 2 x 2.5h shifts│
└──────────────┴────────────────────────┴────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│ FINISH & DEMO HARDENING (Hours 18–24) — FEATURE FREEZE                 │
├──────────────┬────────────────────────┬────────────────────────────────┤
│ Hours 18–20  │ Phase 5: Freeze & Eval │ 50–100 real traces, fix bugs   │
│ Hours 20–23  │ Phase 6: Demo Hardening│ 10+ demo runs, backup video    │
│ Hours 23–24  │ Phase 7: Pitch Ready   │ Slide deck, Q&A drill, pitch   │
└──────────────┴────────────────────────┴────────────────────────────────┘
```

---

## 2. Stage 1 — Core Execution (Hours 0–13)

### Phase 0: Foundation & System Setup (Hours 0–1)
- **Objective:** Establish the common architectural substrate, freeze data contracts, configure local development environments, and produce initial mock data.
- **Tasks:**
  - **All Members:** Lock the 6 misconceptions and taxonomy. Agree that no fields will be added to the JSON contract.
  - **Member 1:** Initialize FastAPI skeleton, install SymPy, configure CORS, and establish SQLite `relearn.db` schema (`attempts`, `learner_profile`).
  - **Member 2:** Initialize React + Vite + Tailwind frontend project; create mock API client returning static JSON payloads.
  - **Member 3:** Initialize React Flow canvas skeleton and configure SVG canvas container for animations.
  - **Member 4:** Create initial `questions.json` mock file with 1 complete hand-verified question chain for `PARTIAL_DISTRIBUTION` (Diagnostic, Retry, Transfer).
- **Dependencies:** None.
- **Expected Output:** Running backend on port 8000, running frontend on port 5173, verified mock data communication.
- **Completion Criteria:** Client renders mock response matching the locked JSON contract.

---

### Phase 1: Parallel Core Build on Mocks (Hours 1–6)
- **Objective:** Build isolated core components against mock interfaces without cross-blocking.
- **Tasks:**
  - **Member 1 (Core C1, C2):**
    - Build SymPy step sanitizer (`parse_expr`, implicit multiplication, unicode minus, carat replacement).
    - Implement step-by-step solution set equivalence checker ($k$ vs $k-1$).
    - Implement first 3 candidate generators: `PARTIAL_DISTRIBUTION`, `SQUARE_OF_SUM`, `NEGATIVE_DISTRIBUTION`.
    - Implement candidate matcher returning `source: "rule"`, `confidence: 0.95`, and exact evidence.
  - **Member 2 (Core UI Steps 1–6):**
    - Build step input screen allowing sequential line-by-line typing.
    - Implement error-step red highlight card driven by `error_step_index`.
    - Build diagnosis card displaying label, root concept, and evidence string.
    - Wire frontend state management to mock responses.
  - **Member 3 (Core C4, C7):**
    - Build Hero Animation 1: **Rectangle Area Model** for `PARTIAL_DISTRIBUTION` (SVG + Framer Motion, dynamic dimension rendering).
    - Build Hero Animation 2: **Split Square Model** for `SQUARE_OF_SUM` ($a^2$, $b^2$, two $ab$ rectangles).
    - Build React Flow Misconception Graph skeleton with 6 misconception nodes + 4 root concept nodes.
  - **Member 4 (Core Content & Prompts):**
    - Write and hand-verify all 24 diagnostic questions (4 per misconception).
    - Write and hand-verify all 12 same-domain retry questions (2 per misconception).
    - Write and hand-verify all 6 cross-domain transfer questions (Physics, Geometry, Code).
    - Draft constrained LLM fallback prompt and pedagogical intervention prompt.
    - Begin gathering 50–100 authentic student error traces for the evaluation dataset.
- **Dependencies:** Phase 0 completion.
- **Expected Output:** Unit-tested generators for 3 misconceptions, polished input/diagnosis screens, 2 functional visual proof animations, complete hand-verified question bank JSON.
- **Completion Criteria:** Member 1 tests pass on synthetic inputs; Member 2 displays mock diagnosis cleanly; Member 3 animations render smoothly at 60 FPS.

---

### Phase 2: Integration #1 — PARTIAL_DISTRIBUTION End-to-End (Hours 6–7)
- **Objective:** Connect all four streams for a single misconception (`PARTIAL_DISTRIBUTION`) through the complete core pipeline.
- **Tasks:**
  - **Member 1 & Member 2:** Connect React step input UI to real FastAPI `/attempt` endpoint. Submit `2(x+3)=14 \to 2x+3=14`.
  - **Member 1 & Member 4:** Wire `/questions` to serve verified question bank; test `/intervention` returning area model ID and explanation.
  - **Member 2 & Member 3:** Mount Rectangle Area Model SVG inside intervention view and wire React Flow graph to transition `PARTIAL_DISTRIBUTION` node from Inactive (grey) $\to$ Detected (orange glow).
  - **Member 1 & Member 2:** Wire `/retry` and `/transfer` endpoints; verify state updates to SQLite `learner_profile`.
- **Dependencies:** Phase 1 components.
- **Expected Output:** First fully integrated, live end-to-end execution of `PARTIAL_DISTRIBUTION` from typing to transfer verification.
- **Completion Criteria:** Real user types `2(x+3)=14 \to 2x+3=14`, system flags step 0, renders area model, accepts retry `5(x-2)=20`, and evaluates geometry transfer item.

---

### Phase 3: Core Completion & Remaining Misconceptions (Hours 7–13)
- **Objective:** Expand the verified pipeline to all 6 misconceptions and complete the full core loop.
- **Tasks:**
  - **Member 1 (Core C1, C2, C3, SQLite):**
    - Implement remaining 3 generators: `TRANSPOSITION`, `UNLIKE_TERMS`, `NEG_TIMES_NEG`.
    - Implement Constrained LLM Fallback (fixed 6-label taxonomy + "unknown", JSON mode, confidence ceiling 0.70).
    - Finalize SQLite learner profile read/write queries.
    - Build automated evaluation script skeleton.
  - **Member 2 (Core UI Steps 7–9):**
    - Finalize Intervention view hosting all animation embeds.
    - Build Same-Domain Retry screen with loop-back logic (maximum 2 retries).
    - Build Cross-Domain Transfer screen with explicit pass ("Transfer verified ✓") and fail ("Persists in new context ✗") views.
  - **Member 3 (Core C4, C7):**
    - Complete remaining 4 visual proof animations: Number-Line Reflection, Balance Scale, Grouping Tiles, Rate Pattern.
    - Implement all 5 graph node visual states: Inactive (grey), Detected (orange glow), Resolved in algebra (blue), Transfer verified (green), Persists in new context (red ring).
  - **Member 4 (Core Content & Intervention API):**
    - Deploy final hand-verified `questions.json` to backend.
    - Implement FastAPI `/intervention` route returning animation ID and LLM-generated explanation using student's numbers.
    - Continue curating real student wrong solutions dataset (`evaluation_set.json`).
- **Dependencies:** Phase 2 integration patterns.
- **Expected Output:** Complete, autonomous core system covering all 6 misconceptions.
- **Completion Criteria:** All 6 misconceptions run end-to-end through typed input with zero bugs.

---

## 3. Core Gate Checkpoint (Hour 13)

> **MANDATORY GATE:** Stage 2 Wow Layer development is strictly blocked until every criterion below is verified.

### 6-Point Verification Checklist
1. **All 6 Misconceptions Function:** End-to-end typed working through diagnosis, proof, retry, and transfer executes successfully for all 6 misconceptions.
2. **Loop-Backs Operational:** Retry loop-back (max 2 attempts before flagging) and transfer pass/fail pathways execute correctly.
3. **Graph State Transitions Verified:** Misconception nodes visually update across grey $\to$ orange $\to$ blue $\to$ green / red ring.
4. **Data Persisted in SQLite:** Attempt and stage records write reliably to `relearn.db`.
5. **Stability Run:** 3 consecutive full loop executions complete without uncaught errors.
6. **Git Tag Created:** Working codebase committed and tagged `core-v1`.

### Contingency & Fallback Protocol
If the Core Gate is **not passed** by Hour 13:
- The team does **not** proceed to Stage 2.
- All 4 members swarm on the blocking core defects.
- Wow layer features are pruned immediately starting from the bottom of the priority list (`W4`, then `W2`, then `W6`).
- Core stability takes absolute precedence over all demo embellishments.

---

## 4. Stage 2 — Wow Layer Execution (Hours 13–18)

> **Build Rule:** Work in strict priority order. Each feature developed on a dedicated branch, gated behind a toggle in `features.json`, and merged individually with regression testing against `core-v1`.
>
> **Sleep Rotation Strategy:** Between Hours 13–18, team operates in two split shifts: Member 1 & Member 3 sleep ~2.5 h (Hours 13.0–15.5); Member 2 & Member 4 sleep ~2.5 h (Hours 15.5–18.0).

```
WOW BUILD QUEUE:
[Priority 1: W1 Photo Input] ─────────► Merged & Tested
        │
[Priority 2: W7 Teacher Dashboard] ───► Merged & Tested
        │
[Priority 3: W3 Confidence Signal] ───► Merged & Tested
        │
[Priority 4: W5 Hindi/Bengali] ───────► Merged & Tested
        │
[Priority 5: W6 Evolution Timeline] ──► Merged & Tested
        │
[Priority 6: W2 Explain Box] ─────────► Merged & Tested
        │
[Priority 7: W4 Multimodal Card] ─────► Merged & Tested
```

### Wow Tasks by Priority:
1. **W1 — Photo of Handwritten Work (Priority 1 | Member 2 with Member 1):**
   - Member 2 creates file upload / camera capture UI.
   - Member 1/2 connects `/photo-to-steps` to vision LLM, extracting steps array into input rows.
2. **W7 — Teacher Dashboard & Peer Groups (Priority 2 | Member 4):**
   - Seed SQLite with 40 simulated student profiles (`seeded_students.json`, clearly labelled "simulated").
   - Implement `/class/summary` endpoint aggregating heatmap matrix, peer groups, and transfer failure alerts.
   - Member 4 builds teacher dashboard view (Heatmap + Peer Groups + Alerts).
3. **W3 — Confidence Signal (Priority 3 | Member 2):**
   - Client records keystroke latency (`ms_per_step`), backspace counts, and edits.
   - Maps metrics to categorical indicator (`low`, `medium`, `high`) without camera/mic.
4. **W5 — Hindi / Bengali Language Toggle (Priority 4 | Member 2 & Member 4):**
   - Add language switcher (`en`, `hi`, `bn`) on intervention card.
   - Member 4 prompts `/intervention` to return localized pedagogical explanation.
5. **W6 — Knowledge Evolution Timeline (Priority 5 | Member 3):**
   - Member 1 provides `/student/{id}/history` endpoint.
   - Member 3 builds Recharts chronological timeline tracking student concept trajectory.
6. **W2 — "Explain Your Thinking" Box (Priority 6 | Member 2):**
   - Add optional text input below steps.
   - Backend passes explanation as additional context to constrained LLM fallback.
7. **W4 — Multimodal Fusion Card (Priority 7 | Member 3):**
   - Design unified diagnosis card aggregating photo thumbnail, typed steps, explanation, telemetry confidence, and diagnosis.

---

## 5. Finish & Demo Hardening (Hours 18–24)

### Phase 5: Feature Freeze & Empirical Evaluation (Hours 18–20)
- **Objective:** Absolute code freeze on new features; execute rigorous evaluation benchmark on authentic student work.
- **Tasks:**
  - **Feature Freeze:** Any incomplete Wow feature is disabled via `features.json` and relocated to the pitch roadmap slide.
  - **Member 1 & Member 4:** Run evaluation benchmark script across 50–100 authentic student solutions (`evaluation_set.json`).
  - Compute headline accuracy metrics: Error-Step Localisation Accuracy, Rule-Only Diagnosis Accuracy, Combined (Rule + LLM) Accuracy, and % "Unknown".
  - Inspect edge-case failures; patch high-priority parser anomalies in SymPy without altering core logic.
- **Completion Criteria:** Verified empirical accuracy scorecard generated for the pitch presentation.

---

### Phase 6: Demo Hardening & Rehearsal (Hours 20–23)
- **Objective:** Achieve bulletproof reliability for the live 2-minute pitch demonstration.
- **Tasks:**
  - Pre-cache all LLM responses for the primary demo path (`PD_02`: $2(x+3)=14$).
  - Execute **10+ full end-to-end demo run-throughs** in sequence.
  - Record a flawless 1080p screen recording of the live demo as an emergency backup.
  - Verify that if the internet drops, cached routes and local SQLite allow the full demo to proceed.
- **Completion Criteria:** 10 consecutive uninterrupted runs with zero crashes; backup video saved to local desktop.

---

### Phase 7: Pitch Deck & Q&A Drill (Hours 23–24)
- **Objective:** Finalize pitch presentation and rehearse rigorous defense against judging panel questions.
- **Tasks:**
  - Member 4 finalizes 2-minute pitch slides: Hook $\to$ Live Demo $\to$ Transfer Verification Hero Moment $\to$ Teacher Heatmap $\to$ Empirical Accuracy Number $\to$ Roadmap.
  - Team conducts mock Q&A drill covering key objections:
    - *"Why not just use GPT-4o directly?"* (Deterministic symbolic proof, explainable evidence, zero hallucinated diagnosis).
    - *"How does this differ from Khan Academy or Eedi?"* (Step-level error pinpointing + cross-domain transfer verification).
    - *"Why no webcam or eye-tracking?"* (Privacy protection for minors, ethical compliance, robust keystroke telemetry).
- **Completion Criteria:** Pitch delivered within strict 2-minute window; all 4 members aligned on Q&A answers.

---

## 6. Dependency & Parallel Execution Matrix

| Subsystem / Task | Stage | Member | Can Run in Parallel With | Absolute Pre-requisites |
|---|---|---|---|---|
| SymPy Sanitizer & Equivalence | **Core** | M1 | M2 UI, M3 Proofs, M4 Content | Phase 0 Setup |
| Input & Diagnosis UI | **Core** | M2 | M1 Engine, M3 Proofs, M4 Content | Phase 0 Setup (uses mocks) |
| SVG Visual Proofs (Area / Square) | **Core** | M3 | M1 Engine, M2 UI, M4 Content | Phase 0 Setup |
| Hand-Verified Question Bank | **Core** | M4 | M1 Engine, M2 UI, M3 Proofs | Phase 0 Setup |
| **Integration #1 (PARTIAL_DISTRIB)** | **Core** | All | None (Team Milestone) | First 3 generators, UI shell, Area SVG |
| Remaining 3 Generators & LLM Fallback | **Core** | M1 | M2 Retry/Transfer UI, M3 Remaining Proofs | Integration #1 |
| Retry & Transfer UI Screens | **Core** | M2 | M1 Backend, M3 Visuals | Integration #1 |
| Remaining 4 Visual Proofs & Graph States | **Core** | M3 | M1 Backend, M2 Screens | Integration #1 |
| `/intervention` Route & Fallback Prompts | **Core** | M4 | M1 Fallback, M3 Proof IDs | Integration #1 |
| **CORE GATE VERIFICATION** | **Gate** | **All** | **NO WORK PERMITTED IN PARALLEL** | **Phase 1, 2, 3 Core Tasks Completed** |
| W1 Photo Input (P1) | **Wow** | M2, M1 | W7 Teacher Data Prep | **CORE GATE PASSED** |
| W7 Teacher Dashboard (P2) | **Wow** | M4 | W1 Photo Upload UI | **CORE GATE PASSED** |
| W3 Confidence Telemetry (P3) | **Wow** | M2 | W7 Dashboard Assembly | **CORE GATE PASSED** |
| W5 Hindi/Bengali Toggle (P4) | **Wow** | M2, M4 | W6 Timeline Canvas | **CORE GATE PASSED** |
| W6 Evolution Timeline (P5) | **Wow** | M3, M1 | W5 Localization | **CORE GATE PASSED** |
| W2 Explain Box (P6) | **Wow** | M2 | W4 Fusion Card | **CORE GATE PASSED** |
| W4 Multimodal Fusion Card (P7) | **Wow** | M3 | None (Final Wow Item) | **CORE GATE PASSED** |
| **Feature Freeze & Eval Benchmark** | **Finish**| **All** | None (Absolute Freeze) | Hour 18 Milestone |
| **10+ Demo Run-Throughs** | **Finish**| **All** | None | Feature Freeze |

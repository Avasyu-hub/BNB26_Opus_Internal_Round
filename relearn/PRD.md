# Re:Learn — Product Requirements Document (PRD)

> **Document Version:** 1.0 (Hackathon Baseline)  
> **Status:** Final Project Plan  
> **Build Strategy:** Strict Two-Stage Architecture (**Stage 1: Core C1–C7** $\to$ **Core Gate** $\to$ **Stage 2: Wow W1–W7**)

---

## 1. Product Overview & Executive Summary

**Re:Learn** is an AI-powered diagnostic and pedagogical tutor that identifies, explains, and remediates algebraic misconceptions at the exact step of failure, subsequently validating whether structural comprehension transfers across physics, geometry, and computer science.

Traditional educational platforms detect incorrect final answers, reveal the standard algorithmic solution, and present an identical algebraic drill. Students mimic the mechanical steps without repairing their underlying conceptual model. The misconception remains latent, inevitably resurfacing when the student encounters isomorphic structures in physics formulas, coordinate geometry, or software engineering.

Re:Learn delivers:
1. **Deterministic Error Localisation:** Pinpoints the exact line where mathematical equivalence is violated.
2. **Explainable Symbolic Diagnosis:** Matches student error steps against misconception transformation rules with proof-level evidence.
3. **Constrained AI Reasoning:** Constrains LLM fallback to a rigid diagnostic taxonomy with calibrated confidence.
4. **Dynamic Visual Proofs:** Replaces rote algebraic manipulation with geometric and physical representations.
5. **Cross-Domain Transfer Verification (Hero Feature):** Tests the repaired concept in science, geometry, and programming contexts.

---

## 2. Target Users & Problem Definition

### 2.1 Target Users
- **Primary Learners:** Students in Classes 7–10 (Ages 12–16) under CBSE/ICSE curriculums learning linear equations, algebraic expansions, and sign rules.
- **Secondary Stakeholders (Teachers):** Secondary school mathematics educators managing large cohorts (40–60 students per classroom) who lack the bandwidth to conduct step-by-step diagnostic audits for every homework assignment.

### 2.2 Core Problems Addressed
1. **Superficial "Right vs. Wrong" Binary:** Existing platforms evaluate the destination (the final numerical answer) rather than the mathematical journey (step-by-step reasoning).
2. **Persistence Across Contexts:** When an algebra misconception (e.g., $-(x+5) \to -x+5$) is ignored, the student subsequently fails physics vector calculations or coordinate reflections without realizing the failure is algebraic.
3. **Teacher Invisibility:** Educators see average test scores but have no visibility into shared latent misconceptions or cross-disciplinary transfer failure rates across their class.

---

## 3. Goals & Success Criteria

### 3.1 Hackathon Goals
- Deliver a working, end-to-end web application within a 24-hour development cycle.
- Enforce the non-negotiable two-stage build rule: Complete and lock **Stage 1 (Core C1–C7)** by Hour 13 before executing **Stage 2 (Wow W1–W7)**.
- Establish an empirical accuracy metric backed by 50–100 authentic, handwritten/transcribed student error samples.

### 3.2 Key Success Criteria
- **Core Gate Criterion (Hour 13):** All 6 core misconceptions successfully complete the full loop (Step Input $\to$ Diagnosis $\to$ Visual Proof $\to$ Same-Domain Retry $\to$ Cross-Domain Transfer Test $\to$ SQLite Persistence) 3 consecutive times with zero manual overrides.
- **Demo Hardening Criterion (Hour 20–23):** 10 consecutive flawless executions of the 2-minute live demo script.
- **Empirical Validation Criterion (Hour 18–20):** Evaluation harness reports error-step localisation accuracy and diagnostic accuracy across 50–100 real wrong solutions with zero hallucinations.

---

## 4. User Flows

### 4.1 Student Workflow (10-Step Lifecycle)

```
[ Step 1: Pick Question ] 
         │  Diagnostic question bank selection (~4 per misconception)
         ▼
[ Step 2: Enter Working ] 
         │  Typed lines (Core) OR Photo Upload (Wow W1) + Explanation (Wow W2)
         ▼
[ Step 3: Parse & Normalise ] 
         │  SymPy sanitisation: ^ to **, implicit mult, unicode minus
         ▼
[ Step 4: Localise Error (C1) ] 
         │  Solution set comparison: Step k vs k-1. First mismatch = Error Step
         ▼
[ Step 5: Diagnose Misconception (C2 / C3) ] 
         │  6 Symbolic Generators match step? 
         │  ├─ Yes: source="rule", conf=0.95
         │  └─ No: Constrained LLM fallback (fixed taxonomy, conf<=0.70)
         ▼
[ Step 6: Diagnosis Card & Graph Update (C7) ] 
         │  Display error step, evidence, root concept. Graph node glows orange.
         ▼
[ Step 7: Visual Intervention (C4) ] 
         │  Interactive SVG animation + 3-4 sentence contextual explanation
         │  Optional Hindi/Bengali language toggle (Wow W5)
         ▼
[ Step 8: Same-Domain Retry (C5) ] 
         │  Algorithmic variant targeting identical misconception
         │  ├─ Pass: Update profile stage to "retry_passed" (Graph turns blue)
         │  └─ Fail: Alternate visual hint; max 2 loops before teacher flag
         ▼
[ Step 9: Cross-Domain Transfer Test (C6 ★ HERO) ] 
         │  Physics, Geometry, or Programming scenario
         │  ├─ Pass: "Transfer verified ✓" (Graph node turns green)
         │  └─ Fail: "Persists in new context ✗" (Graph node gets red ring)
         ▼
[ Step 10: Profile & History Persistence ]
            Attempt record committed to SQLite database.
```

### 4.2 Teacher Workflow (Read-Only Analytical Surface)
Teachers access dedicated analytics derived purely from learner profile data stored in SQLite. Teacher interfaces never invoke the diagnosis engine directly:
- **T1: Class Misconception Heatmap:** Aggregated view across the 40-student cohort displaying percentage mastery and active misconception density.
- **T2: Student Deep-Dive:** Longitudinal timeline revealing when misconceptions were diagnosed, retried, and whether they successfully transferred.
- **T3: Dynamic Peer Grouping:** Automated clustering of students sharing identical active misconceptions for small-group remedial intervention.
- **T4: Transfer-Failure Alerts:** High-priority notifications highlighting students who mastered algebra drills but failed cross-domain transfer in physics/geometry/code.

---

## 5. Functional Requirements

### 5.1 Stage 1: Core Functional Requirements (Mandatory by Hour 13)

| Req ID | Feature Name | Stage | Detailed Functional Specification |
|---|---|---|---|
| **FR-C1** | Step-Level Error Localisation | **Core** | System shall parse sequential student steps into SymPy expressions. System shall compute the solution set of each step $k$ and compare against step $k-1$. The first step violating algebraic equivalence shall be flagged as `error_step_index`. If all steps are equivalent but the final number is wrong, flag as arithmetic slip. |
| **FR-C2** | Generate-and-Match Diagnosis | **Core** | System shall execute 6 deterministic transformation functions on step $k-1$. If a generated candidate is algebraically identical to the student's erroneous step $k$, assign the corresponding diagnostic label with `source: "rule"`, `confidence: 0.95`, and exact mathematical evidence. |
| **FR-C3** | Constrained LLM Fallback | **Core** | When no deterministic rule reproduces step $k$, system shall query the LLM fallback. The prompt shall strictly enforce output of one of the 6 fixed labels or `"unknown"`. LLM-assigned confidence must be capped at $\le 0.70$ and tagged with `source: "llm"` ("AI estimate"). |
| **FR-C4** | Visual Proof Animations | **Core** | System shall provide 6 pre-built interactive SVG animations (Area Model, Split Square, Number-Line Reflection, Balance Scale, Grouping Tiles, Rate Pattern). Intervention engine shall render the matching animation alongside 3–4 sentences of LLM-generated explanation using the student's exact values. |
| **FR-C5** | Same-Domain Retry Loop | **Core** | Following intervention, system shall prompt the student with a new algebra problem targeting the identical misconception. Correct response transitions stage to `retry_passed`. Incorrect response offers alternate hint with a maximum limit of 2 iterations before flagging for instructor assistance. |
| **FR-C6** | Cross-Domain Transfer Test (★ HERO) | **Core** | System shall present a hand-verified application scenario in Physics, Geometry, or Programming requiring the identical mental model. Correct solution transitions stage to `transfer_passed` ("Transfer verified ✓"). Incorrect solution transitions stage to `transfer_failed` ("Persists in new context ✗") and displays a domain-bridging explanation. |
| **FR-C7** | Live Misconception Graph | **Core** | System shall render a dynamic React Flow graph featuring 6 misconception nodes connected to 4 root concepts (`DISTRIBUTIVE_LAW`, `EQUALITY_BALANCE`, `LIKE_TERMS`, `INTEGER_RULES`). Graph nodes shall visually reflect states: Inactive (grey), Detected (orange glow), Resolved in algebra (blue), Transfer verified (green), and Persists in new context (red ring). |

### 5.2 Stage 2: Wow Layer Functional Requirements (Hours 13–18, Strict Priority Order)

| Req ID | Feature Name | Stage | Priority | Detailed Functional Specification |
|---|---|---|---|---|
| **FR-W1** | Photo of Handwritten Work | **Wow** | P1 | System shall accept an image upload of handwritten algebra working via `/photo-to-steps`. A vision model shall extract individual mathematical lines as a JSON array and populate the step input interface for student confirmation before execution. |
| **FR-W7** | Teacher Dashboard & Peer Groups | **Wow** | P2 | System shall serve `/class/summary` aggregating data from 40 seeded student profiles (clearly labelled "simulated"). Dashboard shall render a class heatmap, list students sharing specific misconceptions, and flag transfer failures. |
| **FR-W3** | Confidence Signal Capture | **Wow** | P3 | Client shall monitor step-level typing latency (`ms_per_step`), deletion counts, and total edits. System shall map telemetry to a categorical confidence indicator (`low`, `medium`, `high`) without recording video or audio. |
| **FR-W5** | Hindi / Bengali Language Toggle | **Wow** | P4 | System shall provide a locale switcher on the intervention card allowing students to re-request the 3–4 sentence conceptual explanation translated into Hindi (`hi`) or Bengali (`bn`) while maintaining mathematical formulas. |
| **FR-W6** | Knowledge Evolution Timeline | **Wow** | P5 | System shall query `/student/{id}/history` and render a Recharts timeline displaying the chronological progression of misconceptions from initial detection to algebraic resolution and cross-domain transfer. |
| **FR-W2** | "Explain Your Thinking" Input | **Wow** | P6 | Step input screen shall offer an optional text field allowing the student to articulate their rationale. When present, this string shall be provided as supplemental context to the constrained LLM fallback. |
| **FR-W4** | Multimodal Fusion Card | **Wow** | P7 | System shall render a unified diagnostic summary card presenting typed steps, handwritten photo thumbnail, student explanation, calculated telemetry confidence, and symbolic evidence in a single cohesive view. |

---

## 6. The Six Misconceptions & Transfer Domain Map

```
                     ┌────────────────────────┐
                     │     ROOT CONCEPTS      │
                     └───────────┬────────────┘
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ DISTRIBUTIVE_LAW │   │ EQUALITY_BALANCE │   │   LIKE_TERMS     │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
         ├──────────────────────┼──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼                      ▼
  PARTIAL_DISTRIBUTION    TRANSPOSITION          UNLIKE_TERMS           NEG_TIMES_NEG
  2(x+3) -> 2x+3          x+5=10 -> x=10+5       3x+5 -> 8x             (-3)(-4) -> -12
  Root: DISTRIBUTIVE_LAW  Root: EQUALITY_BALANCE Root: LIKE_TERMS       Root: INTEGER_RULES
  Visual: Area Model      Visual: Balance Scale  Visual: Grouping Tiles Visual: Rate Pattern
  Transfer: Geometry      Transfer: Programming  Transfer: Physics      Transfer: Physics
         │
         ├─────────────────────────────────────────────┐
         ▼                                             ▼
  SQUARE_OF_SUM                                 NEGATIVE_DISTRIBUTION
  (a+b)² -> a²+b²                               -(x+5) -> -x+5
  Root: DISTRIBUTIVE_LAW                        Root: DISTRIBUTIVE_LAW, INTEGER_RULES
  Visual: Split Square                          Visual: Number-Line Reflection
  Transfer: Geometry                            Transfer: Physics
```

---

## 7. Non-Functional Requirements

### 7.1 Performance & Responsiveness
- **Deterministic Diagnosis Latency:** SymPy parsing, solution set evaluation, and rule matching must complete in $< 150\text{ ms}$ on local hardware.
- **LLM Fallback & Intervention Latency:** Cloud LLM calls must respond within $< 2.5\text{ s}$. Demo-path responses (e.g. for `2(x+3)=14`) must be pre-cached to guarantee instantaneous zero-latency execution during pitch presentations.
- **Animation Smoothness:** Visual proofs must render at 60 FPS using hardware-accelerated SVG and CSS transitions without layout shifts.

### 7.2 Safety, Privacy & Ethical Compliance
- **Protection of Minors:** Absolutely zero collection of facial video, webcam streams, voice recordings, or personal biometric identifiers.
- **Minimal Data Footprint:** Student identity is represented solely by an anonymous pseudonym identifier (e.g., `s_07`).
- **Simulated Cohort Transparency:** All teacher dashboard demo data representing 40 students must carry explicit visual tags indicating `"Simulated Research Data"`.

### 7.3 Reliability & Fault Tolerance
- **Graceful Parsing Degradation:** Mathematical parse failures must never trigger unhandled 500 exceptions. If a student inputs invalid syntax, the API returns a friendly validation error highlighting the exact line requiring correction.
- **Feature Flag Containment:** Every Stage 2 Wow feature must be isolated behind an individual boolean flag in `features.json`. If a feature demonstrates instability, it can be instantly disabled without impacting Stage 1 core capabilities.

---

## 8. AI/ML Requirements

1. **Rule-First Priority:** Machine learning models are never invoked if a deterministic mathematical rule resolves the problem.
2. **Constrained Fallback Architecture:**
   - **Model:** Fast multimodal cloud model (e.g. Gemini 1.5 Flash / Claude 3.5 Haiku) or local Qwen2-VL / Ollama.
   - **Prompt Constraint:** System prompt forces JSON output strictly matching `{ "label": "<LABEL>", "evidence": "<STRING>", "confidence": <FLOAT> }`.
   - **Taxonomy Validation:** Backend rejects any label not in `["PARTIAL_DISTRIBUTION", "SQUARE_OF_SUM", "NEGATIVE_DISTRIBUTION", "TRANSPOSITION", "UNLIKE_TERMS", "NEG_TIMES_NEG", "unknown"]`.
   - **Confidence Cap:** Enforced maximum confidence ceiling of $0.70$ for all LLM predictions.
3. **Intervention Generation:**
   - LLM receives diagnosed label, mathematical evidence, and student's original numbers.
   - Outputs exactly 3–4 pedagogical sentences explaining the breakdown.
   - Never re-diagnoses or changes the diagnostic label.
   - Supports parameterised language output (`en`, `hi`, `bn`).
4. **Vision Model for Handwriting (W1):**
   - Receives high-resolution image of handwritten paper.
   - Extracts mathematical lines into an ordered array of strings: `["2(x+3)=14", "2x+3=14", "2x=11", "x=5.5"]`.

---

## 9. Data Requirements

1. **Question Bank (`questions.json`):**
   - 24 Hand-verified diagnostic algebra questions (4 per misconception).
   - 12 Hand-verified same-domain retry questions (2 per misconception).
   - 6 Hand-verified cross-domain transfer questions (1 per misconception spanning Physics, Geometry, and Programming) with explicit rubrics and canonical answers.
2. **Seeded Student Profiles (`seeded_students.json`):**
   - 40 Simulated student records representing realistic classroom distribution: 65% mastered, 20% active algebra misconceptions, 15% transfer-failed persistent misconceptions.
3. **Real Evaluation Dataset (`evaluation_set.json`):**
   - 50–100 authentic student error traces harvested from genuine student workings (not synthetically generated) to ensure honest, non-circular accuracy reporting.

---

## 10. Future Scope & Roadmap (Pitch Deck Only — Not Built in 24h)

- Fine-tuned DeBERTa-v3-small model benchmarked against TF-IDF + Logistic Regression baseline for unstructured student rationales.
- Longitudinal probabilistic resolution model tracking forgetting curves and recurrence risks.
- Automated school-wide curriculum adjustment based on aggregated transfer-failure clusters.
- End-to-end handwriting recognition transformer fine-tuned on messy mathematical notation and struck-out expressions.
- Dynamic Bayesian knowledge graph discovery from longitudinal multi-school datasets.

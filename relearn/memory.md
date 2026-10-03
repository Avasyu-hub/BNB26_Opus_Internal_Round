# Re:Learn — Persistent Project Memory

> **Single Source of Truth & Project State Anchor**  
> *Target System:* Cross-Domain Misconception Graph Tutor for Algebra (CBSE/ICSE Classes 7–10)  
> *Project Nature:* 24-Hour Hackathon Build (4 Team Members, AI-Assisted Vibe Coding)  
> *Current Status:* **Planning Complete — Implementation Not Yet Started**

---

## 1. Non-Negotiable Rule: Two-Stage Build Order

```
┌─────────────────────────────────────────────────────────────┐
│ STAGE 1: CORE (Hours 0–13)                                  │
│ Features C1–C7 ONLY. Full typed-input student loop.         │
│ No wow code. Early finishers assist with core test/integ.   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ CORE GATE CHECKPOINT (Hour 13)                              │
│ 6 Mandatory Verification Criteria. Rollback Tag: core-v1.   │
│ If gate fails: CONTINUE CORE, DROP WOW ITEMS FROM BOTTOM.   │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Passed)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ STAGE 2: WOW LAYER (Hours 13–18)                            │
│ Features W1–W7 in strict priority:                          │
│ W1 → W7 → W3 → W5 → W6 → W2 → W4                            │
│ Behind feature flags, individual branch, merge 1-by-1.     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ FEATURE FREEZE (Hour 18)                                    │
│ Zero new code. Evaluation, demo hardening, slides & pitch.  │
└─────────────────────────────────────────────────────────────┘
```

### Core Gate Checklist (Hour 13 Checkpoint)
Before any Stage 2 Wow task may begin, all six conditions below must be verified and checked off:

- [ ] **1. All 6 Misconceptions Run End-to-End:** Typed input through parse, step-error localisation, rule/LLM diagnosis, visual proof, same-domain retry, and cross-domain transfer test execute with zero manual intervention.
- [ ] **2. Loop-Backs & Paths Function:** Same-domain retry loop-back (maximum 2 loops before teacher flag) and cross-domain transfer pass/fail paths both work reliably.
- [ ] **3. Graph State Visualisation Operates:** Misconception graph accurately transitions across Inactive (grey), Detected (orange glow + root glow), Resolved in algebra (blue), Transfer verified (green), and Persists in new context (red ring).
- [ ] **4. SQLite Persistence Verified:** Every student attempt record correctly persists in SQLite with the updated learner profile `stage` (`diagnosed`, `retry_passed`, `transfer_passed`, `transfer_failed`).
- [ ] **5. Stability Run:** The complete core demo workflow runs 3 consecutive times without a single crash or uncaught exception.
- [ ] **6. Git Rollback Tag Committed:** Working core codebase is committed and tagged as `core-v1`.

> **Core Gate Passed Status:** **`NO`** *(Implementation Not Yet Started)*

---

## 2. Project Component Status Table

| Component ID | Feature / Subsystem | Stage | Owner | Status | Dependencies | Notes |
|---|---|---|---|---|---|---|
| **C1** | Step-level error localisation | **Core** | Member 1 | Not Started | None | SymPy solution set comparison (step $k$ vs $k-1$) |
| **C2** | Generate-and-match diagnosis | **Core** | Member 1 | Not Started | C1 | 6 symbolic transformation generators |
| **C3** | Constrained LLM fallback | **Core** | Member 1 | Not Started | C2, M4 prompts | Fixed 6-label list + "unknown", confidence $\le 0.7$ |
| **C4** | 6 Visual proofs (SVG/Framer) | **Core** | Member 3 | Not Started | None | Area model & Square split prioritized first |
| **C5** | Same-domain retry loop | **Core** | Member 2 | Not Started | C1, C2, M4 questions | UI loop-back logic, max 2 retries |
| **C6** | Cross-domain transfer test (★ HERO) | **Core** | Member 2 | Not Started | C5, M4 questions | Physics/geometry/code transfer pass & persist paths |
| **C7** | Live misconception graph | **Core** | Member 3 | Not Started | None | React Flow, 6 misconception nodes + root concepts |
| **API-Core** | Core endpoints (`/attempt`, `/retry`, `/transfer`, `/questions`) | **Core** | Member 1 | Not Started | Schema design | FastAPI routes adhering to locked JSON contract |
| **API-Intervention** | `/intervention` route | **Core** | Member 4 | Not Started | None | Connects animation ID + explanation prompt |
| **DB-Core** | SQLite schema & profile store | **Core** | Member 1 | Not Started | None | `attempts` and `learner_profile` tables |
| **UI-Core** | Student screens 1–9 | **Core** | Member 2 | Not Started | M1 mock API | Question picker, step input, diagnosis, retry, transfer |
| **Content-Core** | Hand-verified question bank | **Core** | Member 4 | Not Started | None | ~24 diagnostic, 12 retry, 6 transfer items |
| **Eval-Core** | Real wrong solutions dataset & eval script | **Core** | Member 1 & 4 | Not Started | None | 50–100 real student solutions for accuracy metric |
| **W1** | Photo of handwritten work | **Wow** (P1) | Member 2 | Not Started | Core Gate | Vision model $\to$ JSON steps $\to$ pipeline |
| **W7** | Teacher dashboard & peer groups | **Wow** (P2) | Member 4 | Not Started | Core Gate | Class heatmap, 40 seeded students, transfer alerts |
| **W3** | Confidence signal capture | **Wow** (P3) | Member 2 | Not Started | Core Gate | Step telemetry (latency, edits) $\to$ low/med/high |
| **W5** | Hindi / Bengali toggle | **Wow** (P4) | Member 2 | Not Started | Core Gate | Re-request `/intervention` with `language` parameter |
| **W6** | Knowledge evolution timeline | **Wow** (P5) | Member 3 | Not Started | Core Gate | Recharts per-student history visualisation |
| **W2** | "Explain your thinking" box | **Wow** (P6) | Member 2 | Not Started | Core Gate | Optional text fed to LLM fallback as extra evidence |
| **W4** | Multimodal fusion card | **Wow** (P7) | Member 3 | Not Started | Core Gate | Steps + photo + explanation + confidence card |

---

## 3. Project Overview & Objectives

- **Project Name:** Re:Learn — Cross-Domain Misconception Graph Tutor for Algebra
- **One-Line Pitch:** Fixing a wrong answer isn't the same as fixing the misconception. Re:Learn finds the exact step where a student's algebra breaks, diagnoses *why*, teaches it visually, and then checks whether the understanding transfers to physics, geometry, and code.
- **Problem Statement:** Standard ed-tech applications evaluate final answers. When an answer is wrong, they present the textbook solution. Students memorize or copy the mechanical fix, score correctly on immediate identical algebra questions, but preserve the faulty mental model. That misconception eventually breaks down in subsequent grades or other disciplines (physics equations, geometry area formulas, coding balance expressions) where no one connects the failure back to elementary algebra.
- **Core Contribution & Positioning:** Re:Learn combines:
  1. Deterministic step-level error localisation via symbolic computation (SymPy).
  2. Explainable generate-and-match diagnosis with exact mechanical evidence.
  3. Constrained LLM fallback preserving strict label taxonomy.
  4. Visual foundational proofs linking algebraic syntax to geometric/physical reality.
  5. **Cross-Domain Transfer Verification (Hero Feature):** Evaluating whether the repaired mental model survives in real-world science, geometry, and programming applications.
- **Target Audience:** Students in Classes 7–10 (CBSE/ICSE curriculums, ages 12–16) and their teachers managing classes of 40–60 learners.

---

## 4. Locked Decisions (Must Not Change Without Full Team Consensus)

1. **Symbolic-First Diagnosis:** Always check mathematical equivalence and apply deterministic candidate generators with SymPy before delegating to an LLM. Rule matches yield `source: "rule"` with confidence `0.95`.
2. **Strict Taxonomy Constraint:** The LLM fallback is constrained to the 6 predefined misconception labels or `"unknown"`. It is never allowed to fabricate new diagnostic categories. LLM confidence is capped at `0.70` and tagged as `"AI estimate"`.
3. **No Biometric / Webcam / Microphone Surveillance:** We deliberately reject emotion detection, facial analysis, and audio capture due to ethical risks, minor privacy violations (COPPA/GDPR/Indian Digital Personal Data Protection Act compliance), and low scientific validity. Telemetry is strictly client keystroke/timer based.
4. **Locked JSON Contract:** The API payload schema (defined in `memory.md` Section 6) is frozen across all team members and AI coding agent prompts. Optional Wow fields default to `null` or standard defaults (`"typed"`, `"en"`).
5. **SQLite Storage:** Hackathon scope mandates zero external cloud database dependencies (no Postgres, Firebase, or Supabase). A single local `relearn.db` SQLite database powers persistence.
6. **Hand-Verified Content:** Every diagnostic question, retry variant, transfer scenario, and expected answer must be verified by a human team member.
7. **Strict Feature Freeze at Hour 18:** No new features or wow explorations past hour 18. Hours 18–24 are dedicated exclusively to evaluation on real student data, demo stabilization (10+ run-throughs), backup recordings, and slide deck preparation.
8. **Feature Toggle Architecture for Wow Layer:** Every Wow feature (W1–W7) must be encapsulated behind an on/off boolean toggle in a central `features.json` configuration file, ensuring instant deactivation if unstable during demo rehearsals.

---

## 5. Architectural Blueprint

```
                          [ Student Client (React + Vite + Tailwind) ]
                                      │
            ┌─────────────────────────┼────────────────────────┐
            │ (Typed Working)         │ (Photo Upload W1)      │ (Telemetry W3)
            ▼                         ▼                        ▼
      [ Step Input UI ]      [ /photo-to-steps ]         [ Timer / Edits ]
            │                         │                        │
            └─────────────────────────┼────────────────────────┘
                                      │ POST /attempt
                                      ▼
                      [ FastAPI Backend (Python) ]
                                      │
                ┌─────────────────────┴─────────────────────┐
                ▼                                           ▼
       [ SymPy Step Checker ]                     [ Parse Normaliser ]
       • Implicit multiplication                  • ^ to **
       • Solution set equality                    • Unicode minus
                │                                           │
                ▼                                           │
       [ Error Step Index ] ◄───────────────────────────────┘
                │
                ▼
       [ Generate-and-Match Engine ]
       • 6 Deterministic Generators
       • Exact Candidate Equivalence Check
                │
        Match?  ├──► YES ──► Diagnosis { label, evidence, source: "rule", conf: 0.95 }
                │
                └──► NO  ──► [ Constrained LLM Fallback ]
                             • Fixed taxonomy (6 labels + "unknown")
                             • Low temperature, JSON mode
                             • Capped confidence (<= 0.70, "AI estimate")
                                      │
                                      ▼
                            POST /intervention
                                      │
                ┌─────────────────────┴─────────────────────┐
                ▼                                           ▼
    [ C4 Visual Proof (SVG) ]                   [ LLM Explanation ]
    • 6 Handmade interactive SVGs               • 3-4 concise sentences
    • Dynamic parameter binding                 • Student's exact numbers
                                                • en / hi / bn toggle (W5)
                                      │
                                      ▼
                        [ C5 Same-Domain Retry ]
                                      │
                ┌─────────────────────┴─────────────────────┐
                ▼                                           ▼
           [ Passed ]                                  [ Failed ]
                │                                           │ (max 2 loops)
                ▼                                           ▼
   [ C6 Cross-Domain Transfer ★ ]                 [ Re-explain / Flag ]
   • Physics / Geometry / Code
                │
        ┌───────┴───────┐
        ▼               ▼
    [ Passed ]      [ Failed ]
    Transfer        Persists in New
    Verified ✓      Context ✗ (+ Teacher Alert)
                │
                ▼
      [ Learner Profile & History (SQLite) ]
                │
        ┌───────┴───────────────────────────────┐
        ▼                                       ▼
  [ C7 Live Graph ]                    [ W7 Teacher Dashboard ]
  • React Flow Engine                  • Class Heatmap
  • Node states: Grey/Orange/          • Peer Misconception Groups
    Blue/Green/Red Ring                • Transfer Failure Alerts
```

---

## 6. Shared Locked JSON Contract

Every client request, server response, mock file, and test runner must conform to this schema without alteration:

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
  "input_mode": "typed",
  "explanation": null,
  "telemetry": {
    "ms_per_step": [9100, 4200, 3000],
    "deletions": 6,
    "edits": 3
  },
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

### Stage Transitions
1. `diagnosed`: Student submitted initial steps; error localised and diagnosed.
2. `retry_passed`: Student successfully answered the same-domain algebraic retry question.
3. `transfer_passed`: Student successfully solved the cross-domain transfer question (**Transfer Verified ✓**).
4. `transfer_failed`: Student failed the cross-domain transfer question (**Persists in New Context ✗**).

---

## 7. The Six Misconceptions & Taxonomy

| Misconception ID | Wrong Step Pattern | Root Concept ID | Visual Proof Model | Cross-Domain Transfer Domain & Scenario | Verified Transfer Answer |
|---|---|---|---|---|---|
| `PARTIAL_DISTRIBUTION` | $2(x+3) \to 2x+3$ | `DISTRIBUTIVE_LAW` | Rectangle Area Model (width 2, split length $x$ and $3$) | **Geometry:** Rectangle 2 m wide, $(x+3)$ m long — express total area | `2x + 6 m²` |
| `SQUARE_OF_SUM` | $(a+b)^2 \to a^2+b^2$ | `DISTRIBUTIVE_LAW` | Split Geometric Square ($a^2$, $b^2$, two $ab$ rectangles) | **Geometry:** Square garden of side $s$ extended by 2 m on both sides. Additional area added? | `4s + 4` (or $4(s+1)$) |
| `NEGATIVE_DISTRIBUTION` | $-(x+5) \to -x+5$ | `DISTRIBUTIVE_LAW`, `INTEGER_RULES` | Number-Line Directional Reflection | **Physics:** Particle moves $+3\text{ m}$ then $+2\text{ m}$ forward; entire journey reversed. Net displacement? | `-5 m` |
| `TRANSPOSITION` | $x+5=10 \to x=10+5$ | `EQUALITY_BALANCE` | Two-Pan Balance Scale Model | **Programming:** Given `total = price + tax`, write assignment statement calculating `price` | `price = total - tax` |
| `UNLIKE_TERMS` | $3x+5 \to 8x$ | `LIKE_TERMS` | Grouping Physical Attribute Tiles | **Physics:** Can you add $3\text{ m} + 5\text{ s}$? What does $3x + 5$ mean if $x$ has units of meters? | `No; cannot add different units. 3x + 5 stays as is.` |
| `NEG_TIMES_NEG` | $(-3)(-4) \to -12$ | `INTEGER_RULES` | Reverse Rate Pattern on Number Line | **Physics:** Temperature falls $3^\circ\text{C}$ per hour (rate $=-3$). Using $\Delta t = -4\text{ h}$, compare temperature 4 hours ago. | `+12 (12°C warmer)` |

---

## 8. Team Roles & Integration Boundaries

```
┌─────────────────────────────────┐               ┌─────────────────────────────────┐
│ MEMBER 1: Diagnosis Engine      │               │ MEMBER 2: Student Experience    │
│ • SymPy parser & equivalence    │               │ • Steps 1–9 student workflow    │
│ • 6 Transformation generators   │◄─────────────►│ • Step input & error highlight  │
│ • Constrained LLM fallback      │  POST /attempt│ • Same-domain retry loop UI     │
│ • DB schema & profile store     │  POST /retry  │ • Cross-domain transfer UI      │
│ • Evaluation harness script     │  POST /transf │ • W1 photo UI & W3 telemetry    │
└────────────────┬────────────────┘               └────────────────┬────────────────┘
                 │                                                 │
                 │ GET /questions                                  │ Render C4/C7
                 │ POST /intervention                              │ & Timeline W6
                 ▼                                                 ▼
┌─────────────────────────────────┐               ┌─────────────────────────────────┐
│ MEMBER 4: Content, Prompts,     │               │ MEMBER 3: Visuals & Graph       │
│           Teacher Side & Pitch  │               │ • 6 SVG/Framer animations (C4)  │
│ • Hand-verified question bank   │               │ • React Flow live graph (C7)    │
│ • Fallback & explanation prompts│               │ • Multimodal fusion card (W4)   │
│ • W7 teacher dashboard v1       │               │ • Evolution timeline chart (W6) │
│ • 40 seeded student profiles    │               │ • Active/glow/alert node states │
│ • Real eval dataset collection  │               │                                 │
└─────────────────────────────────┘               └─────────────────────────────────┘
```

---

## 9. Known Issues & Open Questions

1. **LLM Provider & Vision Latency:** Evaluating primary cloud vision API vs. local Qwen2-VL / Ollama for W1. Fallback text reasoning can run on fast API endpoints (Gemini 1.5 Flash or Claude 3.5 Haiku) or local Ollama. Cloud endpoint preferred for guaranteed 2-minute demo latency.
2. **Messy Student Handwriting (W1 Risk):** Real handwriting photos often contain irregular layout, crossed-out expressions, or diagonal alignment. *Mitigation:* The vision prompt must enforce line-by-line JSON extraction and return confidence flags; if OCR fails or is ambiguous, the UI prompts the student to confirm/edit the parsed lines in the typed step input interface.
3. **Public Dataset Alignment (Eedi / MAP Data):** Public misconception datasets (e.g. Eedi on NeurIPS) primarily feature multiple-choice questions with student free-text rationale, not step-by-step mathematical working. *Mitigation:* Member 4 will curate 50–100 authentic multi-step algebra student workings from open-source exam papers and partner schools specifically targeted at the 6 core misconceptions.
4. **SymPy Parse Edge Cases:** Students frequently input implicit multiplications (e.g., `2(x+3)` or `3x`), carats for exponentiation (`^` instead of `**`), and unicode minus signs (`−` vs `-`). *Mitigation:* Member 1 pre-processes all input through a robust sanitizer with SymPy transformation tuples before `parse_expr`.

---

## 10. Future Plans & Roadmap (Pitch Slide Only — NOT Built in Hackathon)

- **Fine-Tuned DeBERTa-v3-Small Classifier:** Specialized encoder trained on Eedi/MAP free-text explanations for reasoning classification, benchmarked against TF-IDF + Logistic Regression baseline.
- **Trained Misconception Resolution Model:** Longitudinal predictive model scoring probability of recurrence ($P(\text{relapse})$) vs. genuine cognitive resolution.
- **Adaptive Curriculum Synthesis:** Automatic generation of school-specific remedial problem sequences based on aggregated class misconception heatmaps.
- **Robust End-to-End Handwritten Math OCR:** Custom transformer pipeline tuned for complex math symbols, cancelled terms, and side calculations.
- **Empirical Graph Discovery:** Transitioning from expert-curated prerequisite graphs to data-learned Bayesian knowledge tracing across cross-disciplinary concepts.

---

## 11. How to Update This File

1. **During Stage 1:** As components C1–C7 and core submodules are completed, update the **Status** column in Section 2 from `Not Started` $\to$ `In Progress` $\to$ `Completed`.
2. **At Hour 13 (Core Gate):** Verify each of the 6 checklist items in Section 1. If all 6 pass, change `Core Gate Passed Status:` to **`YES`** and record the commit hash for `core-v1`.
3. **During Stage 2:** Update Wow feature statuses as each branch is tested behind its feature flag and merged.
4. **At Hour 18 (Feature Freeze):** Mark any incomplete Wow items as `Deactivated (Roadmap)` and toggle them to `false` in `features.json`.
5. **No Spec Changes:** Never alter the locked JSON contract, endpoint definitions, or misconception taxonomy without formal agreement from all 4 team members.

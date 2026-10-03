# Member 2 Work Distribution — Student Experience (Frontend Flow)

> **Role:** Student UI/UX Architecture, Workflow Screens & Multimodal Interactions  
> **Primary Technology Stack:** React 18, Vite, Tailwind CSS, Lucide Icons, REST Client  
> **Key Rule:** Complete **Stage 1 (Core)** and pass the **Core Gate** before touching any Stage 2 Wow tasks.

---

## 1. Responsibility Summary

Member 2 owns the interactive student-facing journey of Re:Learn:
- Building the complete 10-step student lifecycle screens (Steps 1–9 UI).
- Dynamic step input interface (one row per line, real-time focus, per-row latency timer).
- Error-step visual highlight and diagnosis screen shell.
- Same-domain retry screen with stateful loop-back logic (max 2 retries).
- Cross-domain transfer test screen with distinct pass ("Transfer verified ✓") and fail ("Persists in new context ✗") outcomes.
- Stage 2 Wow features: Photo upload UI & vision integration (W1), "Explain your thinking" box (W2), client keystroke telemetry & confidence signal (W3), and Hindi/Bengali language toggle (W5).

---

## 2. Features Owned

### Core Features (Stage 1)
- **Student Workflow Screens (Steps 1–9):**
  - Step 1: Question Selection Screen
  - Step 2: Step-by-Step Typed Working Interface
  - Step 3/4: Error-Step Localisation Card (`error_step_index`)
  - Step 5/6: Diagnosis Summary View Shell
  - Step 7: Visual Intervention View (embedding Member 3's SVG proofs)
  - Step 8: Same-Domain Retry Screen & Loop-Back Handler (C5)
  - Step 9: Cross-Domain Transfer Screen (C6 ★ HERO)

### Wow Layer Features (Stage 2)
- **W1 (Priority 1):** Photo Upload UI & `/photo-to-steps` Vision Pipeline Integration
- **W3 (Priority 3):** Step Telemetry Capture & Low/Med/High Confidence Signal Rule
- **W5 (Priority 4):** Hindi / Bengali Localization Toggle on Intervention Screen
- **W2 (Priority 6):** "Explain Your Thinking" Optional Text Input Box

---

## 3. Stage 1 — Core Execution Plan (Hours 0–13)

> **Early Completion Protocol:** If you finish Stage 1 core screens early, **do not start Wow features**. Collaborate with Member 1 on end-to-end API integration, test UI edge cases (empty rows, syntax errors), or help Member 4 verify question rendering.

### Ordered Task List

#### Hours 0–1: Frontend Setup & Shell
1. Initialize Vite project with React and Tailwind CSS in `/frontend`.
2. Configure Tailwind colors matching misconception states (orange glow, blue, green, red ring).
3. Build base layout shell with progress indicator tracking Steps 1–9.
4. Create mock API service (`services/api.js`) returning static mock responses conforming to the locked JSON contract.

#### Hours 1–6: Steps 1–6 Core Screens
1. **Question Picker Screen (Step 1):**
   - Fetch questions from `/questions` (or mock).
   - Allow student to choose from diagnostic questions across the 6 misconceptions.
2. **Step Input Interface (Step 2):**
   - Dynamic list of input rows (one equation per line).
   - "Add Step" button, Enter key triggers new row, Backspace on empty row removes it.
   - Built-in row-level timer recording elapsed milliseconds per step.
3. **Error Localisation & Diagnosis Card (Steps 3–6):**
   - Call `POST /attempt`.
   - Highlight the failing line in soft red with an alert icon using `error_step_index`.
   - Render diagnosis card: Misconception name, root concept badge, and human-readable evidence sentence.
   - Leave dedicated container on the right side for Member 3's Misconception Graph.

#### Hours 6–7: Integration Milestone #1
- Connect frontend to Member 1's live FastAPI server.
- Test `PARTIAL_DISTRIBUTION`: User inputs `2(x+3)=14 \to 2x+3=14 \to 2x=11 \to x=5.5`.
- Verify error step 0 lights up and diagnosis card displays: *"2 was multiplied with x but not with 3"*.

#### Hours 7–13: Intervention, Retry & Transfer Screens
1. **Intervention View (Step 7):**
   - Call `POST /intervention` to fetch tailored explanation.
   - Render Member 3's dynamic SVG proof animation in top pane.
   - Render 3–4 sentence conceptual explanation below animation.
2. **Same-Domain Retry Screen (Step 8 — C5):**
   - Present algebraic variant targeting the same misconception.
   - On submission (`POST /retry`):
     - If correct: Show success banner and "Proceed to Transfer Test" button.
     - If incorrect: Render alternative hint and increment loop counter (Max 2 attempts). After 2 failures, display "Flagged for Teacher Support".
3. **Cross-Domain Transfer Screen (Step 9 — C6 ★ HERO):**
   - Present interdisciplinary question (Physics / Geometry / Code).
   - On submission (`POST /transfer`):
     - **Pass Path:** Display green celebratory badge: **"Transfer verified ✓"** (Conceptual mastery verified across domains).
     - **Fail Path:** Display amber/red card: **"Persists in a new context ✗"**, display bridge explanation connecting the science/geometry problem back to algebra, and set teacher review alert.

---

## 4. Core Gate Verification (Hour 13)

Before proceeding to Stage 2, verify your share of the Core Gate:
- [ ] Complete typed-input workflow executes seamlessly across all 6 misconceptions.
- [ ] Error step highlights correctly for any line index ($0, 1, 2\dots$).
- [ ] Same-domain retry loop-back correctly caps at 2 attempts before flagging.
- [ ] Transfer pass and fail paths render distinct visual states with bridge explanations.
- [ ] UI never crashes on network latency or invalid math input.
- [ ] Code committed to `main` and tagged `core-v1`.

---

## 5. Stage 2 — Wow Layer Execution Plan (Hours 13–18)

> **MANDATORY NOTICE:** Do not start until the Core Gate is passed and tagged `core-v1`.  
> Build each feature on an isolated branch (`feat/w1`, `feat/w3`, etc.) gated behind `features.json`.

### Ordered Task List

1. **W1 — Photo Upload & Vision Integration (Priority 1 | Hours 13–15):**
   - Add "Upload Photo of Working" button on Step 2 screen.
   - Capture file / camera input $\to$ send to `POST /photo-to-steps`.
   - Populate extracted lines into editable step input rows so the student can verify/edit before submitting `/attempt`.
   - Test toggle: `features.W1 = true/false`.
2. **W3 — Confidence Signal Telemetry (Priority 3 | Hours 15–16.5):**
   - Capture client metrics: `ms_per_step[]`, deletion count (Backspace/Delete events), and total text modifications.
   - Implement client classification rule:
     - `high`: Fast step completion ($< 5\text{ s}$), zero/low deletions.
     - `medium`: Normal pace ($5\text{–}12\text{ s}$), moderate edits.
     - `low`: Long latency ($> 12\text{ s}$), high deletions, or repeated rewrites.
   - Pass `telemetry` object and `confidence_signal` in `/attempt` payload.
3. **W5 — Hindi / Bengali Language Toggle (Priority 4 | Hours 16.5–17.5):**
   - Add language pill switcher (`English | हिन्दी | বাংলা`) on the Step 7 intervention card.
   - Re-fetch `/intervention` with `language: "hi"` or `language: "bn"` and re-render explanation text.
4. **W2 — "Explain Your Thinking" Box (Priority 6 | Hours 17.5–18):**
   - Add optional text area: *"Explain your thinking in one sentence (optional)..."*.
   - Include string in `explanation` field of `/attempt`.

---

## 6. Contracts & Interfaces to Follow

### 6.1 Locked JSON Contract (Frontend Submission)
```json
{
  "attempt_id": "uuid",
  "student_id": "s_07",
  "question_id": "PD_02",
  "question": "Solve 2(x+3)=14",
  "steps": ["2x+3=14", "2x=11", "x=5.5"],
  "input_mode": "typed",
  "explanation": "I multiplied 2 by x and added 3",
  "telemetry": {
    "ms_per_step": [8500, 4100, 2900],
    "deletions": 4,
    "edits": 2
  },
  "error_step_index": 0,
  "diagnosis": {
    "label": "PARTIAL_DISTRIBUTION",
    "source": "rule",
    "confidence": 0.95,
    "evidence": "2 was multiplied with x but not with 3",
    "root_concept": "DISTRIBUTIVE_LAW"
  },
  "confidence_signal": "medium",
  "language": "en",
  "stage": "diagnosed"
}
```

### 6.2 Backend Endpoints Consumed
- `GET /questions` $\to$ Populate question picker.
- `POST /attempt` $\to$ Submit working, receive diagnosis.
- `POST /intervention` $\to$ Fetch animation ID & explanation.
- `POST /retry` $\to$ Submit retry answer.
- `POST /transfer` $\to$ Submit cross-domain transfer answer.
- `POST /photo-to-steps` $\to$ Submit image file, receive extracted steps.

---

## 7. Inputs, Dependencies & Deliverables

| Dependency From | Deliverable Needed | Needed By | What to Use Until Available |
|---|---|---|---|
| **Member 1** | Working `/attempt` endpoint | Hour 6 | Use mock service returning static JSON |
| **Member 3** | SVG Animation Components (C4) | Hour 6 | Use placeholder container with animation ID |
| **Member 3** | React Flow Graph Component (C7) | Hour 6 | Use static diagram placeholder |
| **Member 4** | Question Bank JSON & Interventions | Hour 3 | Use static test question array |

### Member 2 Deliverables
1. Polished Single Page Application running on `http://localhost:5173`.
2. Responsive Step Input component with row-level timers.
3. Diagnostic summary screen with dynamic error highlighting.
4. Stateful Retry loop-back component (max 2 retries).
5. Cross-domain transfer test view showcasing the "Hero" pass/fail moments.
6. Optional Wow enhancements: Photo upload (W1), Telemetry (W3), Multilingual (W5), and Explain box (W2).

---

## 8. Definition of Done

### Stage 1 (Core Gate Contribution)
- Steps 1–9 flow is fully interactive and bug-free for all 6 misconceptions with typed input.
- Error line highlight accurately matches `error_step_index`.
- Retry loop correctly allows up to 2 attempts before escalating to teacher flag.
- Cross-domain transfer view clearly differentiates "Transfer verified ✓" from "Persists in new context ✗".
- Tested 3 times end-to-end without UI freeze.

### Stage 2 (Wow Layer Contribution)
- W1 photo upload extracts text and populates step input rows reliably.
- W3 calculates low/med/high confidence signals from user keystrokes.
- W5 switches explanation between English, Hindi, and Bengali smoothly.
- Features are controlled by `features.json` toggles and merged without regression.

---

## 9. Implementation Notes & Potential Pitfalls

- **Dynamic Input Rows:** Ensure autofocus advances to the newly created row when Enter is pressed.
- **Math Symbol Input:** Students may paste unicode characters or write `2(x+3)` without multiplication symbols. Do not restrict keyboard input on the frontend; let Member 1's backend normalizer handle math sanitization.
- **Safe Defaults:** Always ensure Wow fields have valid defaults (`input_mode: "typed"`, `language: "en"`, `explanation: null`, `telemetry: null`) so core endpoints are never broken.
- **Hero Moment Emphasis:** Ensure the cross-domain transfer result (Step 9) has distinct, high-impact styling. This is the primary pitch differentiator.

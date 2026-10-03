# Member 2: Student Experience (Frontend Flow) — Work Specification

> **Module Owner:** Member 2 (P2)  
> **Core Focus:** Step Input Interface, Error Highlighting, Remediation & Transfer User Flows, Vision OCR Pipeline, Telemetry & Multi-Language Support  
> **Key Mantra:** *"Keep every screen responsive and functional using mock JSON until integration. The student workflow must feel fluid, intuitive, and wow the user."*

---

## 1. Responsibility Summary

Member 2 leads the end-to-end student interactive experience in Re:Learn. You are responsible for:
1. Building the primary line-by-line algebraic Step Input Screen with dynamic row addition, per-row timers, and formatting helpers.
2. Rendering the Error-Step Highlighting UI that cleanly pinpoints where the student's solution broke down.
3. Structuring the Diagnosis Screen shell that displays evidence, root concepts, and confidence indicators.
4. Implementing the interactive Intervention, Same-Domain Retry (Feature C5), and Cross-Domain Transfer (Feature C6) screens, including loop-back logic (max 2 retry loops).
5. Building the Photo Upload UI and integrating the backend `/photo-to-steps` multimodal vision pipeline (Feature W1).
6. Implementing the "Explain Your Thinking" input box (Feature W2).
7. Building client-side Confidence Telemetry tracking (Feature W3) to categorize confidence (`low`, `medium`, `high`) using non-invasive behavioral heuristics.
8. Implementing the Hindi and Bengali Language Toggle (Feature W5) on the intervention screen.

---

## 2. Features & Components Owned

| Feature ID | Feature Name | Description | Status / Layer |
|---|---|---|---|
| **C1 / C2 UI** | Step Input & Error Highlight | Dynamic step entry rows, "Add Step" button, inline error step indicator. | Core (Hour 1–6) |
| **C5** | Same-Domain Retry Flow | Presents retry problem, evaluates attempt, handles failure loop-backs (max 2). | Core (Hour 7–13) |
| **C6 UI** | Cross-Domain Transfer Screen | UI for Physics, Geometry, or Code transfer questions; displays outcome banner. | Core (Hour 7–13) |
| **W1** | Photo Upload & Vision Pipeline | Image upload/camera drag-and-drop + `/photo-to-steps` vision integration. | Wow (Hour 13–18) |
| **W2** | "Explain Your Thinking" Box | Optional explanation textarea passed to backend diagnosis payload. | Wow (Hour 13–18) |
| **W3** | Confidence Telemetry Signal | Algorithmic classifier for time-per-step, backspaces, and edits $\to$ low/med/high. | Wow (Hour 13–18) |
| **W5** | Multi-Language Toggle | Language switch (EN / HI / BN) triggering localized explanation fetch. | Wow (Hour 13–18) |

---

## 3. Ordered Task Breakdown & Timeline

### Hours 0 – 1: Foundation & Contracts
- Confirm the Shared JSON Contract in `relearn/memory.md`.
- Initialize Vite + React project with Tailwind CSS. Set up base layout, typography, and theme tokens.
- Create local mock JSON fixtures (`mockAttemptResult.json`, `mockQuestions.json`).

### Hours 1 – 6: Parallel Core Build on Mocks
- **Task 1.1: Question Selector & Workspace Shell:**
  - Build header with problem statement, question selector, and progress stepper.
- **Task 1.2: Step Input Component:**
  - Create dynamic equation editor where each algebraic step has its own input row.
  - Provide "Add Step" button and keyboard shortcut (`Enter` creates new row).
  - Track millisecond timestamp for each row independently.
  - Implement basic input sanitization feedback (e.g. alert if `=` is missing).
- **Task 1.3: Error Highlight & Diagnosis Shell:**
  - Build component to render submitted steps with the exact error step highlighted in red/amber with a subtle shake/glow animation.
  - Render diagnosis banner: misconception label, human-readable evidence sentence, root concept badge, and confidence score.
- **Task 1.4: Screen Transitions:**
  - Establish state machine: `INPUT` $\to$ `DIAGNOSIS` $\to$ `INTERVENTION` $\to$ `RETRY` $\to$ `TRANSFER` $\to$ `SUMMARY`.
  - Ensure all transitions work smoothly using mock JSON data.

### Hours 6 – 7: Integration #1 — PARTIAL_DISTRIBUTION End-to-End
- Wire `StepInput` form to FastAPI `POST /attempt`.
- Submit `2(x+3)=14` $\to$ `2x+3=14` $\to$ `2x=11` $\to$ `x=5.5`.
- Verify response highlights Line 0, mounts Member 3's `area_model` visual proof, and displays Member 4's intervention explanation text.

### Hours 7 – 13: Core Completion (Retry & Transfer Workflows)
- **Task 3.1: Same-Domain Retry Screen (Feature C5):**
  - Fetch retry question for diagnosed misconception.
  - On submit, call `POST /retry`. If correct $\to$ trigger celebration banner (`"Resolved in algebra"`), update graph state.
  - If incorrect $\to$ return to intervention screen with alternative visual angle (maximum 2 loops before moving to transfer with teacher flag).
- **Task 3.2: Cross-Domain Transfer Screen (Feature C6):**
  - Render transfer question from physics, geometry, or code with rich visual framing.
  - On submit, call `POST /transfer`.
  - If correct $\to$ render `"Transfer verified ✓"` (emerald badge).
  - If incorrect $\to$ render `"Persists in a new context ✗"` (crimson badge), show bridge explanation linking algebra to target domain, and trigger teacher alert flag.

### Hours 13 – 18: Wow Layer Implementation & Sleep Rotation
- **13:00 – 15:30 (Active Build Window):**
  - **Task 4.1: Photo Upload UI & Vision Pipeline (Feature W1):**
    - Build image dropzone / file upload / camera capture modal.
    - Implement `POST /photo-to-steps`: sends base64/form image to vision model, extracts JSON array of equations, and auto-populates the Step Input rows.
  - **Task 4.2: Confidence Telemetry Signal (Feature W3):**
    - Implement telemetry collector measuring time spent per line (`ms_per_step`), count of backspaces/deletions, and row edit revisions.
    - Apply classification heuristic:
      - `high`: Fast completion ($< 5\text{ s/step}$), $\le 1$ deletion, $0$ edits.
      - `low`: $> 12\text{ s/step}$, $> 5$ deletions, or $> 2$ line rewrites.
      - `medium`: Everything in between.
    - Display badge (`Low Confidence`, `Medium Confidence`, `High Confidence`) on diagnosis card.
  - **Task 4.3: "Explain Your Thinking" Box (Feature W2):**
    - Optional textarea under step input; passed into `explanation` field of `/attempt`.
- **15:30 – 18:00:** Scheduled rest / sleep (~2.5 hours).
- **Post-Rest (Pre-Hour 18):**
  - **Task 4.4: Hindi / Bengali Language Toggle (Feature W5):**
    - Add pill toggle buttons (`EN`, `HI`, `BN`) in the intervention view.
    - Trigger re-fetch to `/intervention` with `language: "hi"` or `"bn"`.

### Hours 18 – 20: Feature Freeze & UI Polish
- Zero new feature work.
- Squash UI bugs: fix step row jumping, improve focus management, ensure responsive mobile/tablet layout.
- Validate that all 6 misconceptions flow cleanly from Step Input to Transfer Test.

### Hours 20 – 24: Demo Hardening & Rehearsals
- Verify demo flow runs flawlessly against pre-cached endpoints.
- Rehearse the 2-minute demo sequence (Photo upload of $2(x+3)=14$, error highlight, Bengali toggle switch, retry success, transfer failure).

---

## 4. Dependencies & Interface Contracts

### Inputs Needed from Teammates
| Teammate | What You Need | By When | What to Mock Until Received |
|---|---|---|---|
| **Member 1** | Working `POST /attempt` endpoint | Hour 6 | Use `mockAttemptResult.json` returning line 0 error. |
| **Member 1** | Working `POST /retry` and `POST /transfer` endpoints | Hour 9 | Use hardcoded boolean pass/fail responses. |
| **Member 3** | Visual proof animation components (SVG/Framer) | Hour 6 / 11 | Render placeholder SVG with animation title. |
| **Member 4** | Question bank JSON (`questions.json`) | Hour 2 | Use 3 hardcoded questions in local state. |
| **Member 4** | Bridge explanations for transfer failures | Hour 10 | Use static fallback bridge sentence. |

### Outputs You Deliver to Teammates
| Teammate | Deliverable | By When |
|---|---|---|
| **Member 1** | Structured `/attempt` payload matching Shared JSON Contract | Hour 6 |
| **Member 1** | Base64/multipart image for `/photo-to-steps` endpoint | Hour 14 |
| **Member 3** | Diagnosis screen container for mounting React Flow and animations | Hour 5 |
| **Member 4** | Clean user flow for live demo rehearsal | Hour 13 / 20 |

---

## 5. API & JSON Contracts to Consume & Emit

### 5.1 Outgoing `/attempt` Payload
```json
{
  "student_id": "s_07",
  "question_id": "PD_02",
  "question": "Solve 2(x+3)=14",
  "steps": [
    "2x+3=14",
    "2x=11",
    "x=5.5"
  ],
  "input_mode": "typed",
  "explanation": "I multiplied 2 with the bracket",
  "telemetry": {
    "ms_per_step": [8500, 3900, 2800],
    "deletions": 4,
    "edits": 2
  },
  "confidence_signal": "low",
  "language": "en"
}
```

### 5.2 Outgoing `/photo-to-steps` Payload & Expected Response
- **Request (`POST`):**
  ```json
  {
    "image_base64": "data:image/jpeg;base64,..."
  }
  ```
- **Response:**
  ```json
  {
    "steps": [
      "2(x+3)=14",
      "2x+3=14",
      "2x=11",
      "x=5.5"
    ]
  }
  ```

---

## 6. Definition of Done

### Core Definition of Done (Hour 13 Checkpoint — Non-Negotiable)
- [ ] Student can select any of the 6 diagnostic questions and type line-by-line solutions.
- [ ] Step submission triggers backend `/attempt` and visually highlights the exact erroneous line.
- [ ] Diagnosis banner clearly shows misconception name, evidence sentence, and root concept.
- [ ] Intervention screen renders the matching visual proof animation with explanation.
- [ ] Retry flow presents a new question; passing advances to transfer test; failing loops back (max 2).
- [ ] Transfer test presents cross-domain question and correctly displays "Transfer verified ✓" or "Persists in a new context ✗".

### Wow Definition of Done (Hour 18 Hard Freeze)
- [ ] W1: User can upload a notebook photo and have steps automatically populated in input rows.
- [ ] W2: Optional explanation text box submits with attempt.
- [ ] W3: Telemetry badge (`low` / `medium` / `high`) renders on diagnosis card.
- [ ] W5: Language toggle seamlessly flips intervention text between English, Hindi, and Bengali.

---

## 7. Implementation Pitfalls & UI Guidelines

1. **Never Block on Backend:** Build every UI state against local JSON mocks first. If the backend server restarts or breaks, your UI should remain completely functional in mock mode.
2. **Per-Row Timer Integrity:** Ensure timers start when the row gains focus and pause appropriately. Do not let background window blur inflate elapsed time artificially.
3. **Parse Failure Handling:** If backend returns `UnparseableLineError` for step $i$, display an inline warning directly under row $i$ (e.g., *"We couldn't read line 2. Did you forget an '=' or write an incomplete term?"*).
4. **Clean Demo Reset:** Provide a single-click "Reset Demo" button in the dev tools/header that clears local state, restores default sample questions, and resets student history.

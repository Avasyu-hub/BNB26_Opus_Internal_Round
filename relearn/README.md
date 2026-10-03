# Re:Learn — Cross-Domain Misconception Graph Tutor for Algebra

> **One-line pitch:** Fixing a wrong answer isn't the same as fixing the misconception. Re:Learn finds the exact step where a student's algebra breaks, diagnoses *why*, teaches it visually, and then checks whether the understanding transfers to physics, geometry and code.

---

## 1. Problem & Positioning

### The Problem
Most practice apps mark an answer red and show the correct solution. The student copies the fix, gets the next identical question right, and the underlying misconception survives. It reappears later — often in a different subject (physics formulas, geometry proofs, or programming variables), where nobody connects it back to foundational algebra.

### Positioning & Defensibility
Research systems and commercial products (such as Carnegie Learning's Cognitive Tutor, ASSISTments, and Eedi) already detect misconceptions. Re:Learn's contribution is narrower, novel, and defensible:

| Dimension | Existing Practice Systems | Re:Learn |
|---|---|---|
| **Error Detection** | Checks final answer | Pinpoints the exact step where algebraic equivalence breaks |
| **Diagnosis** | Labels error generically or opaquely | Diagnoses root cause with step-level evidence the student can read |
| **Remediation & Testing** | Re-tests with a similar algebra question | Re-tests in algebra, then verifies transfer in **physics, geometry, or code** |
| **Teacher Insights** | Counts wrong answers per class | Visualizes misconception graphs, root concept chains, and cross-domain transfer failures |

> **Judge Positioning Statement:** *"Existing systems detect a misconception. We verify whether the fix actually transfers."* Re:Learn does not claim patentability; it is a novel, high-impact combination backed by real evaluation accuracy.

- **Target Audience:** Students in Classes 7–10 (CBSE/ICSE, ages 12–16) and their teachers (who manage 40–60 students per class).
- **Execution Context:** Built during a 24-hour hackathon by a 4-person team, fully vibe-coded using AI coding agents against locked contracts.

---

## 2. Key Features

### Core Loop (Must Work Perfectly — Hour 0 to 13)
- **C1: Step-Level Error Localisation:** SymPy checks each step against the preceding step by evaluating solution set equivalence, highlighting the exact step where equivalence breaks.
- **C2: Generate-and-Match Diagnosis:** Generates candidate wrong steps using 6 domain-specific misconception transformations on the previous valid step. A symbolic match yields an explainable diagnosis (source: `rule`, confidence: 0.95).
- **C3: Constrained LLM Fallback:** If no rule matches, a constrained LLM chooses strictly from the 6 fixed labels or returns `"unknown"`. LLM confidence is capped at 0.70 and labelled `"AI estimate"`.
- **C4: Visual Proofs:** 6 deterministic, interactive SVG/canvas animations (area model, square model, number line, balance scale, tile grouping, sign pattern) paired with an LLM-generated explanation tailored to the student's own numbers.
- **C5: Same-Domain Retry:** Presents a fresh algebra problem targeting the same misconception. Success advances the student to `"resolved in algebra"`; failure triggers an alternative visual/verbal explanation (maximum 2 loops).
- **C6: Cross-Domain Transfer Test (Hero Feature ★):** Tests whether the underlying root concept transfers to physics, geometry, or programming. Results in `"Transfer verified ✓"` or `"Persists in a new context ✗"` (triggering a bridge lesson and teacher alert).
- **C7: Live Misconception Graph:** Interactive React Flow graph. Nodes and their root concepts illuminate dynamically: Inactive (grey), Detected (orange glow), Resolved in algebra (blue), Transfer verified (green), and Persists in new context (red ring).

### Wow Layer (Lite Versions — Hour 13 to 18)
- **W1: Photo of Handwritten Work:** Vision model extracts line-by-line steps from a notebook photo into a clean JSON array feeding the core pipeline.
- **W2: "Explain Your Thinking" Box:** Optional student self-explanation field passed as qualitative context to the fallback LLM.
- **W3: Confidence Telemetry:** Passively measures time per step, keystroke deletions, and edit counts to categorize student confidence (`low`, `medium`, `high`) without invasive audio/video tracking.
- **W4: Multimodal Fusion Card:** Single consolidated diagnostic card presenting student steps, original photo thumbnail, explanation text, and confidence badge.
- **W5: Hindi / Bengali Language Toggle:** On-demand bilingual explanation generation for the intervention screen.
- **W6: Knowledge Evolution Timeline:** Per-student longitudinal chart tracking misconceptions appearing, resolving, and transferring over time.
- **W7: Teacher Dashboard & Peer Groups:** Class-wide heatmap seeded with 40 realistic student profiles (explicitly marked "simulated"), automatic peer-group recommendations, and transfer-failure alerts.

*Wow Layer Build Priority:* `W1 → W7 → W3 → W5 → W6 → W2 → W4`

### Roadmap (Pitch Slide Only — Not Built in Hackathon)
- Fine-tuned DeBERTa-v3-small classifier trained on Eedi/MAP open datasets for free-text reasoning, benchmarked against TF-IDF + Logistic Regression.
- Trained multi-stage resolution prediction model (`resolved` vs `persistent` vs `uncertain`).
- Automated, adaptive curriculum sequencing derived from class-level misconception co-occurrence clusters.
- End-to-end offline OCR model optimized for unstructured notebook pages; expansion into quadratics, rational expressions, and coordinate geometry.
- Data-driven, dynamically inferred misconception graphs learned from large student response corpora.

---

## 3. High-Level Architecture

```text
Student Input (Typed steps | Photo -> Vision Model | Optional Explanation | Telemetry)
       │
       ▼
 FastAPI /attempt
       │
       ▼
 SymPy Step Checker ──────────────────────────► error_step_index
       │
       ▼
 Generate-and-Match Engine
   ├── Rule Match ────────────────────────────► diagnosis {label, evidence, root_concept, source: "rule", confidence: 0.95}
   └── No Match ──► Constrained LLM Fallback ──► diagnosis {label: fixed_list | "unknown", source: "llm", confidence: <=0.7}
       │
       ▼
 FastAPI /intervention ───────────────────────► animation_id + LLM Explanation (EN / HI / BN)
       │
       ▼
 FastAPI /retry & /transfer ──────────────────► stage: diagnosed | retry_passed | transfer_passed | transfer_failed
       │
       ▼
 SQLite Learner Profile ──────────────────────► React Flow Graph (C7), Timeline (W6), Teacher Heatmap & Peer Groups (W7)
```

---

## 4. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | Fast developer experience, single SPA for both student and teacher portals |
| **Styling & Design** | Tailwind CSS | Sleek dark/light theme, accessible educational UI, responsive layouts |
| **Interactive Graph** | React Flow | Node-edge graph rendering with dynamic reactive state styling and glowing borders |
| **Visual Proofs** | SVG + Framer Motion (or D3) | Deterministic, smooth, high-fidelity mathematical animations |
| **Analytics Charts** | Recharts | Class heatmap matrix and student longitudinal progress timelines |
| **Backend API** | FastAPI (Python 3.10+) | High-performance asynchronous API, native typing, seamless SymPy integration |
| **Maths Engine** | SymPy | Parsing expressions, checking solution set equivalence, running 6 generator rules |
| **AI / Multimodal** | Unified LLM API with Vision (or local Qwen via Ollama) | Vision OCR (W1), constrained fallback (C3), tailored intervention (C4), language toggle (W5) |
| **Database** | SQLite3 | Zero-configuration single-file relational persistence for attempts and learner profiles |
| **Version Control** | Git + GitHub | Strict branch hygiene, continuous integration against shared contract |

---

## 5. Repository Structure

```text
relearn/
├── README.md                           # Main project documentation, setup, and guidelines
├── memory.md                           # Persistent project memory, decisions, contracts, status
├── PRD.md                              # Complete Product Requirements Document
├── technology.md                       # Comprehensive tech stack documentation and configurations
├── phases.md                           # 24-hour timeline, phased deliverables, and dependency matrix
├── member-1-diagnosis-engine/          # Member 1 (P1): Backend Brain, SymPy, Generators, Core APIs
│   └── work.md                         # Detailed work distribution, contracts, and tasks for P1
├── member-2-student-experience/        # Member 2 (P2): Student Frontend, Input, Vision, Telemetry
│   └── work.md                         # Detailed work distribution, contracts, and tasks for P2
├── member-3-visuals/                   # Member 3 (P3): Animations, React Flow Graph, Timeline, Fusion Card
│   └── work.md                         # Detailed work distribution, contracts, and tasks for P3
└── member-4-content-teacher-pitch/     # Member 4 (P4): Questions, Prompts, Teacher Dashboard, Seed Data, Pitch
    └── work.md                         # Detailed work distribution, contracts, and tasks for P4
```

---

## 6. Team Roles & Resolved Ownership

| Member | Role | Primary Responsibilities |
|---|---|---|
| **Member 1 (P1)** | **Diagnosis Engine** *(Backend Brain)* | SymPy parsing/normalisation, step equivalence checker, 6 misconception generators, matcher, constrained LLM fallback, `/attempt`, `/retry`, `/transfer`, `/questions` route, SQLite schema & writes, evaluation script. |
| **Member 2 (P2)** | **Student Experience** *(Frontend Flow)* | Step input interface, error-step highlight, diagnosis shell, intervention/retry/transfer screen flow + loop-backs, W1 photo upload UI **and** `/photo-to-steps` vision integration, W2 explanation input, W3 telemetry capture + classification, W5 language toggle. |
| **Member 3 (P3)** | **Visuals & Graphs** *(The Wow)* | 6 interactive visual proof animations (area model and square model first), React Flow live misconception graph + node glowing states, W4 multimodal fusion card, W6 knowledge evolution timeline, `/student/{id}/history` consumption. |
| **Member 4 (P4)** | **Content, Prompts, Teacher & Pitch** *(Product Lead)* | Question bank (diagnostic, retry, transfer) with hand-verified answer keys; intervention and fallback prompt engineering; `/intervention` route; W7 teacher dashboard, `/class/summary` aggregation, peer grouping, transfer alerts; 40 seeded students; collecting 50–100 real evaluation solutions; pitch slides, demo script execution. |

---

## 7. Setup & Development Instructions

*(Note: Implementation planned for Phase 1 onwards. All instructions reflect standard project setup.)*

### Backend Setup (FastAPI + SymPy)
```bash
# 1. Navigate to backend directory (when created in Phase 1)
cd backend

# 2. Initialize Python virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Unix/macOS:
source venv/bin/activate

# 3. Install core dependencies
pip install fastapi uvicorn sympy pydantic httpx python-dotenv

# 4. Configure environment variables
# Create .env file with:
# LLM_API_KEY="your-api-key-here"
# LLM_MODEL="gemini-1.5-flash" # or gpt-4o / claude-3-5-sonnet
# DB_PATH="relearn.db"

# 5. Start development server
uvicorn main:app --reload --port 8000
```

### Frontend Setup (React + Vite + Tailwind)
```bash
# 1. Navigate to frontend directory (when created in Phase 1)
cd frontend

# 2. Install dependencies
npm install

# 3. Ensure required UI packages are present:
npm install @xyflow/react framer-motion recharts lucide-react clsx tailwind-merge

# 4. Start Vite development server
npm run dev -- --port 5173
```

---

## 8. Team Rules & Hackathon Operating Principles

1. **Core Loop Before Any Wow Feature:** The Hour 13 checkpoint (all 6 misconceptions working end-to-end in core flow) is non-negotiable. No wow feature may be built before this passes.
2. **Locked Contract Discipline:** Every AI coding agent session must have the Shared JSON Contract pasted in with the prompt instruction: `"Treat this contract as immutable. Do not alter keys or types."`
3. **Strict Modularity:** One person per module. Work strictly within assigned boundaries. Never modify another member's files without direct coordination.
4. **Continuous Integration on Mocks:** Use mocked JSON from Minute 1. Do not block on another member's backend or UI.
5. **Hard Feature Freeze at Hour 18:** Absolutely zero new features after Hour 18, regardless of how simple an AI prompt makes it seem. Hours 18–24 belong strictly to evaluation, demo polishing, backup recording, and pitch rehearsals.
6. **10+ Demo Run-Throughs:** Complete at least 10 end-to-end run-throughs of the live demo script before pitching. Record a screen backup video in Hour 21 to guard against connectivity or API failures.

# Re:Learn — Cross-Domain Misconception Graph Tutor for Algebra

> **One-Line Pitch:** Fixing a wrong answer isn't the same as fixing the misconception. Re:Learn finds the exact step where a student's algebra breaks, diagnoses *why*, teaches it visually, and then checks whether the understanding transfers to physics, geometry, and code.

---

## 1. Project Overview & Problem

Most ed-tech practice applications simply evaluate final answers: when a student answers incorrectly, the platform displays the correct algorithmic steps. The student copies the mechanical fix, passes the immediate identical drill, and the underlying flawed mental model survives — inevitably resurfacing when the student encounters isomorphic structures in physics formulas, coordinate geometry, or software engineering where nobody connects the failure back to algebra.

**Re:Learn** is an AI-powered diagnostic tutor designed for CBSE/ICSE Classes 7–10 (ages 12–16) that combines:
1. **Deterministic Step-Level Error Localisation:** Evaluates mathematical equivalence line-by-line using SymPy.
2. **Explainable Symbolic Diagnosis:** Matches student error steps against 6 deterministic transformation rules with mathematical evidence.
3. **Constrained AI Fallback:** Constrains LLM diagnosis to a rigid 6-label taxonomy with a confidence ceiling of $\le 0.70$.
4. **Visual Foundational Proofs:** Explains underlying mathematical laws with 6 interactive SVG geometric and physical models.
5. **Cross-Domain Transfer Verification (Hero Feature):** Tests the repaired concept across Physics, Geometry, and Programming contexts.

---

## 2. Non-Negotiable Build Rule: Core First, Then Wow

```
┌─────────────────────────────────────────────────────────────┐
│ STAGE 1: CORE (Hours 0–13)                                  │
│ Complete features C1–C7 only with typed input.              │
│ Zero wow code. Full 10-step student lifecycle works.       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ CORE GATE CHECKPOINT (Hour 13)                              │
│ • All 6 misconceptions run end-to-end with typed input.     │
│ • Retry loop (max 2) & transfer pass/fail paths verified.   │
│ • Misconception graph reflects correct node states.         │
│ • SQLite persistence records attempts and learner stages.   │
│ • 3 consecutive stability runs with zero failures.          │
│ • Git commit tagged "core-v1" (safe rollback point).        │
│                                                             │
│ *IF GATE FAILS: CONTINUE CORE, DROP WOW ITEMS FROM BOTTOM*  │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Gate Passed)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ STAGE 2: WOW LAYER (Hours 13–18)                            │
│ Build in priority order: W1 → W7 → W3 → W5 → W6 → W2 → W4   │
│ One branch per feature, behind features.json toggle.        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ FEATURE FREEZE (Hour 18)                                    │
│ Evaluation on 50–100 real student traces, 10+ demo runs.    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Key Feature Set

### Stage 1: Core Features (Mandatory by Hour 13)
| # | Feature | Stage | Description |
|---|---|---|---|
| **C1** | Step-level error localisation | **Core** | SymPy parses steps and compares solution sets ($k$ vs $k-1$), identifying the first invalid step. |
| **C2** | Generate-and-match diagnosis | **Core** | Deterministic candidate generators reproduce the student's wrong step with exact evidence (`source: "rule"`, `conf: 0.95`). |
| **C3** | Constrained LLM fallback | **Core** | When no rule matches, LLM classifies against fixed 6 labels or `"unknown"` with confidence capped at 0.70 ("AI estimate"). |
| **C4** | Visual proofs | **Core** | Six hand-crafted SVG animations; LLM writes explanatory text using the student's own values. |
| **C5** | Same-domain retry | **Core** | Fresh algebraic question targeting the same misconception (max 2 retries before teacher flag). |
| **C6** | Cross-domain transfer test (★ HERO) | **Core** | Tests the repaired concept in Physics, Geometry, or Code. Yields "Transfer verified ✓" or "Persists in new context ✗". |
| **C7** | Live misconception graph | **Core** | React Flow graph highlighting active misconception, root concept, and stage-driven node states. |

### Stage 2: Wow Layer Features (Hours 13–18, Strict Priority Order)
| # | Feature | Stage | Priority | Description |
|---|---|---|---|---|
| **W1** | Photo of handwritten work | **Wow** | P1 | Vision LLM extracts steps array from image $\to$ populates step input rows for confirmation. |
| **W7** | Teacher dashboard & peer groups | **Wow** | P2 | Class heatmap across 40 seeded students ("simulated"), peer remediation clusters, transfer alerts. |
| **W3** | Confidence signal capture | **Wow** | P3 | Keystroke latency (`ms_per_step`), deletions, and edits mapped to low/med/high (NO webcam/audio). |
| **W5** | Hindi / Bengali toggle | **Wow** | P4 | Language switcher on intervention card re-generating pedagogical explanations in `hi` or `bn`. |
| **W6** | Knowledge evolution timeline | **Wow** | P5 | Recharts longitudinal graph tracking student concept trajectory over time. |
| **W2** | "Explain your thinking" box | **Wow** | P6 | Optional sentence input passed to LLM fallback as supplemental reasoning evidence. |
| **W4** | Multimodal fusion card | **Wow** | P7 | Unified diagnostic card displaying steps, photo, thinking quote, confidence, and diagnosis. |

---

## 4. High-Level Architecture

```
Student Working (Typed | Photo W1 | Telemetry W3)
  │
  ▼
FastAPI Backend (Port 8000)
  │
  ├──► SymPy Step Checker ────────────► error_step_index
  │
  ├──► Generate-and-Match Engine ────► Diagnosis (source: "rule", conf: 0.95)
  │     └─► (No match) ──────────────► Constrained LLM Fallback (conf <= 0.70)
  │
  ├──► /intervention ────────────────► C4 SVG Animation ID + Dynamic Explanation
  │
  ├──► /retry & /transfer ───────────► Evaluates answers & updates Stage
  │
  └──► SQLite (relearn.db) ──────────► Learner Profile & History Records
        │
        ├──► C7 Live Misconception Graph (React Flow)
        ├──► W6 Evolution Timeline (Recharts)
        └──► W7 Teacher Dashboard (Class Heatmap & Peer Groups)
```

---

## 5. Technology Stack

| Layer | Technologies Selected | Notes |
|---|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS | Single Page Application on `http://localhost:5173` |
| **Graph** | React Flow 11 | 6 Misconceptions + 4 Root Concepts with 5 visual states |
| **Animations** | SVG + Framer Motion (or D3) | 6 Deterministic visual mathematical models |
| **Charts** | Recharts 2 | Student timeline and teacher analytics |
| **Backend** | FastAPI, Uvicorn, Python 3.10+ | Asynchronous REST API on `http://localhost:8000` |
| **Maths Engine**| SymPy 1.12+ | Solution-set comparison, implicit multiplication, sanitizer |
| **AI / Vision** | Unified Multimodal LLM API | JSON-mode fallback reasoning, handwriting OCR, explanations |
| **Database** | SQLite 3 (`relearn.db`) | Local serverless relational storage |
| **Version Control**| Git | Branch per Wow feature; rollback tag `core-v1` |

---

## 6. Project Structure

```text
relearn/
├── README.md                           # Master project documentation & architectural guide
├── memory.md                           # Persistent project state, locked decisions & status table
├── PRD.md                              # Complete Product Requirements Document
├── technology.md                       # Comprehensive technology stack & configuration guide
├── phases.md                           # 24-hour phased execution timeline & dependency matrix
├── member-1-diagnosis-engine/
│   └── work.md                         # Detailed work distribution & contract specs for Member 1
├── member-2-student-experience/
│   └── work.md                         # Detailed work distribution & contract specs for Member 2
├── member-3-visuals/
│   └── work.md                         # Detailed work distribution & contract specs for Member 3
└── member-4-content-teacher-pitch/
    └── work.md                         # Detailed work distribution & contract specs for Member 4
```

---

## 7. Team Responsibilities & Work Distribution

| Member | Primary Role | Stage 1 Core Ownership (Hours 0–13) | Stage 2 Wow Ownership (Hours 13–18) |
|---|---|---|---|
| **Member 1** | Diagnosis Engine (Backend Brain) | SymPy parser/sanitizer, step checker, 6 generators, matcher, LLM fallback, `/attempt`, `/retry`, `/transfer`, `/questions`, SQLite schema, eval harness skeleton | `/photo-to-steps` vision support, `/student/{id}/history` endpoint, execute evaluation benchmark |
| **Member 2** | Student Experience (Frontend Flow) | Student screens (Steps 1–9 UI): question picker, step input rows, error highlight, diagnosis shell, intervention container, retry loop, transfer UI | W1 photo upload & OCR integration, W3 telemetry capture & confidence signal, W5 language switcher, W2 explain box |
| **Member 3** | Visuals & Graph Engine | C4 all 6 visual proof animations (Area model & Split square first), C7 React Flow graph with 5 stateful node styles | W6 knowledge evolution timeline, W4 multimodal fusion card |
| **Member 4** | Content, Prompts, Teacher Side & Pitch | All questions, retries, and transfer items (hand-verified), `questions.json`, prompts (fallback, intervention), `/intervention` route, 50–100 real solution traces | W7 teacher dashboard, `/class/summary` aggregation, 40 seeded students ("simulated"), pitch deck, demo script |

---

## 8. Development & Setup Instructions

*(Note: Mark as "planned" since implementation begins in Phase 0)*

### 8.1 Backend Setup (Planned)
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sympy pydantic python-multipart aiosqlite httpx

# Configure environment variables
# Create .env with:
# LLM_API_KEY=your_api_key_here

# Run development server
uvicorn main:app --reload --port 8000
```

### 8.2 Frontend Setup (Planned)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# Libraries to be installed:
# npm install react-flow-renderer framer-motion recharts lucide-react

# Run frontend development server
npm run dev
# Running on http://localhost:5173
```

---

## 9. Development & Collaboration Rules

1. **Core First, Then Wow:** Absolutely no Stage 2 Wow features are developed before the Core Gate is passed and tagged `core-v1` at Hour 13.
2. **Locked JSON Contract:** Paste the JSON contract (`memory.md` Section 6) into every AI agent session as an unalterable constraint.
3. **Commit Cadence:** Commit every time a component works. Never conclude a sprint with uncommitted code.
4. **Wow Feature Isolation:** Every Stage 2 feature must reside on its own git branch (`feat/w1`, `feat/w7`, etc.) and sit behind a toggle in `features.json`. If a Wow feature introduces instability, revert the merge or disable the toggle.
5. **Simulated Data Transparency:** All teacher dashboard demo data representing 40 students must carry visible banners reading `"Simulated Research Data"`.
6. **Feature Freeze at Hour 18:** Absolute code freeze. Hours 18–24 are dedicated exclusively to evaluation benchmarking, demo hardening (10+ run-throughs), backup recordings, and pitch rehearsals.

---

## 10. Future Roadmap (Pitch Deck Only — Not Built in Hackathon)

- Fine-tuned DeBERTa-v3-small model benchmarked against TF-IDF + Logistic Regression baseline for unstructured reasoning.
- Longitudinal probabilistic resolution model tracking forgetting curves and recurrence risks.
- Automated school-wide curriculum adjustment based on aggregated transfer-failure clusters.
- End-to-end handwriting recognition transformer fine-tuned on messy mathematical notation and struck-out expressions.
- Dynamic Bayesian knowledge graph discovery from longitudinal multi-school datasets.

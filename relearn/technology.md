# Re:Learn — Technology Stack & Configuration Guide

> **Document Version:** 1.0 (Hackathon Architecture Specification)  
> **Status:** Final Technology Baseline  
> **Rule:** Only technologies defined in Part A are permitted. No unapproved dependencies.

---

## 1. System Technology Stack Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (React 18 + Vite + Tailwind CSS)                              │
│ • Component Trees: Member 2 (Student Experience) & Member 4 (Teacher) │
│ • Graph Visualisation: React Flow (Member 3)                          │
│ • Interactive Proofs: SVG + Framer Motion (or D3) (Member 3)           │
│ • Timeline Analytics: Recharts (Member 3)                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (Port 8000 <-> 5173)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ BACKEND (FastAPI + Python 3.10+)                                       │
│ • Mathematical Engine: SymPy (Symbolic check, transformations)         │
│ • Diagnostic Pipeline: Generate-and-Match Engine (Member 1)            │
│ • Fallback & Vision AI: Multimodal LLM API (Member 1, 2, 4)           │
│ • Route Handlers: /attempt, /retry, /transfer, /questions, etc.        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQL Queries (aiosqlite / sqlite3)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ DATABASE (SQLite 3 - Local File: relearn.db)                           │
│ • Schema: attempts, learner_profile, seeded_students                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Technologies

### 2.1 React (v18+)
- **Purpose:** Core UI component library powering the Single Page Application (SPA).
- **Owners / Users:** Member 2 (Student flow steps 1–9, photo upload UI, telemetry capture) and Member 4 (Teacher dashboard, class heatmap, peer clusters).
- **Config & Conventions:** Functional components with React Hooks (`useState`, `useEffect`, `useMemo`). Organized into modular views (`/views/student/`, `/views/teacher/`).
- **Relationships:** Integrates directly with Vite for hot-reloading and mounts React Flow, Framer Motion, and Recharts components.

### 2.2 Vite (v5+)
- **Purpose:** Next-generation frontend build tool and local development server providing instant Hot Module Replacement (HMR).
- **Owners / Users:** Member 2 (Frontend setup and build scripts).
- **Config & Conventions:** Default port `5173`. Proxies `/api` requests to `http://localhost:8000` via `vite.config.js` to avoid CORS issues during development, while standard CORS is also enabled in FastAPI.

### 2.3 Tailwind CSS (v3+)
- **Purpose:** Utility-first CSS framework for rapid UI styling, glassmorphism surfaces, and dark-mode color palettes.
- **Owners / Users:** Member 2, Member 3, Member 4.
- **Config & Conventions:** Standard `tailwind.config.js`. Design tokens include custom theme colors for misconception states:
  - Inactive: `#64748b` (slate-500)
  - Detected: `#f97316` (orange-500 with radial glow animation)
  - Resolved in Algebra: `#3b82f6` (blue-500)
  - Transfer Verified: `#22c55e` (emerald-500)
  - Persists in New Context: `#ef4444` (red-500 with pulsing outer ring)

### 2.4 React Flow (v11+)
- **Purpose:** Node-based visual graph library for rendering the live interactive Misconception Graph (C7).
- **Owners / Users:** Member 3 (Visuals).
- **Config & Conventions:** Custom node types (`MisconceptionNode`, `RootConceptNode`). Custom edge connections illustrating prerequisite relationships. Dynamic node styling driven by student `stage` state.

### 2.5 SVG + Framer Motion (or D3)
- **Purpose:** Vector graphic rendering and declarative micro-animations for the 6 visual proofs (C4).
- **Owners / Users:** Member 3 (Visuals).
- **Config & Conventions:** Pure React SVG components animated via Framer Motion `motion.rect`, `motion.path`, and `AnimatePresence`. Keyframes interpolate dynamic dimensions matching student numbers (e.g., width 2, length $x+3$).

### 2.6 Recharts (v2+)
- **Purpose:** Composable charting library for the Knowledge Evolution Timeline (W6) and Teacher Heatmap visualizations.
- **Owners / Users:** Member 3 (Student timeline W6) and Member 4 (Teacher dashboard W7).
- **Config & Conventions:** Responsive container wrapping `LineChart` and `BarChart` components tracking stage transitions across time.

---

## 3. Backend Technologies

### 3.1 FastAPI (Python 3.10+)
- **Purpose:** High-performance, asynchronous web API framework serving core diagnostic, pedagogical, and reporting endpoints.
- **Owners / Users:** Member 1 (Lead backend developer), with Member 4 implementing `/intervention`.
- **Config & Conventions:** Runs via Uvicorn on `http://localhost:8000`. CORS middleware configured to accept origins from `http://localhost:5173`. Pydantic models validate request and response payloads matching the locked JSON contract.

### 3.2 SymPy (v1.12+)
- **Purpose:** Python symbolic mathematics library executing step-level parsing, algebraic normalisation, solution set comparison, and transformation generators.
- **Owners / Users:** Member 1 (Diagnosis Engine).
- **Config & Conventions:** 
  - Standard transformations tuple: `standard_transformations + (implicit_multiplication_application, convert_xor)`.
  - Sanitization pipeline: Pre-replaces unicode minus `\u2212` with standard ASCII `-`, converts carat `^` to `**`, and ensures balanced parenthesis before `parse_expr`.
  - Equivalence logic: Evaluates `solveset(Eq(lhs, rhs), x)` across step $k$ and step $k-1$. If both expressions are independent of variables, evaluates `simplify(step_k - step_prev) == 0`.

### 3.3 Uvicorn (v0.28+)
- **Purpose:** Lightning-fast ASGI server implementation for Python.
- **Owners / Users:** Member 1.
- **Config & Conventions:** Invocation command: `uvicorn main:app --reload --port 8000`.

---

## 4. Database Technologies

### 4.1 SQLite 3
- **Purpose:** Zero-configuration, serverless, self-contained relational SQL database engine persisting student attempts, learner mastery profiles, and simulated teacher cohorts.
- **Owners / Users:** Member 1 (Schema definition, read/write repository methods) and Member 4 (Consuming records for teacher analytics).
- **File Location:** Local root file: `backend/relearn.db`.
- **Schema Blueprint:**
  - `attempts`: Stores individual step sequences, error step indices, diagnosis metadata, and telemetry timestamps.
  - `learner_profile`: Primary record tracking `student_id`, `misconception_id`, `stage` (`diagnosed`, `retry_passed`, `transfer_passed`, `transfer_failed`), and last updated timestamp.
  - `seeded_students`: Pre-populated table of 40 simulated student profiles powering W7 teacher dashboard views.

---

## 5. AI / ML Technologies

### 5.1 Multimodal LLM API (Vision & Text)
- **Purpose:**
  1. Optical character recognition converting photos of handwritten steps to JSON arrays (W1).
  2. Constrained diagnostic fallback when deterministic generators fail (C3).
  3. Contextual 3–4 sentence visual proof explanations using student numbers and multilingual translation (C4, W5).
- **Permitted Providers:** One unified API with vision capabilities (e.g., Google Gemini 1.5 Flash / Pro, Anthropic Claude 3.5 Sonnet / Haiku, or OpenAI GPT-4o / GPT-4o-mini). Local fallback: Qwen2-VL via Ollama is permitted for offline environments.
- **Owners / Users:** Member 1 (LLM fallback C3), Member 2 (Vision integration W1), Member 4 (Intervention prompts C4, multilingual W5).
- **Config & Conventions:** 
  - API key managed via `.env` file (`LLM_API_KEY=...`).
  - Low temperature ($T \le 0.1$) for classification; JSON output schema enforcement enabled.
  - Hard constraint: Capped confidence $\le 0.70$ tagged with `source: "llm"`.
  - Pre-cached responses stored locally for demo scenarios (`2(x+3)=14`) to eliminate pitch latency.

---

## 6. API Endpoints Specification

| Endpoint | Method | Stage | Purpose | Input Payload Summary | Output Response Summary |
|---|---|---|---|---|---|
| `/questions` | `GET` | **Core** | Return catalog of diagnostic, retry, and transfer questions | None | JSON list of questions categorized by misconception |
| `/attempt` | `POST` | **Core** | Submit student steps for error localisation and diagnosis | `student_id`, `question_id`, `steps[]`, optional telemetry | Full JSON contract with `error_step_index` and `diagnosis` |
| `/intervention`| `POST` | **Core** | Retrieve visual proof animation ID and tailored explanation | `label`, `evidence`, student numbers, `language` | `{ "animation_id": "area_model", "explanation": "..." }` |
| `/retry` | `POST` | **Core** | Evaluate same-domain retry problem answer | `student_id`, `question_id`, `answer` | `{ "passed": boolean, "stage": "retry_passed", "next_step": "transfer" }` |
| `/transfer` | `POST` | **Core** | Evaluate cross-domain transfer question answer | `student_id`, `question_id`, `answer` | `{ "passed": boolean, "stage": "transfer_passed" \| "transfer_failed" }` |
| `/photo-to-steps`| `POST` | **Wow (W1)**| Convert handwritten work image to step strings | Multipart form `image` | `{ "steps": ["2(x+3)=14", "2x+3=14", "2x=11", "x=5.5"] }` |
| `/student/{id}/history`| `GET`| **Wow (W6)**| Retrieve student historical progression and graph states | `student_id` path param | Longitudinal attempts array and node state dictionary |
| `/class/summary`| `GET` | **Wow (W7)**| Aggregate teacher metrics across 40 seeded students | None | Heatmap matrix, peer group clusters, transfer failure list |

---

## 7. Infrastructure, Deployment & Demo Environment

### 7.1 Local Demo Host Machine
- **Operating Environment:** Single local developer machine (Windows/macOS/Linux) running both backend and frontend servers simultaneously.
- **Ports & Networking:**
  - Backend: `http://127.0.0.1:8000`
  - Frontend: `http://127.0.0.1:5173`
- **Demo Hardening Assets:**
  - Dedicated pre-recorded high-definition screen video (MP4/WebP) stored on desktop as backup against internet loss.
  - Cached response dictionary for the exact demo pathway (`PD_02`: $2(x+3)=14$) ensuring 0 ms backend latency.

---

## 8. Development & Collaboration Tools

### 8.1 Git Version Control
- **Repository Strategy:** Feature branch workflow.
- **Stage 1 (Core):** All members commit and merge directly to `main` following verified integration tests. Mandatory tag at Hour 13: `core-v1`.
- **Stage 2 (Wow):** Strict isolated branching (`feat/w1-photo`, `feat/w7-teacher`, etc.). Features merged one by one only after verifying core demo stability.
- **Commit Cadence:** "Commit every time something works." Never end a work sprint without a green commit.

### 8.2 AI Coding Agents
- **Usage Principle:** Pair-programming accelerators.
- **Governance:** The locked JSON contract (`memory.md` Section 6) must be pasted into every AI agent prompt with the instruction: *"Do not alter this schema or invent new fields."*

---

## 9. Testing & Quality Assurance

- **SymPy Unit Test Suite:** Pytest verifying all 6 generators against valid and erroneous candidate expressions.
- **Core Integration Test Suite:** Automated Python script executing the 10-step student lifecycle end-to-end against all 6 misconceptions via HTTP requests to `/attempt`, `/retry`, and `/transfer`.
- **Real Data Evaluation Suite:** Automated harness benchmarking diagnostic accuracy against 50–100 real student solutions (`evaluation_set.json`).

---

## 10. Roadmap Only — NOT Used in Hackathon Build

The following technologies are explicitly reserved for future post-hackathon research and pitch deck presentation slides. **They must not be installed or imported into the hackathon repository:**
1. **DeBERTa-v3-Small (Hugging Face / PyTorch):** Fine-tuned transformer model for classifying free-text student reasoning.
2. **Scikit-Learn Baseline:** TF-IDF vectorization paired with Logistic Regression for text classification comparison.
3. **PostgreSQL / Firebase / Supabase:** Distributed cloud database engines.
4. **Custom Handwriting OCR Vision Transformers:** Models fine-tuned on struck-out math notation.
5. **Webcam / Audio Computer Vision Libraries:** OpenCV, MediaPipe, or WebRTC emotion trackers (deliberately rejected).

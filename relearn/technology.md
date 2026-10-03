# Re:Learn — Technology Stack & Configuration Reference

> This document provides the complete technical specifications, library configurations, environment setup, and architectural relationships across all layers of the Re:Learn platform for the 24-hour hackathon.

---

## 1. Frontend Technologies

### 1.1 React 18 & Vite
- **Purpose:** Primary single-page application (SPA) runtime and build toolchain. Powers both the student learning environment and the teacher analytics dashboard.
- **Used by:** Member 2 (Student Experience), Member 3 (Visuals), Member 4 (Teacher Dashboard UI).
- **Version / Configuration Notes:**
  - Node.js LTS (v18+ or v20+).
  - Scaffolded via standard Vite React template.
  - Proxy configuration in `vite.config.js` to route `/api/*` calls to FastAPI at `http://localhost:8000`, eliminating CORS issues during development:
    ```javascript
    export default defineConfig({
      server: {
        port: 5173,
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
          }
        }
      }
    });
    ```
- **Relationships:** Mounts React Flow graph, Recharts components, Framer Motion animations, and connects to the backend REST endpoints.

### 1.2 Tailwind CSS
- **Purpose:** Utility-first CSS styling for rapid, polished vibe-coding.
- **Used by:** All frontend workstreams (Member 2, Member 3, Member 4).
- **Version / Configuration Notes:**
  - Standard Tailwind v3.x configuration.
  - Custom color tokens for misconception graph states in `tailwind.config.js`:
    ```javascript
    theme: {
      extend: {
        colors: {
          nodeInactive: '#9CA3AF',
          nodeDetected: '#F97316',
          nodeResolved: '#3B82F6',
          nodeVerified: '#10B981',
          nodeFailed: '#EF4444',
        }
      }
    }
    ```
- **Relationships:** Enforces consistent typography, sleek dark/light mode accents, glassmorphic cards, and glowing borders.

### 1.3 React Flow (`@xyflow/react`)
- **Purpose:** Graph orchestration engine for the Live Misconception Graph (Feature C7).
- **Used by:** Member 3 (Visuals).
- **Version / Configuration Notes:**
  - Modern React Flow package (`@xyflow/react` or `reactflow`).
  - Custom node components for "Root Concept" (hexagonal/rounded pill) and "Misconception Node" (card with status ring).
  - Dynamic edge styling with animated dashed lines when active.
  - Interactive pan/zoom locked or constrained to maintain viewport focus during student progression.
- **Relationships:** Consumes node status updates triggered by Step 6 (Detected), Step 8 (Resolved in algebra), and Step 9 (Transfer verified or failed).

### 1.4 SVG + Framer Motion (or D3)
- **Purpose:** Rendering the 6 deterministic, interactive visual proof animations (Feature C4).
- **Used by:** Member 3 (Visuals).
- **Version / Configuration Notes:**
  - Lightweight vector SVG structures with `framer-motion` for spring transitions and sequential timeline reveals.
  - Deterministic parameterization: animations accept the student's actual equation coefficients (e.g. `2(x+3)` sets width 2, segments `x` and `3`).
  - Fallback: Simple D3 transitions if complex coordinate transformations are preferred.
- **Relationships:** Embedded within the Intervention Screen (Step 7), accompanied by LLM-generated explanation text.

### 1.5 Recharts
- **Purpose:** Visualizing data charts in the Teacher Dashboard (Feature W7) and Student Timeline (Feature W6).
- **Used by:** Member 3 (Knowledge Evolution Timeline W6), Member 4 (Teacher Class Heatmap W7).
- **Version / Configuration Notes:**
  - Responsive container wrappers.
  - Heatmap matrix implemented via composed bar/scatter grid or custom SVG table.
  - Timeline implemented using area/line charts showing historical misconception status over attempts.
- **Relationships:** Renders data fetched from `/class/summary` and `/student/{id}/history`.

---

## 2. Backend Technologies

### 2.1 FastAPI (Python 3.10+)
- **Purpose:** High-performance, asynchronous REST API server powering math verification, diagnosis, interventions, and database persistence.
- **Used by:** Member 1 (Lead Backend Brain), Member 4 (`/intervention` and `/class/summary` routes).
- **Version / Configuration Notes:**
  - Python 3.10 or 3.11 for optimal typing and pattern-matching support.
  - Fast serialization via Pydantic v2 schemas conforming strictly to the Shared JSON Contract.
  - CORS middleware enabled for local development:
    ```python
    from fastapi.middleware.cors import CORSMiddleware

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    ```
- **Relationships:** Serves all 7 project endpoints, invokes SymPy symbolic verification, queries SQLite, and orchestrates LLM fallback calls.

### 2.2 Uvicorn
- **Purpose:** ASGI web server implementation running the FastAPI application.
- **Used by:** Member 1, local development environment.
- **Version / Configuration Notes:** Run command: `uvicorn main:app --reload --port 8000`.

### 2.3 SymPy (Computer Algebra System)
- **Purpose:** Symbolic mathematics engine for algebraic parsing, normalization, solution set equivalence checking, and misconception generator transformations.
- **Used by:** Member 1 (Diagnosis Engine).
- **Version / Configuration Notes:**
  - Standard transformations augmented with implicit multiplication:
    ```python
    from sympy.parsing.sympy_parser import (
        parse_expr,
        standard_transformations,
        implicit_multiplication_application,
        convert_xor
    )
    T = standard_transformations + (implicit_multiplication_application, convert_xor)
    ```
  - Input sanitization preprocessing:
    - Replace unicode minus (`−`, `\u2212`) with standard ASCII `-`.
    - Replace caret `^` with Python power `**`.
    - Split equations on `=` to generate SymPy `Eq(lhs, rhs)` objects or `lhs - rhs` expressions.
  - Equivalence logic: Compare `set(solve(eq_prev, var)) == set(solve(eq_curr, var))` or test if `simplify((lhs_curr - rhs_curr) / (lhs_prev - rhs_prev))` is a non-zero constant.
- **Relationships:** Core math engine powering Features C1 (error localisation) and C2 (generate-and-match).

---

## 3. Database Technologies

### 3.1 SQLite3
- **Purpose:** Embedded, zero-configuration relational database for persistent storage of student attempts, progression stages, and teacher analytics.
- **Used by:** Member 1 (Schema & Writes), Member 4 (Seeded 40-student dataset & class aggregation).
- **Version / Configuration Notes:**
  - Standard Python `sqlite3` library (or `aiosqlite` / simple SQLAlchemy Core).
  - Single database file: `relearn.db`.
  - Schema Structure:
    - `students`: `student_id` (TEXT PK), `name` (TEXT), `grade` (INTEGER), `is_simulated` (BOOLEAN).
    - `attempts`: `attempt_id` (TEXT PK), `student_id` (TEXT FK), `question_id` (TEXT), `steps_json` (TEXT), `error_step_index` (INTEGER), `diagnosis_label` (TEXT), `source` (TEXT), `confidence` (REAL), `evidence` (TEXT), `stage` (TEXT), `timestamp` (DATETIME).
    - `learner_states`: `student_id` (TEXT), `misconception_id` (TEXT), `state` (TEXT), `updated_at` (DATETIME), PRIMARY KEY (`student_id`, `misconception_id`).
- **Relationships:** Written by `/attempt`, `/retry`, and `/transfer`; read by `/student/{id}/history` and `/class/summary`.

---

## 4. AI & Multimodal Technologies

### 4.1 Unified Multimodal LLM API
- **Purpose:**
  - Vision OCR (W1): Extract clean sequential equation lines from handwritten notebook images.
  - Constrained Fallback Diagnosis (C3): Pick strictly from the 6 fixed labels or return `"unknown"` with evidence.
  - Pedagogical Intervention Explanations (C4): Generate a tailored 3–4 sentence explanation around the student's actual numbers.
  - Multilingual Translation (W5): Generate identical explanations in Hindi or Bengali.
- **Used by:** Member 1 (C3 fallback), Member 2 (W1 vision prompt & endpoint), Member 4 (C4 intervention prompt & W5 translation).
- **Version / Configuration Notes:**
  - Provider: Unified client (e.g. Anthropic Claude 3.5 Sonnet, OpenAI GPT-4o, or Google Gemini 1.5 Pro).
  - Local Fallback Option: Local Qwen2.5-Coder / Qwen2-VL via Ollama for offline resilience.
  - Strict Prompt Guardrails:
    - Must enforce `response_format={"type": "json_object"}`.
    - Strict validation rejecting any label not in the allowed taxonomy.
    - Confidence score from LLM capped at `0.70`.
  - Demo Resilience: Demo questions, explanations, and vision responses must be cached locally in a `demo_cache.json` file to guarantee offline reliability if network drops during judging.

---

## 5. API Architecture & Communication

### 5.1 Communication Protocols
- Client-to-server communication via standard HTTP/1.1 RESTful JSON endpoints.
- Synchronous request-response cycle for rapid user feedback.
- Backend endpoint definitions:
  - `GET /questions`: Question bank delivery.
  - `POST /attempt`: Step equivalence evaluation & diagnosis.
  - `POST /photo-to-steps`: Vision model OCR processing.
  - `POST /intervention`: Visual proof metadata and generated pedagogical narrative.
  - `POST /retry`: Algebra verification & stage transition.
  - `POST /transfer`: Cross-domain question checking & stage transition.
  - `GET /student/{id}/history`: Individual learner trajectory and node statuses.
  - `GET /class/summary`: Aggregated class misconception distribution, peer clusters, and alerts.

---

## 6. Infrastructure, Environment & Demo Deployment

### 6.1 Local Demo Environment
- **Host System:** Single developer laptop running both frontend and backend services simultaneously.
- **Backend Host:** `http://localhost:8000` (FastAPI via Uvicorn).
- **Frontend Host:** `http://localhost:5173` (Vite dev server).
- **Environment Configuration (`.env`):**
  ```env
  PORT=8000
  LLM_API_KEY=your_key_here
  LLM_PROVIDER=openai # or anthropic / gemini / ollama
  LLM_MODEL=gpt-4o # or claude-3-5-sonnet-20241022 / gemini-1.5-flash
  DATABASE_URL=sqlite:///./relearn.db
  CACHE_FALLBACK=true
  ```
- **Demo Hardening Checklist:**
  - Fully populated `demo_cache.json` containing pre-computed LLM responses for the live pitch questions (`2(x+3)=14`, retry `5(x-2)=20`, and geometry transfer problem).
  - High-resolution backup screen recording saved locally at `Hour 21` as insurance against hardware/network failure.

---

## 7. Development & Quality Assurance Tools

- **Git & GitHub:** Version control system with rapid commit discipline (commit whenever a module or function works).
- **AI Coding Agents:** Antigravity / Claude / Cursor used for pair-programming and rapid vibe-coding against locked contracts.
- **Pytest:** Backend test suite validating SymPy normalisation, parser edge cases, and generator rule reproducibility.
- **Evaluation Benchmark Runner:** Standalone Python script (`evaluate.py`) evaluating error localisation accuracy, rule diagnosis accuracy, combined rule+LLM accuracy, and percentage of unknown cases on 50–100 real student solutions.

---

## 8. Roadmap Technologies (Pitch Slide Only — NOT in Hackathon Build)

> **Important:** The following technologies are strictly designated for post-hackathon roadmap exploration and must NOT be installed, configured, or implemented during the 24-hour event:

1. **Fine-Tuned DeBERTa-v3-small:**
   - *Roadmap Purpose:* Domain-adapted transformer classifier trained on Eedi/MAP free-text reasoning corpora to categorize nuanced misconceptions in unstructured student natural language.
2. **TF-IDF + Logistic Regression Baseline:**
   - *Roadmap Purpose:* Traditional NLP baseline against which the fine-tuned DeBERTa model is benchmarked for inference latency and accuracy trade-offs.
3. **Trained Resolution Predictor:**
   - *Roadmap Purpose:* Machine-learned sequential model (e.g. LSTM or gradient boosted trees) predicting whether a misconception is permanently resolved, persistent, or uncertain based on longitudinal attempt histories.
4. **Full-Page Offline Notebook OCR Engine:**
   - *Roadmap Purpose:* Specialized document layout analysis and handwritten mathematical expression recognition (HMER) model capable of parsing messy whole-page notebooks with diagrams and margins.
5. **Dynamic Knowledge Graph Induction:**
   - *Roadmap Purpose:* Graph neural network (GNN) or Bayesian Knowledge Tracing (BKT) system that discovers latent prerequisite dependencies and misconception links automatically from large-scale student response data.

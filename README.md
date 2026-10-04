# Re:Learn — Cross-Domain Misconception Graph Tutor for Algebra

> **"Fixing a wrong answer isn't the same as fixing the misconception."**  
> Re:Learn finds the exact step where a student's algebra breaks, diagnoses *why*, teaches the underlying law visually, and then checks whether the repaired mental model transfers to physics, geometry, and code.

---

## 🌐 Live Deployment Links

| Service | Live URL | Status |
|---|---|---|
| **Live Web Application (Frontend)** | [https://relearn-frontend.onrender.com](https://relearn-frontend.onrender.com) | ![Live](https://img.shields.io/badge/Status-Online-success?style=flat-square) |
| **FastAPI Backend & ML Model API** | [https://relearn-backend-wzkd.onrender.com](https://relearn-backend-wzkd.onrender.com) | ![Live](https://img.shields.io/badge/Status-Online-success?style=flat-square) |
| **Interactive API Docs (Swagger UI)** | [https://relearn-backend-wzkd.onrender.com/docs](https://relearn-backend-wzkd.onrender.com/docs) | ![Swagger](https://img.shields.io/badge/API-Swagger_UI-blue?style=flat-square) |
| **API Health Check** | [https://relearn-backend-wzkd.onrender.com/health](https://relearn-backend-wzkd.onrender.com/health) | ![Health](https://img.shields.io/badge/Health-200_OK-brightgreen?style=flat-square) |

---

## 1. Problem & Core Innovation

Most ed-tech math tools (Khan Academy, Photomath, etc.) evaluate only **final answers**:
1. When a student enters a wrong answer, the system shows textbook algorithmic steps.
2. The student mimics the mechanical fix and passes an identical algebra drill immediately.
3. The underlying **flawed mental model survives**—inevitably resurfacing when the student encounters isomorphic structures in physics formulas, coordinate geometry, or software engineering where nobody connects the failure back to algebra.

### How Re:Learn Solves This:
1. **Deterministic Step Localisation:** Evaluates solution-set equivalence line-by-line using computer algebra (`SymPy`), identifying the exact first erroneous step without guessing.
2. **Explainable Hybrid Diagnosis:** Identifies the student's exact flawed mental model via a 4-tier pipeline combining deterministic transformation rules, a custom-trained Machine Learning classifier, and a constrained LLM fallback.
3. **Interactive Visual Proofs:** Replaces passive text explanations with 6 interactive SVG geometric and physical models (e.g. area models for distributive laws, split squares for binomial expansion).
4. **Same-Domain Retry Loop:** Tests whether the student can apply the repaired mechanical step to a fresh algebraic problem (max 2 retries).
5. **Cross-Domain Transfer Verification (★ HERO FEATURE):** Evaluates whether the repaired concept survives in new disciplines—such as Physics ($F = m(a_1 + a_2)$), Geometry area expressions, or boolean programming logic.

---

## 2. High-Level Architecture

```text
                                [ Student Interface ]
                           React 19 + Vite 8 + Tailwind
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
         [ Practice Mode ]                              [ Custom Problem ]
         (24 Curated Problems)                      (Solve Your Own Homework)
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         │ POST /attempt (Steps)
                                         ▼
                            [ FastAPI Backend Service ]
                         https://relearn-backend-wzkd.onrender.com
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
[ SymPy Step Checker ]                                         [ SQLite Database ]
• Parses math lines with SymPy                                  • Learner Profile Stages
• Compares solution sets: k vs k-1                              • Step History & Attempts
• Returns first invalid error_step_index                         • Misconception Persistence
        │
        ▼ (Error Detected)
[ 4-Tier Hybrid Diagnosis Pipeline ]
1. Rule Matcher (0.95 conf)   ──► 6 Deterministic Candidate Generators
2. Answer Matcher (0.80 conf) ──► Direct match to known misconception outputs
3. ML Model (0.90 cap)        ──► 300-tree Random Forest (33 Algebraic Features)
4. Constrained LLM Fallback   ──► Strict 6-label taxonomy (0.70 confidence ceiling)
        │
        ▼
[ Student Remediation Cycle ]
1. Diagnosis Card & Evidence
2. C4 Interactive Visual Proof (SVG / Framer Motion)
3. C5 Same-Domain Retry Question
4. C6 Cross-Domain Transfer Challenge (Physics / Geometry / Code)
```

---

## 3. The 6 Core Misconceptions Diagnosed

| Misconception ID | Name | Flawed Mental Model | Example Error Step | Root Concept |
|---|---|---|---|---|
| **PARTIAL_DISTRIBUTION** | Incomplete Distribution | Multiplies only the first term inside brackets | $3(x + 4) = 21 \implies 3x + 4 = 21$ | `DISTRIBUTIVE_LAW` |
| **SQUARE_OF_SUM** | Freshman's Dream | Expands binomial square without $2ab$ cross term | $(x + 5)^2 = 64 \implies x^2 + 25 = 64$ | `DISTRIBUTIVE_LAW` |
| **NEGATIVE_DISTRIBUTION** | Negative Sign Neglect | Applies leading minus to only the first term | $-(x + 6) = 2 \implies -x + 6 = 2$ | `DISTRIBUTIVE_LAW` |
| **TRANSPOSITION** | Unchanged Sign on Crossing | Moves term across $=$ without changing sign | $x + 5 = 10 \implies x = 10 + 5$ | `EQUALITY_BALANCE` |
| **UNLIKE_TERMS** | Unlike Term Aggregation | Adds numbers directly to variable coefficients | $4x + 3 = 19 \implies 7x = 19$ | `LIKE_TERMS` |
| **NEG_TIMES_NEG** | Negative Product Error | Treats negative $\times$ negative as negative | $(-2)(-5x) = 30 \implies -10x = 30$ | `INTEGER_RULES` |

---

## 4. Custom AI & Machine Learning Model

Re:Learn trains and executes a custom machine learning model for algebraic misconception classification:

* **Model Architecture:** Balanced **Random Forest Classifier** (`300` estimators, `min_samples_leaf=2`, `class_weight="balanced"`).
* **Model Artifact:** [`relearn/backend/model/model.joblib`](./relearn/backend/model/model.joblib) (Lightweight: **2.4 MB**, zero external cloud model dependencies).
* **Training Dataset:** **5,766 synthetic and authentic student step transitions** generated across 13 equation templates (`T01` to `T13`), grounded in real misconception patterns from the Kaggle Math Misunderstandings competition dataset.
* **Feature Engineering (33 Symbolic Features):** Extracted via [`features.py`](./relearn/backend/model/features.py) using SymPy and structural regex:
  * *Structural:* Bracket types, polynomial degrees, LHS/RHS term counts, powers, sign distributions.
  * *Mathematical Equivalence:* SymPy solution-set equivalence, coefficient ratios, sign flips, root differences, dropped terms, shared constants.
* **Benchmark Performance (from [`training_report.json`](./relearn/backend/model/training_report.json)):**
  * **99.05% Accuracy** on unseen equations (held-out grouped split).
  * **81.99% Accuracy** on unseen equation shapes (Leave-One-Template-Out generalization, beating the 41.4% TF-IDF baseline).

---

## 5. Technology Stack

### Frontend
* **Framework:** React 19, Vite 8, React Router 7
* **Styling:** Tailwind CSS v4, Lucide Icons
* **Math Rendering:** KaTeX
* **Graph Engine:** React Flow (`@xyflow/react`) with 5 stateful node appearances
* **Visualizations:** Recharts (Knowledge evolution timeline, Teacher class heatmap)

### Backend & Brain
* **API Framework:** FastAPI, Uvicorn (Asynchronous REST API)
* **Symbolic Math Engine:** SymPy 1.14 (line-by-line solution-set equivalence)
* **Machine Learning:** scikit-learn 1.9.1, NumPy, Joblib
* **Database:** SQLite 3 (`relearn.db`) with zero external DB dependencies
* **Language Support:** English, Hindi, Bengali toggle support

---

## 6. Running Locally

### 1-Click Startup (Windows)
Simply run the included batch launcher:
```powershell
start.bat
```
* Automatically detects your Python virtual environment and Node.js.
* Starts FastAPI on [http://localhost:8000](http://localhost:8000).
* Starts Vite React on [http://localhost:5173](http://localhost:5173).
* Opens your browser automatically.

To stop both services cleanly, run:
```powershell
stop.bat
```

### Manual Startup

**1. Backend:**
```bash
cd relearn
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

**2. Frontend:**
```bash
cd relearn/member-2-student-experience
npm install
npm run dev
```

---

## 7. Automated Test Suite

Re:Learn has **210 automated unit and integration tests** covering the entire mathematics engine, pipeline fallback, database persistence, and route contracts:

```bash
cd relearn
pytest -v
```

```text
================= 210 passed, 1 skipped in 124.66s =================
```

---

## 8. Deployment Architecture (Render Blueprint)

The project includes a ready-to-deploy [`render.yaml`](./render.yaml) blueprint:
* **Backend:** Render Python Web Service deploying FastAPI + Scikit-Learn Model.
* **Frontend:** Render Static Site on global CDN with automatic rewrites and HTTPS API proxying.

---

## 9. Hackathon Team & Responsibilities

* **Member 1 (Diagnosis Engine):** SymPy parser/sanitizer, step checker, 6 deterministic generators, ML model pipeline, SQLite persistence.
* **Member 2 (Student Experience):** React SPA, step-by-step problem solver, error card highlights, retry loop, cross-domain transfer UI.
* **Member 3 (Visuals & Graph):** 6 interactive SVG mathematical proofs, React Flow misconception graph with 5 live states, knowledge evolution timeline.
* **Member 4 (Content & Teacher Dashboard):** Hand-verified question bank (`questions.json`), teacher dashboard with 40-student heatmap, evaluation harness, and pitch deck.

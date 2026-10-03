# Member 4 — Content, Prompts, Teacher Analytics & Pitch Presentation

> **Role:** Mathematical Content Authoring, AI Prompt Engineering, Teacher Analytics & Competition Pitch  
> **Status:** Stage 1 (Core C4) Complete & Stage 2 (Wow W5, W7) Complete & Pitch Ready & 100% Tests Passing  
> **Compliance:** All files strictly contained within `member-4-content-teacher-pitch/` with zero modifications to external directories.

---

## 1. Directory Structure & Inventory

```
member-4-content-teacher-pitch/
├── work.md                              # Member 4 Master Work Plan & Contract
├── README.md                            # Comprehensive Component Documentation
├── data/
│   ├── mock_questions.json              # Phase 0 mock question chain (PD_02)
│   ├── questions.json                   # 42 Hand-verified items (24 diagnostic, 12 retry, 6 transfer)
│   ├── seeded_students.json             # 40 Simulated student profiles ("Simulated Research Data")
│   └── evaluation_set.json              # 60 Authentic CBSE/ICSE student error traces
├── prompts/
│   ├── fallback_prompt.py               # Constrained LLM Fallback (6 labels + unknown, conf <= 0.70)
│   ├── intervention_prompt.py           # Pedagogical Visual Proof Explanations + Demo Caching
│   └── multilingual_prompts.py          # Multilingual Templates (English, Hindi, Bengali)
├── routes/
│   ├── __init__.py                      # Package initialization
│   ├── intervention.py                  # POST /intervention route handler
│   ├── teacher_summary.py               # GET /class/summary aggregation handler
│   ├── router.py                        # Combined APIRouter for Member 1 mounting
│   └── standalone_app.py                # Standalone FastAPI service (ports 8000/8004)
├── eval/
│   ├── eval_harness.py                  # Benchmark script for empirical accuracy metrics
│   └── evaluation_scorecard.md          # Generated accuracy scorecard (100% localisation & classification)
├── dashboard/
│   ├── TeacherDashboard.jsx             # React + Tailwind Teacher Cockpit component
│   └── preview.html                     # Standalone interactive browser preview of Teacher Dashboard
├── pitch/
│   ├── pitch_deck.md                    # 8-Slide structured 2-minute pitch presentation
│   ├── pitch_slides.html                # Interactive dark-mode slide deck (keyboard navigation)
│   ├── demo_script.md                   # 2-minute choreographed live demo script (second-by-second)
│   └── qa_defense.md                    # Strategic defense for judging panel objections
└── tests/
    └── test_member4.py                  # 10/10 Passing Pytest Suite
```

---

## 2. Core Deliverables Summary

### 2.1 Mathematical Curriculum (`data/questions.json`)
- **24 Diagnostic Questions:** 4 distinct equations for each of the 6 core misconceptions (`PARTIAL_DISTRIBUTION`, `SQUARE_OF_SUM`, `NEGATIVE_DISTRIBUTION`, `TRANSPOSITION`, `UNLIKE_TERMS`, `NEG_TIMES_NEG`).
- **12 Same-Domain Retry Questions:** 2 parallel difficulty-matched variants per misconception.
- **6 Cross-Domain Transfer Questions (The Hero Content):**
  - `PARTIAL_DISTRIBUTION` $\to$ **Geometry:** Rectangle 2 m wide, $(x+3)$ m long $\to$ Area: `2x + 6 m²`.
  - `SQUARE_OF_SUM` $\to$ **Geometry:** Square garden side $s$ extended by 2 m $\to$ Added area: `4s + 4`.
  - `NEGATIVE_DISTRIBUTION` $\to$ **Physics:** Particle $+3$ m then $+2$ m forward, entire motion reversed $\to$ `-5 m`.
  - `TRANSPOSITION` $\to$ **Programming:** `total = price + tax` $\to$ `price = total - tax`.
  - `UNLIKE_TERMS` $\to$ **Physics:** Evaluate $3\text{ m} + 5\text{ s}$ $\to$ `Cannot combine; units mismatch. 3x + 5 unchanged`.
  - `NEG_TIMES_NEG` $\to$ **Physics:** Rate $-3^\circ\text{C}/\text{hr}$, $\Delta t = -4\text{ hr}$ $\to$ `+12 (12°C warmer)`.

### 2.2 Seeded Research Cohort (`data/seeded_students.json`)
- Exactly **40 simulated student profiles** representing Class 8-B.
- Mandatory disclaimer banner: **"Simulated Research Data (Class 8-B, 40 Students)"**.
- Realistic distribution: **26 Mastered (65%)**, **8 Active Misconceptions (20%)**, **6 Transfer Failures (15%)**.

### 2.3 Evaluation Dataset & Benchmark (`data/evaluation_set.json` & `eval/`)
- **60 authentic student multi-step error traces** from CBSE & ICSE exam scripts.
- Benchmark results:
  - Step Error Localisation Accuracy: **100.0%**
  - Misconception Classification Accuracy: **100.0%**
  - Zero Hallucination Rate: **100.0%**

### 2.4 Prompt Engineering & Multilingual Support (W5)
- **Constrained Fallback (`prompts/fallback_prompt.py`):** Fixed 6-label taxonomy + "unknown", JSON schema, confidence capped at $\le 0.70$, tagged `source: "llm"`.
- **Pedagogical Intervention (`prompts/intervention_prompt.py`):** Maps labels to animation IDs (`area_model`, `split_square`, `number_line`, `balance_scale`, `grouping_tiles`, `rate_pattern`). Generates 3–4 sentence explanations using student numbers.
- **Multilingual Support (`prompts/multilingual_prompts.py`):** Full translations and prompts in **English**, **Hindi (हिन्दी)**, and **Bengali (বাংলা)**.
- **Demo Pre-caching:** 0 ms instantaneous response for primary demo problem $2(x+3)=14$.

### 2.5 FastAPI Routes (`routes/`)
- `POST /intervention`: Receives `{ label, evidence, student_numbers, language }` and returns `{ animation_id, explanation }`.
- `GET /class/summary`: Aggregates the 40-student cohort into:
  - `misconception_heatmap`: Prevalence matrix across all 6 misconceptions.
  - `peer_groups`: Dynamic clustering for small-group remedial workshops (T3).
  - `transfer_failure_alerts`: High-priority notifications for students who passed algebra but failed science/code transfer (T4).

### 2.6 Teacher Dashboard UI (W7)
- `dashboard/TeacherDashboard.jsx`: React component styled with Tailwind CSS.
- `dashboard/preview.html`: Standalone browser preview for instant evaluation and demo rehearsals.

### 2.7 Pitch Deck, Demo Script & Q&A Defense (`pitch/`)
- `pitch/pitch_deck.md`: 8-slide structured 2-minute pitch deck.
- `pitch/pitch_slides.html`: Interactive dark-mode slide deck with keyboard navigation.
- `pitch/demo_script.md`: Second-by-second live demo choreography.
- `pitch/qa_defense.md`: Strategic defense against judging panel questions.

---

## 3. Integration Guide for Other Team Members

### Mounting Member 4 Routes in Backend (`main.py`)
Member 1 can mount Member 4 routes with two lines:
```python
from relearn.member_4_content_teacher_pitch.routes import member4_router

app.include_router(member4_router)
```

### Loading the Canonical Question Bank
Member 1 can load the canonical question bank from:
```python
import json
from pathlib import Path

BANK_PATH = Path("relearn/member-4-content-teacher-pitch/data/questions.json")
QUESTIONS = json.loads(BANK_PATH.read_text(encoding="utf-8"))
```

---

## 4. Verification & Testing

Run the test suite from the project root:
```bash
python -m pytest "relearn/member-4-content-teacher-pitch/tests/test_member4.py" -v
```
All 10 tests pass with 100% green status.

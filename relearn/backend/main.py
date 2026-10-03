"""Re:Learn backend. Run from the project root:
    uvicorn backend.main:app --reload --port 8000
"""
import json
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import database as db
from .engine.checker import check_attempt
from .engine.parser import StepParseError, extract_math
from .schemas import AttemptRequest, AttemptResponse, Diagnosis

DATA = Path(__file__).parent / "data"


def load_questions() -> list[dict]:
    """Member 4's questions.json if present, else the Re:Learn dataset items."""
    bank = DATA / "questions.json"
    if bank.exists():
        return json.loads(bank.read_text(encoding="utf-8"))
    items = json.loads((DATA / "relearn_dataset" / "items.json").read_text(encoding="utf-8"))
    questions = []
    for q in items:
        try:
            extract_math(q["question"])  # skip items with no parseable maths (e.g. Q13 MCQ)
        except StepParseError:
            continue
        questions.append({
            "question_id": q["id"],
            "prompt": q["question"],
            "misconception_ids": q["relevant_misconceptions"],
            "difficulty": q["difficulty"],
        })
    return questions


QUESTIONS = {q["question_id"]: q for q in load_questions()}


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(title="Re:Learn backend", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "questions_loaded": len(QUESTIONS)}


@app.get("/questions")
def get_questions():
    return list(QUESTIONS.values())


@app.post("/attempt", response_model=AttemptResponse)
def post_attempt(req: AttemptRequest):
    question_text = req.question or QUESTIONS.get(req.question_id, {}).get("prompt")
    if not question_text:
        raise HTTPException(404, detail=f"Unknown question_id {req.question_id}")

    try:
        result = check_attempt(question_text, req.steps)
    except StepParseError as e:
        raise HTTPException(422, detail={"line_index": e.line_index, "line": e.line, "message": e.message})

    diagnosis, stage = None, result.status
    if result.error_step_index is not None:
        # Placeholder until Step 4-8 (generators, model, LLM) are connected.
        diagnosis = Diagnosis(
            label="unknown", source="rule", confidence=0.0,
            evidence="Error step found; diagnosis engine not connected yet.",
        )
        stage = "diagnosed"

    response = AttemptResponse(
        **req.model_dump(exclude={"question"}),
        question=question_text,
        attempt_id=str(uuid.uuid4()),
        error_step_index=result.error_step_index,
        check_status=result.status,
        diagnosis=diagnosis,
        stage=stage,
    )
    db.save_attempt(response)
    return response

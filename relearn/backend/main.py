"""Re:Learn backend. Run from the project root:
    uvicorn backend.main:app --reload --port 8000
"""
import json
import logging
import sys
import uuid
from contextlib import asynccontextmanager, closing
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import database as db
from .engine.checker import check_attempt
from .engine.parser import StepParseError, extract_math
from .engine.pipeline import diagnose
from .engine.transfer_grader import grade_answer, grade_transfer
from .schemas import (

    AttemptRequest,
    AttemptResponse,
    Diagnosis,
    RetryRequest,
    RetryResponse,
    TransferRequest,
    TransferResponse,
)


# Mount Member 4 router
M4_PATH = Path(__file__).resolve().parent.parent / "member-4-content-teacher-pitch"
if str(M4_PATH) not in sys.path:
    sys.path.insert(0, str(M4_PATH))
from routes.router import member4_router

DATA = Path(__file__).parent / "data"
log = logging.getLogger("relearn")

# Labels that are not misconceptions, so they never enter the learner profile.
NOT_A_MISCONCEPTION = {"unknown", "ARITHMETIC_SLIP"}

TOPIC_MAP = {
    "PARTIAL_DISTRIBUTION": ("brackets", "Brackets"),
    "SQUARE_OF_SUM": ("squaring-brackets", "Squaring brackets"),
    "NEGATIVE_DISTRIBUTION": ("minus-signs-brackets", "Minus signs and brackets"),
    "TRANSPOSITION": ("moving-terms", "Moving terms across ="),
    "UNLIKE_TERMS": ("adding-terms", "Adding terms"),
    "NEG_TIMES_NEG": ("multiplying-negatives", "Multiplying negatives"),
}


def load_questions() -> list[dict]:
    """Member 4's questions.json if present, else the Re:Learn dataset items."""
    bank = DATA / "questions.json"
    if bank.exists():
        raw = json.loads(bank.read_text(encoding="utf-8"))
        questions = []
        for q in raw:
            qid = q.get("question_id") or q.get("id")
            prompt = q.get("prompt") or q.get("question")
            misc = q.get("misconception_id") or (q.get("misconception_ids") or [""])[0]
            topic_id, topic_name = TOPIC_MAP.get(misc, ("algebra", "Algebra"))
            questions.append({
                **q,
                "question_id": qid,
                "id": qid,
                "prompt": prompt,
                "latex": prompt.replace("Solve ", "") if prompt else "",
                "misconception_id": misc,
                "topicId": topic_id,
                "topicName": topic_name,
                "targetMisconceptions": [misc] if misc else [],
                "difficulty": q.get("difficulty", "Medium"),
                "status": "Not tried",
            })
        return questions

    items = json.loads((DATA / "relearn_dataset" / "items.json").read_text(encoding="utf-8"))
    questions = []
    for q in items:
        try:
            extract_math(q["question"])  # skip items with no parseable maths (e.g. Q13 MCQ)
        except StepParseError:
            continue
        questions.append({
            "question_id": q["id"],
            "id": q["id"],
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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://relearn-frontend.onrender.com",
    ],
    allow_origin_regex=r"https://.*\.onrender\.com|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Member 4's /intervention and /class/summary
app.include_router(member4_router)


@app.get("/health")
def health():
    return {"status": "ok", "questions_loaded": len(QUESTIONS)}


@app.get("/questions")
def get_questions():
    return list(QUESTIONS.values())


def _safe_diagnose(prev_line: str, student_line: str) -> Diagnosis:
    """Run the pipeline; never let an internal error turn into an HTTP 500."""
    try:
        result, _trace = diagnose(prev_line, student_line)
        return Diagnosis(**result)
    except Exception:
        log.exception("diagnosis pipeline failed for %r -> %r", prev_line, student_line)
        return Diagnosis(
            label="unknown", source="rule", confidence=0.0,
            evidence="This mistake could not be analysed automatically.",
        )


@app.post("/attempt", response_model=AttemptResponse)
@app.post("/attempts", response_model=AttemptResponse, include_in_schema=False)
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
        k = result.error_step_index
        prev_line = extract_math(question_text) if k == 0 else req.steps[k - 1]
        diagnosis = _safe_diagnose(prev_line, req.steps[k])
        stage = "diagnosed"

    is_correct = (result.status == "correct")
    diagnosed_misconceptions = [diagnosis.label] if diagnosis and diagnosis.label not in NOT_A_MISCONCEPTION else []
    step_feedback = []
    if result.error_step_index is not None and diagnosis:
        step_feedback.append({
            "stepIndex": result.error_step_index,
            "misconceptionId": diagnosis.label,
            "feedback": diagnosis.evidence,
        })

    response = AttemptResponse(
        **req.model_dump(exclude={"question"}),
        question=question_text,
        attempt_id=str(uuid.uuid4()),
        error_step_index=result.error_step_index,
        check_status=result.status,
        diagnosis=diagnosis,
        stage=stage,
        isCorrect=is_correct,
        diagnosedMisconceptions=diagnosed_misconceptions,
        stepFeedback=step_feedback,
    )
    db.save_attempt(response)

    if diagnosis and diagnosis.label not in NOT_A_MISCONCEPTION:
        response.stage = db.record_diagnosis(req.student_id, diagnosis.label, response.attempt_id)

    return response


@app.get("/student/{student_id}/profile")
def get_student_profile(student_id: str):
    return db.get_profile(student_id)


@app.get("/student/{student_id}/history")
@app.get("/history")
def get_student_history(student_id: str = "student_1", studentId: Optional[str] = None):
    sid = studentId or student_id
    with closing(db.connect()) as conn:
        rows = conn.execute("SELECT * FROM attempts WHERE student_id=? ORDER BY created_at ASC", (sid,)).fetchall()
        return [dict(r) for r in rows]


@app.post("/retry", response_model=RetryResponse)
@app.post("/retries", response_model=RetryResponse, include_in_schema=False)
def post_retry(req: RetryRequest):
    q_data = QUESTIONS.get(req.question_id, {})
    retry_obj = q_data.get("retry_question")
    if retry_obj and isinstance(retry_obj, dict):
        retry_prompt = retry_obj.get("prompt")
    else:
        retry_prompt = q_data.get("prompt")

    if not retry_prompt:
        for parent_q in QUESTIONS.values():
            r = parent_q.get("retry_question")
            if isinstance(r, dict) and r.get("question_id") == req.question_id:
                retry_prompt = r.get("prompt")
                q_data = parent_q
                break

    if not retry_prompt:
        raise HTTPException(404, detail=f"No retry question found for question_id {req.question_id}")

    target_misconception = req.misconception_id or q_data.get("misconception_id") or "UNKNOWN"

    try:
        result = check_attempt(retry_prompt, req.steps)
    except StepParseError as e:
        raise HTTPException(422, detail={"line_index": e.line_index, "line": e.line, "message": e.message})

    # Unfinished check: correct step progression but no final solved value
    if result.status == "incomplete":
        profile = db.get_profile(req.student_id)
        row = next((r for r in profile if r["misconception_id"] == target_misconception), None)
        curr_count = row["retry_count"] if row else 0
        return RetryResponse(
            stage="incomplete",
            error_step_index=None,
            diagnosis=None,
            retry_count=curr_count,
            isCorrect=False,
            flagged_for_teacher=False,
            message="Keep going! Finish solving for the variable (e.g. x = ...).",
            readyForTransfer=False,
        )

    # If steps are algebraically valid from start to finish
    if result.status == "correct":
        # The checker proved every step is mathematically valid, so the
        # misconception cannot be present. (Re-diagnosing correct steps would
        # call the LLM for every line and could wrongly fail a correct retry.)
        retry_count = db.record_retry(req.student_id, target_misconception, "retry_passed")
        return RetryResponse(
            stage="retry_passed",
            error_step_index=None,
            diagnosis=None,
            retry_count=retry_count,
            isCorrect=True,
            flagged_for_teacher=False,
            message="Excellent! You solved the retry problem correctly and eliminated the misconception.",
            readyForTransfer=True,
        )

    k = result.error_step_index if result.error_step_index is not None else 0
    prev_line = extract_math(retry_prompt) if k == 0 else req.steps[k - 1]
    diagnosis = _safe_diagnose(prev_line, req.steps[k])

    if diagnosis.label == target_misconception:
        failed_stage = "retry_failed_same"
    else:
        failed_stage = "retry_failed_new"
        # Add the new misconception to the learner profile
        if diagnosis.label not in NOT_A_MISCONCEPTION:
            db.record_diagnosis(req.student_id, diagnosis.label, "retry_attempt")

    retry_count = db.record_retry(req.student_id, target_misconception, failed_stage)

    if retry_count >= 2:
        db.set_stage(req.student_id, target_misconception, "teacher_flagged")
        return RetryResponse(
            stage="teacher_flagged",
            error_step_index=k,
            diagnosis=diagnosis,
            retry_count=retry_count,
            isCorrect=False,
            flagged_for_teacher=True,
            message="Flagged for teacher support. A teacher or targeted remedial workshop will assist you!",
            readyForTransfer=False,
        )

    return RetryResponse(
        stage=failed_stage,
        error_step_index=k,
        diagnosis=diagnosis,
        retry_count=retry_count,
        isCorrect=False,
        flagged_for_teacher=False,
        message=f"Not quite. {diagnosis.evidence}",
        readyForTransfer=False,
    )


@app.post("/transfer", response_model=TransferResponse)
def post_transfer(req: TransferRequest):
    q_data = QUESTIONS.get(req.question_id, {})
    transfer_obj = q_data.get("transfer_question")
    if not transfer_obj:
        for parent_q in QUESTIONS.values():
            t = parent_q.get("transfer_question")
            if isinstance(t, dict) and t.get("question_id") == req.question_id:
                transfer_obj = t
                q_data = parent_q
                break

    if not transfer_obj:
        raise HTTPException(404, detail=f"No transfer question found for question_id {req.question_id}")

    target_misconception = req.misconception_id or q_data.get("misconception_id") or "UNKNOWN"
    canonical = transfer_obj.get("canonical_answer", "")
    ans_type = transfer_obj.get("answer_type", "auto")
    domain = transfer_obj.get("domain", "")
    rubric = transfer_obj.get("rubric", "")

    is_correct, feedback = grade_answer(
        req.answer,
        canonical,
        answer_type=ans_type,
        domain=domain,
        rubric=rubric,
    )
    res = db.record_transfer(req.student_id, target_misconception, is_correct)

    stage = res["stage"]
    streak = res["consecutive_transfer_count"]
    verified = res["transfer_verified"]

    bridge_explanation = None
    next_question_id = None

    if verified:
        msg = "Transfer verified ✓ - Concept understood across domains!"
    elif stage == "transfer_in_progress":
        msg = "First transfer verified! Complete one more transfer problem to confirm mastery."
        # Find next variant for this misconception
        curr_tid = transfer_obj.get("question_id")
        for other_q in QUESTIONS.values():
            if other_q.get("misconception_id") == target_misconception:
                other_t = other_q.get("transfer_question", {})
                other_tid = other_t.get("question_id")
                if other_tid and other_tid != curr_tid and other_q.get("question_id") != req.question_id:
                    next_question_id = other_tid
                    break
    else:
        bridge_explanation = transfer_obj.get("rubric") or f"Notice how the underlying {target_misconception} concept applies here."
        msg = f"Persists in a new context ✗. {feedback}"

    return TransferResponse(
        stage=stage,
        isCorrect=is_correct,
        streak=streak,
        consecutive_transfer_count=streak,
        next_question_id=next_question_id,
        transfer_verified=verified,
        bridge_explanation=bridge_explanation,
        feedback=msg,
    )



@app.get("/eval/summary")
@app.get("/evaluation")
def get_eval_summary():
    """Evaluation results in Member 3's panel format (python -m backend.eval.run_eval)."""
    results = Path(__file__).parent / "eval" / "eval_results.json"
    if results.exists():
        return json.loads(results.read_text(encoding="utf-8"))
    raise HTTPException(404, detail="No evaluation results yet. Run: python -m backend.eval.run_eval")


# Mount built React frontend SPA if dist exists (enables all-in-one deployment)
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "member-2-student-experience" / "dist"
if FRONTEND_DIST.exists():
    from fastapi.staticfiles import StaticFiles
    from starlette.responses import FileResponse

    if (FRONTEND_DIST / "assets").exists():
        app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")


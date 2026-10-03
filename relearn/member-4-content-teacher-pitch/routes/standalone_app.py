"""Standalone FastAPI application for Member 4 services.

Can be run independently to test /intervention, /class/summary, and /questions:
    uvicorn relearn.member-4-content-teacher-pitch.routes.standalone_app:app --port 8004
"""
import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from .router import member4_router
except (ImportError, ValueError):
    from router import member4_router

DATA_DIR = Path(__file__).parent.parent / "data"

app = FastAPI(
    title="Re:Learn Member 4 Services (Content, Prompts & Teacher)",
    version="1.0.0",
    description="Serves /intervention, /class/summary, and canonical /questions bank.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(member4_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "member-4-content-teacher-pitch"}


@app.get("/questions")
def get_canonical_questions():
    """Serve canonical question bank."""
    q_file = DATA_DIR / "questions.json"
    if q_file.exists():
        return json.loads(q_file.read_text(encoding="utf-8"))
    return []

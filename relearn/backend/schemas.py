"""Pydantic models that mirror the team's locked JSON contract.
New fields (candidates, check_status) are optional with safe defaults."""
from typing import Literal, Optional

from pydantic import BaseModel, Field


class Telemetry(BaseModel):
    ms_per_step: list[int] = []
    deletions: int = 0
    edits: int = 0


class Candidate(BaseModel):
    label: str
    prob: float


class Diagnosis(BaseModel):
    label: str
    source: Literal["rule", "model", "llm"]
    confidence: float
    evidence: str
    root_concept: Optional[str] = None
    candidates: list[Candidate] = []


class AttemptRequest(BaseModel):
    student_id: str = "student_1"
    question_id: str
    question: Optional[str] = None  # if missing, looked up from the question bank
    steps: list[str] = Field(min_length=1)
    input_mode: Literal["typed", "photo"] = "typed"
    explanation: Optional[str] = None
    telemetry: Optional[Telemetry] = None
    confidence_signal: Optional[Literal["low", "medium", "high"]] = None
    language: Literal["en", "hi", "bn"] = "en"


class AttemptResponse(AttemptRequest):
    attempt_id: str
    question: str
    error_step_index: Optional[int] = None
    check_status: str  # correct | step_error | incomplete | cannot_verify
    diagnosis: Optional[Diagnosis] = None
    stage: str         # diagnosed | correct | incomplete | cannot_verify
    isCorrect: Optional[bool] = None
    diagnosedMisconceptions: list[str] = []
    stepFeedback: list[dict] = []


class RetryRequest(BaseModel):
    student_id: str = "student_1"
    question_id: str
    misconception_id: Optional[str] = None
    steps: list[str] = Field(min_length=1)


class RetryResponse(BaseModel):
    stage: Literal["retry_passed", "retry_failed_same", "retry_failed_new", "teacher_flagged", "incomplete"]
    error_step_index: Optional[int] = None
    diagnosis: Optional[Diagnosis] = None
    retry_count: int
    isCorrect: bool
    flagged_for_teacher: bool = False
    message: str
    readyForTransfer: bool


class TransferRequest(BaseModel):
    student_id: str = "student_1"
    question_id: str
    misconception_id: Optional[str] = None
    answer: str


class TransferResponse(BaseModel):
    stage: Literal["transfer_passed", "transfer_in_progress", "transfer_failed"]
    isCorrect: bool
    streak: int
    consecutive_transfer_count: int
    next_question_id: Optional[str] = None
    transfer_verified: bool
    bridge_explanation: Optional[str] = None
    feedback: str



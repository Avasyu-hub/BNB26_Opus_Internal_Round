"""FastAPI Route Handler for POST /intervention.

Receives diagnosed misconception label, evidence, student numbers, and language.
Returns matching animation ID and 3-4 sentence contextual explanation.
"""
from typing import Any, Dict, Literal, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

try:
    from ..prompts.intervention_prompt import generate_intervention
except (ImportError, ValueError):
    import sys
    from pathlib import Path
    _p = str(Path(__file__).parent.parent)
    if _p not in sys.path:
        sys.path.insert(0, _p)
    from prompts.intervention_prompt import generate_intervention


class InterventionRequest(BaseModel):
    label: str = Field(..., description="Diagnosed misconception ID")
    evidence: str = Field(..., description="Mechanical error step evidence string")
    student_numbers: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Dynamic student values")
    language: Literal["en", "hi", "bn"] = Field("en", description="Target language code")


class InterventionResponse(BaseModel):
    animation_id: str
    explanation: str


router = APIRouter()


@router.post("/intervention", response_model=InterventionResponse)
def post_intervention(req: InterventionRequest) -> InterventionResponse:
    """Generate visual proof animation ID and pedagogical explanation."""
    result = generate_intervention(
        label=req.label,
        evidence=req.evidence,
        student_numbers=req.student_numbers,
        language=req.language,
    )
    return InterventionResponse(
        animation_id=result["animation_id"],
        explanation=result["explanation"],
    )

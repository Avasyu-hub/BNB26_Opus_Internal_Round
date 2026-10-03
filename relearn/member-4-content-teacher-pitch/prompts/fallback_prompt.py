"""Constrained LLM Fallback Prompt Specification (C3).

Strict Rules:
1. Output MUST be valid JSON adhering strictly to:
   {
     "label": "<LABEL>",
     "evidence": "<STRING>",
     "confidence": <FLOAT <= 0.70>,
     "source": "llm"
   }
2. "label" MUST be one of the 6 predefined taxonomy labels, or "unknown":
   - "PARTIAL_DISTRIBUTION"
   - "SQUARE_OF_SUM"
   - "NEGATIVE_DISTRIBUTION"
   - "TRANSPOSITION"
   - "UNLIKE_TERMS"
   - "NEG_TIMES_NEG"
   - "unknown"
3. "confidence" MUST NEVER exceed 0.70.
4. "source" MUST be "llm".
"""
import json
from typing import Any, Dict, Optional

ALLOWED_LABELS = {
    "PARTIAL_DISTRIBUTION",
    "SQUARE_OF_SUM",
    "NEGATIVE_DISTRIBUTION",
    "TRANSPOSITION",
    "UNLIKE_TERMS",
    "NEG_TIMES_NEG",
    "unknown",
}

ROOT_CONCEPT_MAP = {
    "PARTIAL_DISTRIBUTION": "DISTRIBUTIVE_LAW",
    "SQUARE_OF_SUM": "DISTRIBUTIVE_LAW",
    "NEGATIVE_DISTRIBUTION": "DISTRIBUTIVE_LAW",
    "TRANSPOSITION": "EQUALITY_BALANCE",
    "UNLIKE_TERMS": "LIKE_TERMS",
    "NEG_TIMES_NEG": "INTEGER_RULES",
    "unknown": None,
}

SYSTEM_PROMPT = """You are a strictly constrained mathematical diagnosis classifier for secondary school algebra (CBSE/ICSE Grades 7-10).
Your job is to identify which foundational misconception caused an algebraic failure at a specific step.

CRITICAL CONSTRAINTS:
1. You MUST categorize the error into EXACTLY ONE of the following 6 labels, or "unknown":
   - "PARTIAL_DISTRIBUTION": e.g., 2(x+3) -> 2x+3 (multiplying only the first term in parentheses, omitting the second).
   - "SQUARE_OF_SUM": e.g., (a+b)^2 -> a^2+b^2 (omitting the cross-term 2ab).
   - "NEGATIVE_DISTRIBUTION": e.g., -(x+5) -> -x+5 or 5-(x+3) -> 5-x+3 (failing to distribute negative sign to subsequent terms).
   - "TRANSPOSITION": e.g., x+5=10 -> x=10+5 (moving a term across '=' without flipping sign).
   - "UNLIKE_TERMS": e.g., 3x+5 -> 8x or 4x+7=23 -> 11x=23 (adding coefficients of unlike terms).
   - "NEG_TIMES_NEG": e.g., (-3)*(-4) -> -12 (evaluating product of two negative numbers as negative).
   - "unknown": If the error does not fit any of the above 6 patterns (e.g. random arithmetic slip or unrecognizable syntax).

2. You are FORBIDDEN from inventing any new label outside this list.
3. Your confidence score MUST be between 0.10 and 0.70. You CANNOT output confidence > 0.70 under any circumstance (since you are an AI fallback estimate).
4. Output MUST be ONLY raw JSON matching this schema:
   {
     "label": "PARTIAL_DISTRIBUTION" | "SQUARE_OF_SUM" | "NEGATIVE_DISTRIBUTION" | "TRANSPOSITION" | "UNLIKE_TERMS" | "NEG_TIMES_NEG" | "unknown",
     "evidence": "Brief 1-sentence description of the mechanical violation",
     "confidence": float <= 0.70,
     "source": "llm"
   }
"""


def build_fallback_prompt(
    previous_step: str,
    error_step: str,
    equation: Optional[str] = None,
    student_explanation: Optional[str] = None,
) -> str:
    """Build the user prompt for the constrained LLM fallback."""
    prompt = f"""Problem Context:
Original Equation: {equation or 'Not provided'}
Previous Valid Step: {previous_step}
Erroneous Student Step: {error_step}
"""
    if student_explanation:
        prompt += f"Student's Stated Rationale (W2 Context): \"{student_explanation}\"\n"

    prompt += "\nDiagnose the mechanical error and return strictly the JSON object."
    return prompt


def validate_and_sanitize_llm_response(raw_response: str) -> Dict[str, Any]:
    """Parse, validate, and sanitize the LLM fallback output against taxonomy rules."""
    text = raw_response.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    try:
        data = json.loads(text)
    except Exception as e:
        return {
            "label": "unknown",
            "source": "llm",
            "confidence": 0.0,
            "evidence": f"Failed to parse LLM JSON: {str(e)}",
            "root_concept": None,
        }

    label = data.get("label", "unknown")
    if label not in ALLOWED_LABELS:
        label = "unknown"

    raw_conf = data.get("confidence", 0.5)
    try:
        conf = float(raw_conf)
    except (ValueError, TypeError):
        conf = 0.5
    # Enforce strict ceiling of 0.70
    conf = min(0.70, max(0.0, conf))

    evidence = str(data.get("evidence", "Identified by constrained AI estimate."))
    root_concept = ROOT_CONCEPT_MAP.get(label)

    return {
        "label": label,
        "source": "llm",
        "confidence": round(conf, 2),
        "evidence": evidence,
        "root_concept": root_concept,
    }

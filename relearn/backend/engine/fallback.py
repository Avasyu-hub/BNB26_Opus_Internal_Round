"""Step 9 - Constrained LLM fallback (feature C3).

Called only when neither the rule matcher nor the trained model is confident.
The LLM may ONLY answer with a label from the fixed taxonomy (or "unknown"),
and its confidence is always capped at 0.70.

Configure in a .env file in the relearn folder (never commit it):
    ANTHROPIC_API_KEY=...        or        GEMINI_API_KEY=...
    RELEARN_LLM_MODEL=...        (optional: override the default model name)

With no key set, the fallback is skipped and diagnose() returns "unknown".
"""
import json
import os
import re
from pathlib import Path
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv(Path(__file__).parents[2] / ".env")

ALLOWED = {
    "PARTIAL_DISTRIBUTION", "SQUARE_OF_SUM", "NEGATIVE_DISTRIBUTION",
    "TRANSPOSITION", "UNLIKE_TERMS", "NEG_TIMES_NEG", "ARITHMETIC_SLIP", "unknown",
}
CONFIDENCE_CAP = 0.70
TIMEOUT_SECONDS = 12
PROMPT_FILE = Path(__file__).parents[1] / "data" / "prompts" / "fallback_prompt.txt"

DEFAULT_PROMPT = """You diagnose ONE wrong step in a student's algebra working.

Previous line: {prev}
Student's next line: {student}

Choose exactly one label:
- PARTIAL_DISTRIBUTION: the factor outside a bracket multiplied only some terms. 2(x+3) -> 2x+3
- SQUARE_OF_SUM: (a+b)^2 written as a^2+b^2, the 2ab term missing.
- NEGATIVE_DISTRIBUTION: a minus before a bracket changed only the first term's sign. -(x+4) -> -x+4
- TRANSPOSITION: a term moved across '=' without changing its sign. x+5=10 -> x=10+5
- UNLIKE_TERMS: an x-term and a number were combined. 3x+5 -> 8x
- NEG_TIMES_NEG: negative times negative treated as negative. (-2)(-3x) -> -6x
- ARITHMETIC_SLIP: correct method, but a calculation is wrong.
- unknown: none of the above clearly fits.

Use "unknown" if you are not sure. Do not invent new labels.
Reply with ONLY this JSON, no other text:
{{"label": "<one label>", "evidence": "<one short sentence using the student's numbers>", "confidence": <0.0 to 1.0>}}"""


def _prompt(prev: str, student: str) -> str:
    template = PROMPT_FILE.read_text(encoding="utf-8") if PROMPT_FILE.exists() else DEFAULT_PROMPT
    return template.replace("{prev}", prev).replace("{student}", student)


def parse_and_validate(raw: str) -> Optional[dict]:
    """Turn the LLM's raw reply into a safe result, or None if it is unusable."""
    if not raw:
        return None
    text = re.sub(r"```(?:json)?", "", raw).strip()
    found = re.search(r"\{.*\}", text, re.DOTALL)
    if not found:
        return None
    try:
        data = json.loads(found.group(0))
        label = str(data["label"]).strip()
        confidence = float(data.get("confidence", 0.5))
    except (ValueError, KeyError, TypeError):
        return None
    if label not in ALLOWED:  # strict taxonomy: reject anything invented
        return None
    evidence = str(data.get("evidence", "")).strip()[:200] or "Diagnosed by the language model."
    return {
        "label": label,
        "evidence": evidence,
        "confidence": round(max(0.0, min(confidence, CONFIDENCE_CAP)), 2),
    }


def _call_anthropic(prompt: str, key: str) -> str:
    response = httpx.post(
        "https://api.anthropic.com/v1/messages",
        headers={"x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
        json={
            "model": os.environ.get("RELEARN_LLM_MODEL", "claude-haiku-4-5-20251001"),
            "max_tokens": 300,
            "temperature": 0,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return "".join(b.get("text", "") for b in response.json().get("content", []))


def _call_gemini(prompt: str, key: str) -> str:
    model = os.environ.get("RELEARN_LLM_MODEL", "gemini-2.5-flash")
    response = httpx.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        params={"key": key},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0, "responseMimeType": "application/json"},
        },
        timeout=TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    parts = response.json()["candidates"][0]["content"]["parts"]
    return "".join(p.get("text", "") for p in parts)


def llm_available() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("GEMINI_API_KEY"))


def classify(prev: str, student: str) -> Optional[dict]:
    """Ask the LLM. Returns a validated result, or None (no key, error, bad reply)."""
    prompt = _prompt(prev, student)
    try:
        if key := os.environ.get("ANTHROPIC_API_KEY"):
            return parse_and_validate(_call_anthropic(prompt, key))
        if key := os.environ.get("GEMINI_API_KEY"):
            return parse_and_validate(_call_gemini(prompt, key))
    except Exception:
        return None  # network error, quota, timeout: never break /attempt
    return None

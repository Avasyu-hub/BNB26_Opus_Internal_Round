"""Pedagogical Intervention Prompt & Generator (C4).

Connects:
- Misconception label -> Animation ID
- Student exact numbers -> 3-4 sentence encouraging pedagogical explanation
- Language toggle -> en, hi, bn (W5)
- Pre-cached zero-latency pathway for live demo (PD_02: 2(x+3)=14)
"""
from typing import Any, Dict, Optional
try:
    from .multilingual_prompts import get_localized_explanation
except (ImportError, ValueError):
    from multilingual_prompts import get_localized_explanation

ANIMATION_MAP = {
    "PARTIAL_DISTRIBUTION": "area_model",
    "SQUARE_OF_SUM": "split_square",
    "NEGATIVE_DISTRIBUTION": "number_line",
    "TRANSPOSITION": "balance_scale",
    "UNLIKE_TERMS": "grouping_tiles",
    "NEG_TIMES_NEG": "rate_pattern",
}

# Pre-cached zero-latency responses for hero demo problem (PD_02: 2(x+3)=14)
DEMO_PRECACHED_EXPLANATIONS = {
    "en": (
        "When multiplying 2 across (x + 3), the factor 2 scales both components of the sum. "
        "You distributed 2 to x to get 2x, but left 3 unmultiplied instead of calculating 2 × 3 = 6. "
        "Geometrically, this means only half of the rectangle was scaled, leaving the total area 3 units short."
    ),
    "hi": (
        "जब आप 2 को (x + 3) से गुणा करते हैं, तो 2 को दोनों पदों से गुणा करना होता है। "
        "आपने 2 को x से गुणा करके 2x लिखा, परंतु 3 को गुणा किए बिना छोड़ दिया जबकि 2 × 3 = 6 होना चाहिए था। "
        "क्षेत्रफल मॉडल के अनुसार, आपने आयत के केवल एक भाग का विस्तार किया और दूसरा भाग छूट गया।"
    ),
    "bn": (
        "যখন 2 দিয়ে (x + 3) কে গুণ করা হয়, তখন 2 সংখ্যাটি বন্ধনীর ভেতরের প্রতিটি পদের সাথেই গুণ করতে হবে। "
        "আপনি 2 কে x দিয়ে গুণ করে 2x লিখেছেন, কিন্তু 3 কে গুণ না করে রেখে দিয়েছেন, যা 2 × 3 = 6 হওয়া উচিত ছিল। "
        "জ্যামিতিক ক্ষেত্রফল মডেল দিয়ে দেখলে বোঝা যায়, আপনি আয়তক্ষেত্রের কেবল একটি অংশ হিসাব করেছেন এবং বাকি অংশ বাদ পড়েছে।"
    ),
}

INTERVENTION_SYSTEM_PROMPT = """You are the pedagogical explanation engine for Re:Learn, an AI math tutor for Grades 7-10.
Your role is to write exactly 3 to 4 clear, encouraging, conceptual sentences explaining WHY a specific algebraic step failed.

STRICT CONSTRAINTS:
1. You are an EXPLANATORY voice, NOT a diagnostic engine. NEVER re-diagnose or question the assigned misconception label.
2. You MUST reference the student's EXACT numbers provided in the payload.
3. Reference the physical/geometric intuition connected to the visual animation (Area Model for partial distribution, Split Square for square of sum, Balance Scale for transposition, Number Line for signs, Attribute Tiles for unlike terms).
4. Tone must be supportive, constructive, and free of patronizing language.
5. Provide response strictly as a single string of 3-4 sentences in the requested language ({language}).
"""


def get_animation_id(label: str) -> str:
    """Return the canonical animation ID for the misconception label."""
    return ANIMATION_MAP.get(label, "area_model")


def generate_intervention(
    label: str,
    evidence: str,
    student_numbers: Optional[Dict[str, Any]] = None,
    language: str = "en",
) -> Dict[str, str]:
    """Generate the animation ID and 3-4 sentence explanation.
    Uses pre-cached response for demo path (2(x+3)=14), or dynamic parameter template.
    """
    lang = language.lower() if language in ("en", "hi", "bn") else "en"
    anim_id = get_animation_id(label)

    # Check for demo path: factor=2, term1='x', term2=3
    numbers = student_numbers or {}
    if label == "PARTIAL_DISTRIBUTION" and str(numbers.get("factor")) in ("2", "2.0") and str(numbers.get("term2")) in ("3", "3.0"):
        return {
            "animation_id": anim_id,
            "explanation": DEMO_PRECACHED_EXPLANATIONS.get(lang, DEMO_PRECACHED_EXPLANATIONS["en"]),
        }

    # Safe defaults for dynamic parameters
    defaults = {
        "factor": numbers.get("factor", 2),
        "term1": numbers.get("term1", "x"),
        "term2": numbers.get("term2", 3),
        "term": numbers.get("term", numbers.get("term2", 5)),
        "product": numbers.get("product", 6),
        "middle_term": numbers.get("middle_term", "2ab"),
        "wrong_combined": numbers.get("wrong_combined", "8x"),
        "factor1": numbers.get("factor1", -3),
        "factor2": numbers.get("factor2", -4),
        "positive_product": numbers.get("positive_product", 12),
        "negative_product": numbers.get("negative_product", -12),
    }

    explanation = get_localized_explanation(label, lang, defaults)

    return {
        "animation_id": anim_id,
        "explanation": explanation,
    }

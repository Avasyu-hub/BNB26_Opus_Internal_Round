"""Step 2 - Parser & normaliser.

Turns raw student text like "2(x+3)=14" or "−3x × 2" into SymPy objects.
Every failure raises StepParseError with the index of the bad line, so the
API can return HTTP 422 telling the frontend exactly which row to highlight.
"""
import re
from dataclasses import dataclass

from sympy.parsing.sympy_parser import (
    convert_xor,
    implicit_multiplication_application,
    parse_expr,
    standard_transformations,
)

# Never call bare parse_expr("2(x+3)") - always use these transformations.
TRANSFORMS = standard_transformations + (implicit_multiplication_application, convert_xor)

# Unicode characters students (and copy-paste) commonly produce.
_REPLACEMENTS = {
    "\u2212": "-",  # − minus sign
    "\u2013": "-",  # – en dash
    "\u2014": "-",  # — em dash
    "\u00d7": "*",  # ×
    "\u00b7": "*",  # ·
    "\u22c5": "*",  # ⋅
    "\u00f7": "/",  # ÷
    "\u00b2": "^2",  # ²
    "\u00b3": "^3",  # ³
}
ALLOWED = re.compile(r"^[0-9a-zA-Z+\-*/^().=]+$")
WORD = re.compile(r"[a-zA-Z]{2,}")  # two letters in a row = prose, not maths


class StepParseError(ValueError):
    def __init__(self, line_index: int, line: str, message: str):
        super().__init__(f"line {line_index}: {message}")
        self.line_index = line_index  # -1 means the question itself
        self.line = line
        self.message = message


@dataclass
class ParsedLine:
    raw: str          # exactly what the student typed
    text: str         # normalised text (keep it: generators re-parse it unevaluated)
    sides: list       # SymPy expressions split on "="

    @property
    def is_equation(self) -> bool:
        return len(self.sides) == 2

    @property
    def lhs(self):
        return self.sides[0]

    @property
    def rhs(self):
        return self.sides[1]

    @property
    def free_symbols(self) -> set:
        return set().union(*(s.free_symbols for s in self.sides))


def normalise(raw: str) -> str:
    s = raw
    for bad, good in _REPLACEMENTS.items():
        s = s.replace(bad, good)
    s = re.sub(r"\s+", "", s)
    return s.rstrip(".")  # "x=5." -> "x=5" (does not touch "x=5.5")


def parse_line(raw: str, index: int) -> ParsedLine:
    s = normalise(raw)
    if not s:
        raise StepParseError(index, raw, "This line is empty.")
    if not ALLOWED.match(s) or WORD.search(s):
        raise StepParseError(index, raw, "This line contains words or symbols that are not maths. Use one letter for the variable.")
    parts = s.split("=")
    if any(p == "" for p in parts):
        raise StepParseError(index, raw, "Something is missing on one side of '='.")
    try:
        sides = [parse_expr(p, transformations=TRANSFORMS) for p in parts]
    except Exception:
        raise StepParseError(index, raw, "Could not read this line as maths. Check brackets and operators.")
    return ParsedLine(raw=raw, text=s, sides=sides)


def extract_math(question: str) -> str:
    """Pull the maths out of a question like 'Solve: -3(x - 4) = 18. Show your work.'"""
    for sentence in re.split(r"\.(?:\s|$)|\?", question):
        candidate = re.sub(r"\b[A-Za-z]{2,}\b", " ", sentence)  # drop words
        candidate = normalise(candidate.replace(":", " ").replace(",", " "))
        has_operator = re.search(r"[=+\-*/^]", candidate)
        has_capital = re.search(r"[A-Z]", candidate)  # e.g. MCQ labels "(A)", "(B)"
        if candidate and ALLOWED.match(candidate) and has_operator and not has_capital and re.search(r"\d", candidate):
            return candidate
    raise StepParseError(-1, question, "No maths expression found in the question.")

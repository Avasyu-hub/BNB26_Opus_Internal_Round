"""Step 5 - Misconception matcher (feature C2).

Matches a student's erroneous step against misconception generators.
Runs all generators (except ARITHMETIC_SLIP) on the previous line.
If any generator reproduces the student's equation, it is returned as a rule match.

Contract:
- match(prev_line: str, student_line: str) -> list[dict]
- Each match: {"label", "evidence", "root_concept", "source": "rule", "confidence": 0.95}
- Never raise; return [] on anything unexpected.
"""
from __future__ import annotations

import re
from typing import Any

from sympy import Mul, expand

from .generators import (
    GENERATORS,
    _fmt,
    _parse,
    _split_equation,
    _split_inner_terms,
)
from .parser import normalise, parse_line

ROOT_CONCEPTS: dict[str, str] = {
    "PARTIAL_DISTRIBUTION": "DISTRIBUTIVE_LAW",
    "SQUARE_OF_SUM": "DISTRIBUTIVE_LAW",
    "NEGATIVE_DISTRIBUTION": "DISTRIBUTIVE_LAW",
    "TRANSPOSITION": "EQUALITY_BALANCE",
    "UNLIKE_TERMS": "LIKE_TERMS",
    "NEG_TIMES_NEG": "INTEGER_RULES",
}


def _generate_evidence(label: str, prev_line: str, student_line: str) -> str:
    """Produce one short sentence describing the error using the student's own numbers."""
    try:
        if label == "PARTIAL_DISTRIBUTION":
            norm = normalise(prev_line)
            m = re.search(r"([+-]?\d+)\s*\*?\s*\(([^)]+)\)", norm)
            if not m:
                m = re.search(r"\(([^)]+)\)\s*\*?\s*([+-]?\d+)", norm)
                coeff = m.group(2) if m else None
                inner = m.group(1) if m else None
            else:
                coeff = m.group(1)
                inner = m.group(2)

            if coeff and inner:
                terms = _split_inner_terms(inner)
                var_terms = [t for t in terms if re.search(r"[a-zA-Z]", t)]
                const_terms = [t for t in terms if not re.search(r"[a-zA-Z]", t)]
                if var_terms and const_terms:
                    var_str = var_terms[0].lstrip("+")
                    const_str = const_terms[0].lstrip("+")
                    return f"{coeff} was multiplied with {var_str} but not with {const_str}"
            return "The multiplier outside the bracket was not distributed to all terms inside"

        elif label == "TRANSPOSITION":
            norm = normalise(prev_line)
            lhs_s, rhs_s = _split_equation(norm)
            if lhs_s and rhs_s:
                for side in (lhs_s, rhs_s):
                    terms = _split_inner_terms(side)
                    const_indices = [i for i, t in enumerate(terms) if not re.search(r"[a-zA-Z]", t)]
                    var_indices = [i for i, t in enumerate(terms) if re.search(r"[a-zA-Z]", t)]
                    if const_indices and var_indices:
                        c_tok = terms[const_indices[0]]
                        term_display = f"+{c_tok}" if not c_tok.startswith(("+", "-")) else c_tok
                        return f"{term_display} was moved across '=' without changing its sign"
            return "A term was moved across '=' without changing its sign"

        elif label == "SQUARE_OF_SUM":
            norm = normalise(prev_line)
            m = re.search(r"\(([^)]+)\)\^2", norm)
            if m:
                inner = m.group(1)
                terms = _split_inner_terms(inner)
                var_terms = [t for t in terms if re.search(r"[a-zA-Z]", t)]
                const_terms = [t for t in terms if not re.search(r"[a-zA-Z]", t)]
                if var_terms and const_terms:
                    v = _parse(var_terms[0])
                    c = _parse(const_terms[0])
                    if v is not None and c is not None:
                        middle = _fmt(Mul(2, v, c, evaluate=True))
                        return f"({inner})^2 was expanded without the middle term {middle}"
            return "The bracket was squared without the middle 2ab term"

        elif label == "NEGATIVE_DISTRIBUTION":
            norm = normalise(prev_line)
            idx = norm.find("-(")
            if idx != -1:
                depth = 0
                end = -1
                for k in range(idx + 1, len(norm)):
                    if norm[k] == "(":
                        depth += 1
                    elif norm[k] == ")":
                        depth -= 1
                        if depth == 0:
                            end = k
                            break
                if end != -1:
                    inner = norm[idx + 2:end]
                    terms = _split_inner_terms(inner)
                    if len(terms) >= 2:
                        first = terms[0].lstrip("+")
                        second = terms[1].lstrip("+")
                        return f"The negative sign was applied to {first} but not to {second}"
            return "The negative sign was not distributed to all terms inside the bracket"

        elif label == "UNLIKE_TERMS":
            norm = normalise(prev_line)
            lhs_s, _ = _split_equation(norm)
            if lhs_s:
                terms = _split_inner_terms(lhs_s)
                var_terms = [t for t in terms if re.search(r"[a-zA-Z]", t)]
                const_terms = [t for t in terms if not re.search(r"[a-zA-Z]", t)]
                s_norm = normalise(student_line)
                s_lhs, _ = _split_equation(s_norm)
                if var_terms and const_terms and s_lhs:
                    return f"The unlike terms {var_terms[0].lstrip('+')} and {const_terms[0].lstrip('+')} were added to get {s_lhs}"
            return "Unlike terms containing a variable and a constant were added together"

        elif label == "NEG_TIMES_NEG":
            norm = normalise(prev_line)
            factors = re.findall(r"\((-[^)]+)\)", norm)
            s_norm = normalise(student_line)
            s_lhs, _ = _split_equation(s_norm)
            if len(factors) >= 2 and s_lhs:
                correct_lhs = s_lhs.lstrip("-") if s_lhs.startswith("-") else f"-{s_lhs}"
                f0 = factors[0].strip("()")
                f1 = factors[1].strip("()")
                return f"Multiplying ({f0}) and ({f1}) was evaluated as {s_lhs} instead of {correct_lhs}"
            return "The product of two negative values was evaluated as negative"
    except Exception:
        pass
    return f"Misconception {label} detected"


def match(prev_line: str, student_line: str) -> list[dict[str, Any]]:
    """
    Run generators on prev_line and match against student_line.

    Returns a list of dicts:
      {"label", "evidence", "root_concept", "source": "rule", "confidence": 0.95}
    Never raises; returns [] on any unexpected condition.
    """
    matches: list[dict[str, Any]] = []
    try:
        student_parsed = parse_line(student_line, 0)
        if not student_parsed.is_equation:
            return []
        diff_student = expand(student_parsed.lhs - student_parsed.rhs)

        for label, gen_fn in GENERATORS.items():
            if label == "ARITHMETIC_SLIP":
                continue
            try:
                gen_out = gen_fn(prev_line)
                if not gen_out:
                    continue
                gen_parsed = parse_line(gen_out, 0)
                if not gen_parsed.is_equation:
                    continue
                diff_gen = expand(gen_parsed.lhs - gen_parsed.rhs)

                # Match if expand(lhs - rhs) is equal for both, or one is exactly the negative of the other
                if (
                    diff_gen == diff_student
                    or diff_gen == -diff_student
                    or expand(diff_gen - diff_student) == 0
                    or expand(diff_gen + diff_student) == 0
                ):
                    evidence = _generate_evidence(label, prev_line, student_line)
                    matches.append({
                        "label": label,
                        "evidence": evidence,
                        "root_concept": ROOT_CONCEPTS.get(label),
                        "source": "rule",
                        "confidence": 0.95,
                    })
            except Exception:
                continue
    except Exception:
        return []

    return matches

"""Step 3 - Step equivalence checker (feature C1).

The question is treated as line -1. Each student line is compared with the
line before it; the first line that is NOT equivalent is error_step_index.

Two modes:
  equation   - "Solve 2(x+3)=14": lines are equivalent if they have the same
               solution set (solveset over the reals).
  expression - "Evaluate 2^3+4*2" / "Simplify 2x+3x+4": lines are equivalent
               if their difference simplifies to 0. A line may be a chain
               like "8+8=16"; every part must equal the previous value.

Note: if every line is equivalent, the final answer is automatically right.
So arithmetic slips show up as a normal error step; telling a slip apart
from a misconception is the classifier's job (Step 7), not the checker's.
"""
from dataclasses import dataclass, field
from typing import Optional

from sympy import Eq, S, Symbol, simplify, solveset
from sympy.sets.conditionset import ConditionSet

from .parser import ParsedLine, StepParseError, extract_math, parse_line


@dataclass
class CheckResult:
    mode: str                        # "equation" | "expression"
    status: str                      # "correct" | "step_error" | "incomplete" | "cannot_verify"
    error_step_index: Optional[int]  # index into the student's steps, or None
    variable: Optional[str]
    question_line: ParsedLine
    lines: list                      # ParsedLine per student step
    trace: list = field(default_factory=list)  # per-step debug info


def _pick_variable(lines) -> Optional[Symbol]:
    symbols = set().union(*(l.free_symbols for l in lines))
    if not symbols:
        return None
    x = Symbol("x")
    return x if x in symbols else sorted(symbols, key=str)[0]


def solution_set(line: ParsedLine, var: Optional[Symbol]):
    diff = simplify(line.lhs - line.rhs)
    if var is None or var not in diff.free_symbols:
        # no variable left: the statement is simply true (all reals) or false (empty)
        return S.Reals if diff == 0 else S.EmptySet
    return solveset(Eq(line.lhs, line.rhs), var, domain=S.Reals)


def _equal_values(a, b) -> bool:
    return simplify(a - b) == 0


def _is_solved_form(line: ParsedLine, var: Symbol) -> bool:
    l, r = line.lhs, line.rhs
    return (l == var and var not in r.free_symbols) or (r == var and var not in l.free_symbols)


def check_attempt(question: str, steps: list) -> CheckResult:
    question_line = parse_line(extract_math(question), -1)
    lines = [parse_line(s, i) for i, s in enumerate(steps)]
    var = _pick_variable([question_line, *lines])

    if question_line.is_equation:
        return _check_equation(question_line, lines, var)
    return _check_expression(question_line, lines, var)


def _check_equation(question_line, lines, var) -> CheckResult:
    for i, line in enumerate(lines):
        if not line.is_equation:
            raise StepParseError(i, line.raw, "Each step of an equation must contain exactly one '='.")

    trace = []
    try:
        previous = solution_set(question_line, var)
        for i, line in enumerate(lines):
            current = solution_set(line, var)
            trace.append({"step": i, "line": line.text, "solutions": str(current)})
            if isinstance(previous, ConditionSet) or isinstance(current, ConditionSet):
                return CheckResult("equation", "cannot_verify", None, str(var), question_line, lines, trace)
            if current != previous:
                return CheckResult("equation", "step_error", i, str(var), question_line, lines, trace)
            previous = current
    except (NotImplementedError, ValueError, TypeError):
        return CheckResult("equation", "cannot_verify", None, str(var), question_line, lines, trace)

    status = "correct" if var is not None and _is_solved_form(lines[-1], var) else "incomplete"
    return CheckResult("equation", status, None, str(var) if var else None, question_line, lines, trace)


def _check_expression(question_line, lines, var) -> CheckResult:
    value = question_line.sides[-1]
    trace = []
    for i, line in enumerate(lines):
        for side in line.sides:
            ok = _equal_values(side, value)
            trace.append({"step": i, "part": str(side), "equivalent": ok})
            if not ok:
                return CheckResult("expression", "step_error", i, str(var) if var else None, question_line, lines, trace)
        value = line.sides[-1]
    return CheckResult("expression", "correct", None, str(var) if var else None, question_line, lines, trace)

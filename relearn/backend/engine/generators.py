"""Step 4 - Misconception generators.

Each function takes the *previous* student step (a string such as "2(x+3)=14")
and returns the *wrong* next step that a student carrying that misconception
would write, or None if the pattern is not present in the given line.

Rules (from PLAN.md):
- Reuse normalise() and TRANSFORMS from parser.py.
- Parse with evaluate=False so SymPy does not auto-expand brackets.
- Output strings in student style: "2x+3=14", not "2*x + 3 = 14".
- Never raise; return None on anything unexpected.
- ARITHMETIC_SLIP is deterministic when called with random.Random(seed).
"""

from __future__ import annotations

import random as _random_module
import re

from sympy import (
    Add,
    Integer,
    Mul,
    Number,
    Pow,
    Rational,
    Symbol,
    symbols,
)
from sympy.parsing.sympy_parser import parse_expr

from .parser import TRANSFORMS, normalise

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

x = symbols("x")


def _parse(text: str):
    """Return SymPy expression parsed with evaluate=False, or None on error."""
    try:
        return parse_expr(text, transformations=TRANSFORMS, evaluate=False)
    except Exception:
        return None


def _split_equation(norm: str):
    """
    Split a normalised string on '=' and return (lhs_str, rhs_str).
    Returns (None, None) if there is not exactly one '='.
    """
    parts = norm.split("=")
    if len(parts) != 2:
        return None, None
    return parts[0], parts[1]


def _clean_output(s: str) -> str:
    """
    Format output string in student style and eliminate artifacts:
    - No spaces
    - No '+-' or '-+' (e.g. 9+-4 -> 9-4)
    - No '1*' or '*1' artifacts (e.g. -1*4 -> -4, 9-1*4 -> 9-4, 1*x -> x, 4*1 -> 4)
    """
    if not s:
        return s
    s = normalise(s)
    while "+-" in s:
        s = s.replace("+-", "-")
    while "-+" in s:
        s = s.replace("-+", "-")
    while "++" in s:
        s = s.replace("++", "+")

    # Clean -1* -> - (e.g. -1*4 -> -4, -1*x -> -x)
    s = re.sub(r"(?<!\d)-1\*", "-", s)
    # Clean +1* -> + (e.g. +1*4 -> +4, +1*x -> +x)
    s = re.sub(r"(?<!\d)\+1\*", "+", s)
    # Clean 1* at start or after (=, +, -, *, /, ^, ()
    s = re.sub(r"(^|(?<=[=+\-*/^(]))1\*", r"\1", s)
    # Clean *1 before (=, +, -, *, /, ^, ), or end of string
    s = re.sub(r"\*1(?!\d)", "", s)
    # Clean any remaining 1* not preceded by a digit
    s = re.sub(r"(?<!\d)1\*", "", s)

    while "+-" in s:
        s = s.replace("+-", "-")
    while "-+" in s:
        s = s.replace("-+", "-")

    return normalise(s)


def _fmt(expr) -> str:
    """
    Format a SymPy expression back to student-style string.
    - Uses ^ for power (not **)
    - Drops '*' in implicit multiplications: 2*x -> 2x
    - Strips all spaces via normalise() so output is always compact
    - Removes '1*', '*1', and '+-' artifacts
    """
    s = str(expr)
    # SymPy uses ** for power -> convert to ^
    s = s.replace("**", "^")
    # 2*x -> 2x, but keep 2*3 as-is
    s = re.sub(r"(\d)\*([a-zA-Z])", r"\1\2", s)
    # x*2 -> 2x (SymPy rarely does this but be safe)
    s = re.sub(r"([a-zA-Z])\*(\d)", r"\2\1", s)
    return _clean_output(s)


# ---------------------------------------------------------------------------
# Pattern helpers
# ---------------------------------------------------------------------------

def _find_unevaluated_product(expr):
    """
    Return (coeff, bracket_expr) if expr is literally  coeff * (Add(...))
    OR contains such a term at the top level of an Add.
    Returns None if not found.
    """
    if isinstance(expr, Mul):
        args = expr.args
        nums = [a for a in args if isinstance(a, (Number, Integer, Rational)) and not isinstance(a, Symbol)]
        adds = [a for a in args if isinstance(a, Add)]
        if nums and adds:
            return nums[0], adds[0]
    if isinstance(expr, Add):
        for term in expr.args:
            result = _find_unevaluated_product(term)
            if result is not None:
                return result
    return None


def _find_squared_bracket(expr):
    """
    Return the base b if expr contains (b)^2 where b is an Add.
    Searches top-level and one level into Add/Mul.
    """
    def _check(e):
        if isinstance(e, Pow) and e.exp == 2 and isinstance(e.base, Add):
            return e.base
        return None

    r = _check(expr)
    if r is not None:
        return r
    if isinstance(expr, (Add, Mul)):
        for arg in expr.args:
            r = _check(arg)
            if r is not None:
                return r
    return None


def _find_neg_bracket(expr):
    """
    Return the bracket b if expr is literally -1 * (b) where b is an Add,
    parsed with evaluate=False. Handles -(x+4) as Mul(-1, Add(x,4)).
    """
    if isinstance(expr, Mul):
        args = list(expr.args)
        neg_ones = [a for a in args if a == Integer(-1)]
        adds = [a for a in args if isinstance(a, Add)]
        if neg_ones and adds:
            return adds[0]
    return None


# ---------------------------------------------------------------------------
# 1. PARTIAL_DISTRIBUTION
#    2(x+3)=14  ->  2x+3=14   (multiplies only the variable term)
# ---------------------------------------------------------------------------

def partial_distribution(prev_step: str):
    """
    Detect coeff*(var + const) and multiply only the variable term by coeff,
    leaving the constant un-multiplied (the misconception).
    """
    try:
        norm = normalise(prev_step)
        lhs_s, rhs_s = _split_equation(norm)
        if lhs_s is None:
            return None

        def _apply(side_str: str):
            expr = _parse(side_str)
            if expr is None:
                return side_str, False

            result = _find_unevaluated_product(expr)
            if result is None:
                return side_str, False

            coeff, bracket = result
            if not isinstance(bracket, Add):
                return side_str, False

            var_terms = [t for t in bracket.args if t.free_symbols]
            const_terms = [t for t in bracket.args if not t.free_symbols]
            if not var_terms or not const_terms:
                return side_str, False

            partial_result = Mul(coeff, Add(*var_terms), evaluate=True) + Add(*const_terms)

            # If the whole side IS the Mul node
            if isinstance(expr, Mul):
                return _fmt(partial_result), True
            # Additive context: replace just that Mul term
            mul_node = Mul(coeff, bracket, evaluate=False)
            remaining = expr - mul_node
            new_expr = remaining + partial_result
            return _fmt(new_expr), True

        new_lhs, l_changed = _apply(lhs_s)
        new_rhs, r_changed = _apply(rhs_s)

        if not l_changed and not r_changed:
            return None
        return _clean_output(f"{new_lhs}={new_rhs}")
    except Exception:
        return None


# ---------------------------------------------------------------------------
# 2. SQUARE_OF_SUM
#    (x+2)^2=25  ->  x^2+4=25   (forgets 2ab cross-term)
# ---------------------------------------------------------------------------

def square_of_sum(prev_step: str):
    """
    Detect (a + b)^2 and expand as a^2 + b^2 (dropping the 2ab term).
    """
    try:
        norm = normalise(prev_step)
        lhs_s, rhs_s = _split_equation(norm)
        if lhs_s is None:
            return None

        def _apply(side_str: str):
            expr = _parse(side_str)
            if expr is None:
                return side_str, False

            base = _find_squared_bracket(expr)
            if base is None:
                return side_str, False

            # Wrong expansion: square each term individually
            wrong = Add(*[t**2 for t in base.args], evaluate=True)

            original_pow = Pow(base, 2, evaluate=False)
            # If the whole side is (base)^2
            if isinstance(expr, Pow) and expr.base == base and expr.exp == 2:
                return _fmt(wrong), True
            new_expr = expr.subs(original_pow, wrong)
            return _fmt(new_expr), True

        new_lhs, l_changed = _apply(lhs_s)
        new_rhs, r_changed = _apply(rhs_s)

        if not l_changed and not r_changed:
            return None
        return _clean_output(f"{new_lhs}={new_rhs}")
    except Exception:
        return None


# ---------------------------------------------------------------------------
# 3. NEGATIVE_DISTRIBUTION
#    -(x+4)=6      ->  -x+4=6      (minus on first term only)
#    3-(x+2)=10   ->  3-x+2=10    (handles binary subtraction of bracket)
#    7-(2x-1)=4   ->  7-2x-1=4
#    -(2x+5)=1    ->  -2x+5=1     (original term order preserved)
# ---------------------------------------------------------------------------

def _split_inner_terms(s: str) -> list:
    """
    Split a flat infix string like '2x+5', 'x-2', '2x-1+y' into a list of
    signed term strings preserving original order.

    E.g.  'x+4'   -> ['x', '+4']
          '2x-1'  -> ['2x', '-1']
          'x+y-3' -> ['x', '+y', '-3']

    Only splits on '+' or '-' that are NOT inside parentheses and NOT
    immediately after '^' (so '2^-1' stays intact, though students rarely
    write that).
    """
    terms = []
    current = []
    depth = 0
    for i, c in enumerate(s):
        if c == '(':
            depth += 1
            current.append(c)
        elif c == ')':
            depth -= 1
            current.append(c)
        elif c in '+-' and depth == 0 and i > 0 and s[i - 1] != '^':
            terms.append(''.join(current))
            current = [c]
        else:
            current.append(c)
    if current:
        terms.append(''.join(current))
    return terms


def _negate_term_str(t: str) -> str:
    """Negate a single signed term string, e.g. 'x' -> '-x', '+4' -> '-4', '-1' -> '+1'."""
    if t.startswith('+'):
        return '-' + t[1:]
    elif t.startswith('-'):
        return '+' + t[1:]
    else:  # implicit positive, no sign prefix
        return '-' + t


def negative_distribution(prev_step: str):
    """
    Detect  -(bracket)  anywhere in the equation — including after digits
    like '3-(x+2)' — and apply the misconception: negate ONLY the first
    term inside the bracket; all other terms keep their original sign.

    Works entirely on the normalised string to preserve student term order.
    Never raises; returns None if the pattern is not found.
    """
    try:
        norm = normalise(prev_step)
        lhs_s, rhs_s = _split_equation(norm)
        if lhs_s is None:
            return None

        def _apply_string(side_str: str):
            """
            Scan for  -(  at any position (the '-' may follow a digit, ')'
            or operator). Find the matching ')'. Split the inner content
            into signed terms, negate the first, keep the rest unchanged.
            Return (new_side_str, True) or (side_str, False).
            """
            pos = 0
            while pos < len(side_str):
                idx = side_str.find('-(',  pos)
                if idx == -1:
                    break

                # Skip if '-(' is itself inside an exponent context, e.g. '^-(...)'
                if idx > 0 and side_str[idx - 1] == '^':
                    pos = idx + 1
                    continue

                # Find the matching ')'
                depth = 0
                end = -1
                for k in range(idx + 1, len(side_str)):
                    if side_str[k] == '(':
                        depth += 1
                    elif side_str[k] == ')':
                        depth -= 1
                        if depth == 0:
                            end = k
                            break
                if end == -1:
                    pos = idx + 1
                    continue

                inner = side_str[idx + 2 : end]  # text between the parens
                if not inner:
                    pos = idx + 1
                    continue

                terms = _split_inner_terms(inner)
                # Need at least 2 terms for the misconception to make sense
                if len(terms) < 2:
                    pos = idx + 1
                    continue

                # Misconception: negate first term, all others unchanged
                neg_first = _negate_term_str(terms[0])
                # Remaining terms already carry their sign ('+4', '-1', etc.)
                rest = ''.join(terms[1:])
                replacement = neg_first + rest   # e.g. '-x+4', '-2x-1'

                # The '-' that preceded '(' is CONSUMED into replacement.
                # Everything before the '-' is the prefix.
                prefix = side_str[:idx]
                suffix = side_str[end + 1:]

                # If prefix ends with something that was a binary operator
                # (digit, letter, ')'), the student would write:
                #   prefix + replacement  (the '-' was the operator, now gone
                #   and the replacement starts with its own sign)
                # But when prefix ends with '+'/'-'/'*'/'/' or is empty, just concat.
                # Specific case: '3-(x+2)' -> prefix='3', replacement='-x+2'
                #   -> '3' + '-x+2' = '3-x+2'  ✓
                new_side = prefix + replacement + suffix
                return normalise(new_side), True

            return side_str, False

        new_lhs, l_changed = _apply_string(lhs_s)
        new_rhs, r_changed = _apply_string(rhs_s)

        if not l_changed and not r_changed:
            return None
        return _clean_output(f"{new_lhs}={new_rhs}")
    except Exception:
        return None


# ---------------------------------------------------------------------------
# 4. TRANSPOSITION
#    x+5=10  ->  x=10+5   (moves term without flipping sign)
# ---------------------------------------------------------------------------

def transposition(prev_step: str):
    """
    Find a constant additive term on the LHS and move it to the RHS
    WITHOUT negating it (the misconception).
    E.g. x+5=10 -> x=10+5
         x-4=9  -> x=9-4
    """
    try:
        norm = normalise(prev_step)
        lhs_s, rhs_s = _split_equation(norm)
        if lhs_s is None:
            return None

        lhs_expr = _parse(lhs_s)
        rhs_expr = _parse(rhs_s)
        if lhs_expr is None or rhs_expr is None:
            return None

        if not isinstance(lhs_expr, Add):
            return None

        # Split LHS into signed terms preserving original order
        terms = _split_inner_terms(lhs_s)
        const_indices = [i for i, t in enumerate(terms) if not re.search(r"[a-zA-Z]", t)]
        var_indices = [i for i, t in enumerate(terms) if re.search(r"[a-zA-Z]", t)]

        if not const_indices or not var_indices:
            return None

        # Move the first constant term across to RHS
        c_idx = const_indices[0]
        c_tok = terms[c_idx]

        rem_terms = [t for i, t in enumerate(terms) if i != c_idx]
        if not rem_terms:
            return None

        rem_lhs = "".join(rem_terms)
        if rem_lhs.startswith("+"):
            rem_lhs = rem_lhs[1:]

        # Student appends the term to RHS without changing sign
        # e.g. rhs_s='9', c_tok='-4' -> '9-4'
        # e.g. rhs_s='10', c_tok='+5' -> '10+5'
        # e.g. rhs_s='10', c_tok='5' -> '10+5'
        if c_tok.startswith("+") or c_tok.startswith("-"):
            new_rhs = rhs_s + c_tok
        else:
            new_rhs = rhs_s + "+" + c_tok

        return _clean_output(f"{rem_lhs}={new_rhs}")
    except Exception:
        return None


# ---------------------------------------------------------------------------
# 5. UNLIKE_TERMS
#    3x+5=16  ->  8x=16   (adds x-coefficient with constant)
# ---------------------------------------------------------------------------

def unlike_terms(prev_step: str):
    """
    Detect a*x + b = c and produce (a+b)*x = c (merging unlike terms).
    """
    try:
        norm = normalise(prev_step)
        lhs_s, rhs_s = _split_equation(norm)
        if lhs_s is None:
            return None

        lhs_expr = _parse(lhs_s)
        rhs_expr = _parse(rhs_s)
        if lhs_expr is None or rhs_expr is None:
            return None

        if not isinstance(lhs_expr, Add):
            return None

        const_terms = [t for t in lhs_expr.args if not t.free_symbols]
        var_terms = [t for t in lhs_expr.args if t.free_symbols]

        if len(var_terms) != 1 or len(const_terms) != 1:
            return None

        var_term = var_terms[0]
        const_term = const_terms[0]

        var_syms = list(var_term.free_symbols)
        if len(var_syms) != 1:
            return None
        v = var_syms[0]

        coeff = (var_term / v).doit()
        if not coeff.is_number:
            return None

        const_val = const_term.doit()
        if not const_val.is_number:
            return None

        wrong_coeff = coeff + const_val
        wrong_lhs = Mul(wrong_coeff, v, evaluate=True)

        return _clean_output(f"{_fmt(wrong_lhs)}={_fmt(rhs_expr)}")
    except Exception:
        return None


# ---------------------------------------------------------------------------
# 6. NEG_TIMES_NEG
#    (-2)(-3x)=12  ->  -6x=12  (thinks neg * neg = neg)
# ---------------------------------------------------------------------------

def neg_times_neg(prev_step: str):
    """
    Detect a product of two negative factors and flip the sign of the correct
    result (positive -> negative), simulating the misconception:
    (-2)(-3x)=12  ->  -6x=12
    (-3)(-x)=9    ->  -3x=9
    (-x)(-4)=8    ->  -4x=8
    (-5)(-2)=y    ->  -10=y
    """
    try:
        norm = normalise(prev_step)
        lhs_s, rhs_s = _split_equation(norm)
        if lhs_s is None:
            return None

        def _apply(side_str: str):
            expr = _parse(side_str)
            if expr is None:
                return side_str, False

            if not isinstance(expr, Mul):
                return side_str, False

            neg_factors = []
            for a in expr.args:
                try:
                    coeff, _ = a.as_coeff_Mul()
                    if coeff < 0:
                        neg_factors.append(a)
                except Exception:
                    pass

            if len(neg_factors) < 2:
                return side_str, False

            correct = expr.doit()
            wrong = -correct
            return _fmt(wrong), True

        new_lhs, l_changed = _apply(lhs_s)
        new_rhs, r_changed = _apply(rhs_s)

        if not l_changed and not r_changed:
            return None
        return _clean_output(f"{new_lhs}={new_rhs}")
    except Exception:
        return None


# ---------------------------------------------------------------------------
# 7. ARITHMETIC_SLIP
#    One numeric literal shifted by +/-1, +/-2, or +/-3.
#    Deterministic when given a random.Random(seed).
# ---------------------------------------------------------------------------

def arithmetic_slip(prev_step: str, rng=None):
    """
    Find all integer literals in the equation, pick one, and shift it by
    +/-1, +/-2, or +/-3.

    Pass a random.Random instance as `rng` for deterministic behaviour.
    """
    try:
        if rng is None:
            rng = _random_module

        norm = normalise(prev_step)

        tokens = list(re.finditer(r"(?<![a-zA-Z])(\d+)", norm))
        if not tokens:
            return None

        token = rng.choice(tokens)
        original = int(token.group(1))
        delta = rng.choice([-3, -2, -1, 1, 2, 3])
        replacement = original + delta

        # Keep replacement positive to avoid producing ill-formed equations
        if replacement <= 0:
            replacement = original + abs(delta)
        if replacement == original:
            replacement = original + 1

        start, end = token.span(1)
        new_norm = norm[:start] + str(replacement) + norm[end:]
        return _clean_output(new_norm)
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Public registry
# ---------------------------------------------------------------------------

GENERATORS = {
    "PARTIAL_DISTRIBUTION": partial_distribution,
    "SQUARE_OF_SUM": square_of_sum,
    "NEGATIVE_DISTRIBUTION": negative_distribution,
    "TRANSPOSITION": transposition,
    "UNLIKE_TERMS": unlike_terms,
    "NEG_TIMES_NEG": neg_times_neg,
    "ARITHMETIC_SLIP": arithmetic_slip,
}

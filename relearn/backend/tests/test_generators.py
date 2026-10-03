import random
import re
import pytest
from backend.engine.generators import (
    GENERATORS, arithmetic_slip, neg_times_neg, negative_distribution,
    partial_distribution, square_of_sum, transposition, unlike_terms,
)


def _strip(s):
    return re.sub(r'\s+', '', s) if s else s


class TestPartialDistribution:
    def test_canonical_example(self):
        result = partial_distribution('2(x+3)=14')
        assert result is not None
        assert _strip(result) == '2x+3=14'

    def test_different_equation(self):
        result = partial_distribution('5(x-2)=20')
        assert result is not None
        norm = _strip(result)
        assert '5x' in norm and '-10' not in norm

    def test_none_case(self):
        assert partial_distribution('x+3=14') is None


class TestSquareOfSum:
    def test_canonical_example(self):
        result = square_of_sum('(x+2)^2=25')
        assert result is not None
        norm = _strip(result)
        assert 'x^2' in norm and '4' in norm and '4x' not in norm

    def test_different_equation(self):
        result = square_of_sum('(x+3)^2=49')
        assert result is not None
        norm = _strip(result)
        assert 'x^2' in norm and '9' in norm and '6x' not in norm

    def test_none_case(self):
        assert square_of_sum('x+2=5') is None


class TestNegativeDistribution:
    def test_canonical_example(self):
        # -(x+4)=6  ->  -x+4=6  (original from PLAN.md)
        result = negative_distribution('-(x+4)=6')
        assert result == '-x+4=6'

    def test_different_equation(self):
        # -(x+7)=3  ->  -x+7=3
        result = negative_distribution('-(x+7)=3')
        assert result is not None
        norm = _strip(result)
        assert '-x' in norm and '7' in norm and '-7' not in norm

    # ---- new cases from the bug report ----

    def test_subtraction_from_bracket(self):
        # 3-(x+2)=10  ->  3-x+2=10   (preceded by digit, previously None)
        result = negative_distribution('3-(x+2)=10')
        assert result == '3-x+2=10'

    def test_subtraction_with_subtraction_inside(self):
        # 7-(2x-1)=4  ->  7-2x-1=4  (inner minus kept)
        result = negative_distribution('7-(2x-1)=4')
        assert result == '7-2x-1=4'

    def test_chain_with_bracket(self):
        # x+5-(x+1)=2  ->  x+5-x+1=2  (only the bracket changes)
        result = negative_distribution('x+5-(x+1)=2')
        assert result == 'x+5-x+1=2'

    def test_term_order_preserved(self):
        # -(2x+5)=1  ->  -2x+5=1  (NOT 5-2x=1)
        result = negative_distribution('-(2x+5)=1')
        assert result == '-2x+5=1'

    def test_none_case(self):
        assert negative_distribution('x+4=6') is None


class TestTransposition:
    def test_canonical_example(self):
        result = transposition('x+5=10')
        assert result is not None
        norm = _strip(result)
        lhs, rhs = norm.split('=')
        assert 'x' in lhs and '10' in rhs and '5' in rhs

    def test_different_equation(self):
        result = transposition('x+8=15')
        assert result is not None
        norm = _strip(result)
        lhs, rhs = norm.split('=')
        assert 'x' in lhs and '15' in rhs and '8' in rhs

    def test_subtraction(self):
        # x-4=9  ->  x=9-4  (moves -4 without flipping sign, no 1* or +- artifacts)
        result = transposition('x-4=9')
        assert result == 'x=9-4'

    def test_none_case(self):
        assert transposition('x=10') is None


class TestUnlikeTerms:
    def test_canonical_example(self):
        result = unlike_terms('3x+5=16')
        assert result is not None
        assert _strip(result) == '8x=16'

    def test_different_equation(self):
        result = unlike_terms('4x+2=10')
        assert result is not None
        assert '6x' in _strip(result)

    def test_none_case(self):
        assert unlike_terms('3x=16') is None


class TestNegTimesNeg:
    def test_canonical_example(self):
        result = neg_times_neg('(-2)(-3x)=12')
        assert result is not None
        norm = _strip(result)
        lhs, _ = norm.split('=')
        assert lhs.startswith('-') and '6x' in lhs

    def test_different_equation(self):
        result = neg_times_neg('(-3)(-4x)=36')
        assert result is not None
        norm = _strip(result)
        lhs, _ = norm.split('=')
        assert lhs.startswith('-') and '12x' in lhs

    def test_bare_negative_variable(self):
        # (-3)(-x)=9  ->  -3x=9  (treat bare variable as coeff 1)
        assert neg_times_neg('(-3)(-x)=9') == '-3x=9'

    def test_bare_variable_first(self):
        # (-x)(-4)=8  ->  -4x=8
        assert neg_times_neg('(-x)(-4)=8') == '-4x=8'

    def test_two_negative_constants_rhs_variable(self):
        # (-5)(-2)=y  ->  -10=y
        assert neg_times_neg('(-5)(-2)=y') == '-10=y'

    def test_none_case(self):
        assert neg_times_neg('(-2)(3x)=12') is None


class TestArithmeticSlip:
    def test_canonical_example(self):
        result = arithmetic_slip('3x+5=16', random.Random(42))
        assert result is not None and result != '3x+5=16'

    def test_different_equation(self):
        result = arithmetic_slip('2x+4=18', random.Random(7))
        assert result is not None and result != '2x+4=18'

    def test_deterministic(self):
        r1 = arithmetic_slip('5x+3=28', random.Random(99))
        r2 = arithmetic_slip('5x+3=28', random.Random(99))
        assert r1 == r2

    def test_none_case(self):
        assert arithmetic_slip('x=x', random.Random(1)) is None


def test_generators_registry_keys():
    expected = {
        'PARTIAL_DISTRIBUTION', 'SQUARE_OF_SUM', 'NEGATIVE_DISTRIBUTION',
        'TRANSPOSITION', 'UNLIKE_TERMS', 'NEG_TIMES_NEG', 'ARITHMETIC_SLIP',
    }
    assert set(GENERATORS.keys()) == expected


def test_generators_registry_callables():
    for label, fn in GENERATORS.items():
        assert callable(fn), f'{label} not callable'


# ---------------------------------------------------------------------------
# Output format: all generators must return space-free student-style strings
# ---------------------------------------------------------------------------

def test_all_outputs_have_no_spaces():
    """No generator may return a string containing whitespace."""
    inputs = {
        'PARTIAL_DISTRIBUTION': '2(x+3)=14',
        'SQUARE_OF_SUM':        '(x+2)^2=25',
        'NEGATIVE_DISTRIBUTION': '-(x+4)=6',
        'TRANSPOSITION':         'x+5=10',
        'UNLIKE_TERMS':          '3x+5=16',
        'NEG_TIMES_NEG':         '(-2)(-3x)=12',
        'ARITHMETIC_SLIP':       '3x+5=16',
    }
    import random
    rng = random.Random(0)
    for label, eq in inputs.items():
        fn = GENERATORS[label]
        result = fn(eq, rng) if label == 'ARITHMETIC_SLIP' else fn(eq)
        assert result is not None, f'{label} returned None on {eq!r}'
        assert ' ' not in result, (
            f'{label}({eq!r}) contains a space: {result!r}'
        )


def test_no_generator_outputs_artifacts_or_spaces():
    """
    Loop over every generator on 10 different equations and check
    that no output contains '1*', '*1', '+-', or spaces.
    """
    equations = [
        '2(x+3)=14',
        '(x+2)^2=25',
        '-(x+4)=6',
        '3-(x+2)=10',
        'x-4=9',
        'x+5=10',
        '3x+5=16',
        '(-3)(-x)=9',
        '(-x)(-4)=8',
        '(-5)(-2)=y',
    ]
    rng = random.Random(42)
    for label, fn in GENERATORS.items():
        for eq in equations:
            res = fn(eq, rng) if label == 'ARITHMETIC_SLIP' else fn(eq)
            if res is not None:
                assert '1*' not in res, f"{label} on {eq!r} produced '1*': {res!r}"
                assert '*1' not in res, f"{label} on {eq!r} produced '*1': {res!r}"
                assert '+-' not in res, f"{label} on {eq!r} produced '+-': {res!r}"
                assert ' ' not in res, f"{label} on {eq!r} produced spaces: {res!r}"

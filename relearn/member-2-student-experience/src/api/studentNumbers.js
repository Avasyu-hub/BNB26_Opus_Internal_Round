/**
 * Pulls the student's own numbers out of a question, for each misconception.
 * Returns two things:
 *   template  - the placeholders Member 4's explanation templates use
 *               (factor, term1, term2, product, ...), sent to POST /intervention
 *   animation - the params Member 3's visual proofs use (k, v, c, a, b, ...)
 * If the question does not match the expected shape, both are {} and the
 * templates / animations fall back to their own defaults.
 *
 * Pure function (no browser APIs) so it can be tested with plain Node.
 */
const N = '(-?\\d+)';
const V = '([a-z])';
const TERM = '(\\d*[a-z])'; // a variable term with an optional coefficient: x, 2x, 3a

function match(math, pattern) {
  const m = math.replace(/\s+/g, '').match(new RegExp(pattern));
  return m ? m.slice(1) : null;
}

export function studentNumbers(label, math = '') {
  switch (label) {
    case 'PARTIAL_DISTRIBUTION': {
      // k(x ± c) or k(nx ± c)   e.g. 3(x+4)=21, 2(3x+4)=26
      const m = match(math, `${N}\\(${TERM}([+-])(\\d+)\\)`);
      if (!m) break;
      const [k, v, sign, c] = [Number(m[0]), m[1], m[2], Number(m[3])];
      const cc = sign === '-' ? -c : c;
      return {
        template: { factor: k, term1: v, term2: cc, product: k * cc },
        animation: { k, v, c: cc },
      };
    }
    case 'SQUARE_OF_SUM': {
      // (x ± b)^2, (nx ± b)^2 or (a + b)^2   e.g. (x+5)^2, (2x+3)^2
      const letters = match(math, `\\(${V}\\+${V}\\)\\^2`);
      if (letters) {
        const [a, b] = letters;
        return { template: { term1: a, term2: b, middle_term: `2${a}${b}` }, animation: { a, b } };
      }
      const m = match(math, `\\(${TERM}([+-])(\\d+)\\)\\^2`);
      if (!m) break;
      const [t, sign, b] = [m[0], m[1], Number(m[2])];
      const bb = sign === '-' ? -b : b;
      const n = t.length > 1 ? Number(t.slice(0, -1)) : 1;
      const v = t.slice(-1);
      return {
        template: { term1: t, term2: bb, middle_term: `${2 * n * bb}${v}` },
        animation: { a: t, b: String(bb) },
      };
    }
    case 'NEGATIVE_DISTRIBUTION': {
      // -(x ± c) or -(nx ± c)   e.g. -(x+4)=6, 3-(2x-4)=15
      const m = match(math, `-\\(${TERM}([+-])(\\d+)\\)`);
      if (!m) break;
      const [v, sign, c] = [m[0], m[1], Number(m[2])];
      const cc = sign === '-' ? -c : c;
      return { template: { term1: v, term2: cc }, animation: { v, c: cc } };
    }
    case 'TRANSPOSITION': {
      // x ± c = r or nx ± c = r   e.g. x+5=12, 2x+8=20
      const m = match(math, `${TERM}([+-])(\\d+)=${N}`);
      if (!m) break;
      const [v, sign, c, r] = [m[0], m[1], Number(m[2]), Number(m[3])];
      const cc = sign === '-' ? -c : c;
      return { template: { term: cc }, animation: { v, c: cc, r } };
    }
    case 'UNLIKE_TERMS': {
      // nx + m   e.g. 3x+5 or 4x+7=23
      const m = match(math, `(\\d*)${V}\\+(\\d+)`);
      if (!m) break;
      const [n, v, k] = [m[0] === '' ? 1 : Number(m[0]), m[1], Number(m[2])];
      return {
        template: { term1: `${n === 1 ? '' : n}${v}`, term2: k, wrong_combined: `${n + k}${v}` },
        animation: { n, m: k, v },
      };
    }
    case 'NEG_TIMES_NEG': {
      // (-a)(-b) or (-a)*(-bx)   e.g. (-3)*(-4), (-2)(-4x)=16
      const m = match(math, `\\((-\\d+)\\)\\*?\\((-\\d*)([a-z]?)\\)`);
      if (!m) break;
      const a = Number(m[0]);
      const b = m[1] === '-' ? -1 : Number(m[1]);
      const v = m[2] || '';
      return {
        template: { factor1: a, factor2: `${b}${v}`, positive_product: `${a * b}${v}`, negative_product: `${-a * b}${v}` },
        animation: { rate: a, hours: b },
      };
    }
    default:
      break;
  }
  return { template: {}, animation: {} };
}

// ---------------------------------------------------------------------------
// "Your step vs the correct step" in LaTeX, built from the same numbers.
// Returns null when the question does not match, so the screen keeps its
// generic example.
const RED = (t) => `\\color{#E5484D}{${t}}`;
const GREEN = (t) => `\\mathbf{\\color{#22B573}{${t}}}`;
const signed = (n) => (n < 0 ? `- ${-n}` : `+ ${n}`);
const coeffOf = (term) => {
  const c = String(term).slice(0, -1);
  return c === '' ? 1 : c === '-' ? -1 : Number(c);
};
const mono = (k, v) => (k === 1 ? v : k === -1 ? `-${v}` : `${k}${v}`);

export function stepComparison(label, math = '') {
  const { animation: a } = studentNumbers(label, math);
  if (!a || Object.keys(a).length === 0) return null;
  switch (label) {
    case 'PARTIAL_DISTRIBUTION': {
      const v = String(a.v).slice(-1);
      const kv = mono(a.k * coeffOf(a.v), v);
      const start = `${a.k}(${a.v} ${signed(a.c)})`;
      return { yours: `${start} \\implies ${kv} ${RED(signed(a.c))}`, correct: `${start} \\implies ${kv} ${GREEN(signed(a.k * a.c))}` };
    }
    case 'SQUARE_OF_SUM': {
      if (!/\d/.test(String(a.b))) {
        return { yours: `(${a.a} + ${a.b})^2 \\implies ${a.a}^2 + ${a.b}^2`, correct: `(${a.a} + ${a.b})^2 \\implies ${a.a}^2 ${GREEN(`+ 2${a.a}${a.b}`)} + ${a.b}^2` };
      }
      const b = Number(a.b), n = coeffOf(a.a), v = String(a.a).slice(-1);
      const sq = `${n * n === 1 ? '' : n * n}${v}^2`;
      const start = `(${a.a} ${signed(b)})^2`;
      return { yours: `${start} \\implies ${sq} ${RED(`+ ${b * b}`)}`, correct: `${start} \\implies ${sq} ${GREEN(signed(2 * n * b) + v)} + ${b * b}` };
    }
    case 'NEGATIVE_DISTRIBUTION': {
      const start = `-(${a.v} ${signed(a.c)})`;
      return { yours: `${start} \\implies -${a.v} ${RED(signed(a.c))}`, correct: `${start} \\implies -${a.v} ${GREEN(signed(-a.c))}` };
    }
    case 'TRANSPOSITION': {
      const start = `${a.v} ${signed(a.c)} = ${a.r}`;
      return { yours: `${start} \\implies ${a.v} = ${a.r} ${RED(signed(a.c))}`, correct: `${start} \\implies ${a.v} = ${a.r} ${GREEN(signed(-a.c))}` };
    }
    case 'UNLIKE_TERMS': {
      const start = `${mono(a.n, a.v)} + ${a.m}`;
      return { yours: `${start} \\implies ${RED(mono(a.n + a.m, a.v))}`, correct: `${start} \\implies ${GREEN(start)} \\text{ (cannot combine)}` };
    }
    case 'NEG_TIMES_NEG': {
      const { template: t } = studentNumbers(label, math); // keeps the variable: (-4)(-3x) -> 12x
      const start = `(${t.factor1})(${t.factor2})`;
      return { yours: `${start} \\implies ${RED(t.negative_product)}`, correct: `${start} \\implies ${GREEN(t.positive_product)}` };
    }
    default:
      return null;
  }
}

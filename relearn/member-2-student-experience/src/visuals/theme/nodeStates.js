// Shared visual contract for Re:Learn (Member 3). Colours match the design system.

export const NODE_STATES = {
  inactive:          { color: '#64748b', label: 'Inactive' },
  detected:          { color: '#f97316', label: 'Detected' },
  resolved_algebra:  { color: '#3b82f6', label: 'Resolved in algebra' },
  transfer_in_progress: { color: '#3b82f6', label: 'Transfer 1 of 2 ✓' },
  transfer_verified: { color: '#22c55e', label: 'Transfer verified ✓' },
  transfer_failed:   { color: '#ef4444', label: 'Persists in new context ✗' },
  recurred:          { color: '#a855f7', label: 'Recurred' },
  teacher_flagged:   { color: '#f59e0b', label: 'Flagged for teacher' },
};

export const ROOT_CONCEPTS = {
  DISTRIBUTIVE_LAW: { label: 'Distributive law' },
  INTEGER_RULES:    { label: 'Integer rules' },
  EQUALITY_BALANCE: { label: 'Equality as balance' },
  LIKE_TERMS:       { label: 'Like terms' },
};

// Contract 6.1 — misconception ⟷ root concept(s)
export const MISCONCEPTIONS = {
  PARTIAL_DISTRIBUTION:  { label: 'Partial distribution',  example: '2(x+3) → 2x+3',     roots: ['DISTRIBUTIVE_LAW'] },
  SQUARE_OF_SUM:         { label: 'Square of a sum',       example: '(a+b)² → a²+b²',    roots: ['DISTRIBUTIVE_LAW'] },
  NEGATIVE_DISTRIBUTION: { label: 'Negative distribution', example: '−(x+5) → −x+5',     roots: ['DISTRIBUTIVE_LAW', 'INTEGER_RULES'] },
  NEG_TIMES_NEG:         { label: 'Negative × negative',   example: '(−3)(−4) → −12',    roots: ['INTEGER_RULES'] },
  TRANSPOSITION:         { label: 'Transposition',         example: 'x+5=10 → x=10+5',   roots: ['EQUALITY_BALANCE'] },
  UNLIKE_TERMS:          { label: 'Unlike terms',          example: '3x+5 → 8x',         roots: ['LIKE_TERMS'] },
};

// Extra labels that appear only in the model output / eval views
export const EXTRA_LABELS = {
  ARITHMETIC_SLIP: { label: 'Arithmetic slip' },
  UNKNOWN:         { label: 'Unknown' },
  NONE:            { label: 'No mistake' },
};

export const labelOf = (id) =>
  MISCONCEPTIONS[id]?.label ?? EXTRA_LABELS[id]?.label ?? ROOT_CONCEPTS[id]?.label ?? id;

// Palette for the SVG proofs (dark surface)
export const INK = {
  line: '#94a3b8', faint: '#334155', text: '#e2e8f0', muted: '#94a3b8',
  blue: '#3b82f6', orange: '#f97316', green: '#22c55e', red: '#ef4444',
  violet: '#a855f7', amber: '#f59e0b', yellow: '#facc15',
};

export const MATH_FONT = "'Cambria Math', 'STIX Two Math', Cambria, Georgia, serif";

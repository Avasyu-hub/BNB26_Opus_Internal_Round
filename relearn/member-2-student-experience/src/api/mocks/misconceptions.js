/**
 * The six misconceptions Re:Learn diagnoses, keyed by the short UI ids used
 * across the screens. `label` is the backend taxonomy label (team contract);
 * backendAdapter.js translates between the two.
 */
export const MISCONCEPTIONS = {
  M1: {
    id: 'M1',
    code: 'M1',
    label: 'TRANSPOSITION',
    name: 'Sign Change on Transposition',
    description: 'Moving a term across the equals sign without changing its sign (e.g. x + 5 = 10 => x = 10 + 5).',
    category: 'Equation Balance',
    remediationStrategy: 'Balance Scale Visualization',
  },
  M2: {
    id: 'M2',
    code: 'M2',
    label: 'PARTIAL_DISTRIBUTION',
    name: 'Distributive Property Neglect',
    description: 'Multiplying only the first term inside the bracket (e.g. 3(x + 4) => 3x + 4).',
    category: 'Distribution & Grouping',
    remediationStrategy: 'Area Model Decomposition',
  },
  M3: {
    id: 'M3',
    code: 'M3',
    label: 'NEGATIVE_DISTRIBUTION',
    name: 'Minus Sign Before a Bracket',
    description: 'Changing the sign of only the first term when removing a minus before a bracket (e.g. -(x + 4) => -x + 4).',
    category: 'Distribution & Signs',
    remediationStrategy: 'Number Line Reflection',
  },
  M4: {
    id: 'M4',
    code: 'M4',
    label: 'SQUARE_OF_SUM',
    name: 'Squaring a Bracket Term by Term',
    description: 'Squaring each term separately and losing the middle term (e.g. (x + 3)^2 => x^2 + 9).',
    category: 'Distribution & Grouping',
    remediationStrategy: 'Split Square Area Model',
  },
  M5: {
    id: 'M5',
    code: 'M5',
    label: 'UNLIKE_TERMS',
    name: 'Unlike Terms Combination',
    description: 'Adding an x-term and a number as if they were like terms (e.g. 3x + 5 => 8x).',
    category: 'Like Terms & Variable Identity',
    remediationStrategy: 'Algebra Tile Grouping',
  },
  M6: {
    id: 'M6',
    code: 'M6',
    label: 'NEG_TIMES_NEG',
    name: 'Negative Times Negative',
    description: 'Treating a negative times a negative as negative (e.g. (-2)(-3x) => -6x).',
    category: 'Integer Rules',
    remediationStrategy: 'Rate Pattern on a Number Line',
  },
  SLIP: {
    id: 'SLIP',
    code: 'SLIP',
    label: 'ARITHMETIC_SLIP',
    name: 'Calculation Slip',
    description: 'The method is right, but a calculation in this step is wrong.',
    category: 'Arithmetic',
    remediationStrategy: 'Re-check the calculation',
  },
};

export default MISCONCEPTIONS;

export const MISCONCEPTIONS = {
  M1: {
    id: 'M1',
    code: 'M1',
    name: 'Sign Change on Transposition',
    description: 'Failing to invert the sign when moving terms across the equals sign (e.g. 2x + 5 = 15 => 2x = 15 + 5).',
    category: 'Transposition & Inverse Operations',
    remediationStrategy: 'Balance Scale Visualization with Sign Inversion',
  },
  M2: {
    id: 'M2',
    code: 'M2',
    name: 'Distributive Property Neglect',
    description: 'Multiplying only the first term inside parentheses and omitting subsequent terms (e.g. 3(x + 4) => 3x + 4).',
    category: 'Distribution & Grouping',
    remediationStrategy: 'Area Model Decomposition',
  },
  M3: {
    id: 'M3',
    code: 'M3',
    name: 'Unbalanced Operations Across Equality',
    description: 'Applying an operation to one side of the equation without maintaining equality on the other side.',
    category: 'Equation Balance',
    remediationStrategy: 'Dual-Scale Equalizer Model',
  },
  M4: {
    id: 'M4',
    code: 'M4',
    name: 'Fraction / Division Term Isolation',
    description: 'Dividing only the variable term or a single constant rather than all terms across the polynomial.',
    category: 'Fractional & Multi-term Division',
    remediationStrategy: 'Term-by-Term Color Partitioning',
  },
  M5: {
    id: 'M5',
    code: 'M5',
    name: 'Unlike Terms Combination',
    description: 'Adding or subtracting terms with different variable powers or mixing constants with variable terms (e.g. 3x + 5 => 8x).',
    category: 'Like Terms & Variable Identity',
    remediationStrategy: 'Algebra Tile Grouping',
  },
  M6: {
    id: 'M6',
    code: 'M6',
    name: 'Order of Operations & Precedence Inversion',
    description: 'Inverting multiplication or exponents before resolving parenthetical groupings or addition/subtraction steps.',
    category: 'Precedence & Step Sequence',
    remediationStrategy: 'Hierarchical Step Unwrapping',
  },
};

export default MISCONCEPTIONS;

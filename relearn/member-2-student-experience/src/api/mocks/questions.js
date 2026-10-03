export const TOPICS = [
  {
    id: 'brackets',
    name: 'Brackets',
    misconceptionId: 'M2',
    typicalMistake: '2(x + 3) \\implies 2x + \\color{#E5484D}{3}',
  },
  {
    id: 'squaring-brackets',
    name: 'Squaring brackets',
    misconceptionId: 'M2',
    typicalMistake: '(x + 3)^2 \\implies x^2 + \\color{#E5484D}{9}',
  },
  {
    id: 'minus-signs-brackets',
    name: 'Minus signs and brackets',
    misconceptionId: 'M1',
    typicalMistake: '5 - (x + 3) \\implies 5 - x \\color{#E5484D}{+ 3}',
  },
  {
    id: 'moving-terms',
    name: 'Moving terms across =',
    misconceptionId: 'M1',
    typicalMistake: '2x + 5 = 15 \\implies 2x = 15 \\color{#E5484D}{+ 5}',
  },
  {
    id: 'adding-terms',
    name: 'Adding terms',
    misconceptionId: 'M5',
    typicalMistake: '3x + 5 \\implies \\color{#E5484D}{8x}',
  },
  {
    id: 'multiplying-negatives',
    name: 'Multiplying negatives',
    misconceptionId: 'M6',
    typicalMistake: '-3(x - 4) \\implies -3x \\color{#E5484D}{- 12}',
  },
];

export const MOCK_QUESTIONS = [
  // 1. Brackets
  {
    id: 'q1',
    topicId: 'brackets',
    topicName: 'Brackets',
    title: 'Linear equation with bracket distribution',
    latex: '2(x + 3) = 14',
    difficulty: 'Easy',
    status: 'Needs work', // from student history
    targetMisconceptions: ['M2'],
    expectedFinalAnswer: 'x = 4',
  },
  {
    id: 'q2',
    topicId: 'brackets',
    topicName: 'Brackets',
    title: 'Three-term bracket distribution',
    latex: '3(2x - 5) = 27',
    difficulty: 'Medium',
    status: 'Not tried',
    targetMisconceptions: ['M2', 'M1'],
    expectedFinalAnswer: 'x = 7',
  },

  // 2. Squaring brackets
  {
    id: 'q3',
    topicId: 'squaring-brackets',
    topicName: 'Squaring brackets',
    title: 'Squaring a binomial expansion',
    latex: '(x + 4)^2 = 36',
    difficulty: 'Hard',
    status: 'Not tried',
    targetMisconceptions: ['M2'],
    expectedFinalAnswer: 'x = 2',
  },

  // 3. Minus signs and brackets
  {
    id: 'q4',
    topicId: 'minus-signs-brackets',
    topicName: 'Minus signs and brackets',
    title: 'Preceding subtraction before brackets',
    latex: '8 - 2(x + 1) = 2',
    difficulty: 'Medium',
    status: 'Fixed in algebra',
    targetMisconceptions: ['M1', 'M2'],
    expectedFinalAnswer: 'x = 2',
  },

  // 4. Moving terms across =
  {
    id: 'q5',
    topicId: 'moving-terms',
    topicName: 'Moving terms across =',
    title: 'Variables on both sides',
    latex: '4x + 9 = 2x + 25',
    difficulty: 'Medium',
    status: 'Understood everywhere ✓',
    targetMisconceptions: ['M1', 'M3'],
    expectedFinalAnswer: 'x = 8',
  },
  {
    id: 'q6',
    topicId: 'moving-terms',
    topicName: 'Moving terms across =',
    title: 'Two-step equation transposition',
    latex: '5x - 7 = 18',
    difficulty: 'Easy',
    status: 'Fixed in algebra',
    targetMisconceptions: ['M1'],
    expectedFinalAnswer: 'x = 5',
  },

  // 5. Adding terms
  {
    id: 'q7',
    topicId: 'adding-terms',
    topicName: 'Adding terms',
    title: 'Combining multiple variable terms',
    latex: '7x - 3x + 8 = 24',
    difficulty: 'Easy',
    status: 'Understood everywhere ✓',
    targetMisconceptions: ['M5'],
    expectedFinalAnswer: 'x = 4',
  },

  // 6. Multiplying negatives
  {
    id: 'q8',
    topicId: 'multiplying-negatives',
    topicName: 'Multiplying negatives',
    title: 'Negative multiplier with inner subtraction',
    latex: '-3(x - 5) = 21',
    difficulty: 'Medium',
    status: 'Not tried',
    targetMisconceptions: ['M6', 'M1'],
    expectedFinalAnswer: 'x = -2',
  },
];

export default MOCK_QUESTIONS;

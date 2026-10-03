export const MOCK_HISTORY = [
  {
    attemptId: 'att_101',
    studentId: 'student_1',
    questionId: 'q1',
    timestamp: '2026-10-02T10:14:00Z',
    status: 'diagnosed',
    diagnosedMisconceptions: ['M2'],
    steps: [
      { stepNumber: 1, rawInput: '3x + 4 = 27', isCorrect: false, errorType: 'M2', explanation: 'Did not distribute 3 to 4' },
      { stepNumber: 2, rawInput: '3x = 23', isCorrect: true },
      { stepNumber: 3, rawInput: 'x = 23/3', isCorrect: true },
    ],
    isResolved: true,
    transferAccuracy: 100,
  },
  {
    attemptId: 'att_102',
    studentId: 'student_1',
    questionId: 'q2',
    timestamp: '2026-10-03T14:30:00Z',
    status: 'completed',
    diagnosedMisconceptions: [],
    steps: [
      { stepNumber: 1, rawInput: '5x = 25', isCorrect: true },
      { stepNumber: 2, rawInput: 'x = 5', isCorrect: true },
    ],
    isResolved: true,
    transferAccuracy: 100,
  },
];

export const MOCK_CLASS_SUMMARY = {
  totalStudents: 28,
  activeRemediations: 6,
  averageMastery: 78.4,
  misconceptionBreakdown: [
    { misconceptionId: 'M1', name: 'Sign Change on Transposition', affectedCount: 11, resolvedCount: 8, resolutionRate: 72.7 },
    { misconceptionId: 'M2', name: 'Distributive Property Neglect', affectedCount: 14, resolvedCount: 12, resolutionRate: 85.7 },
    { misconceptionId: 'M3', name: 'Unbalanced Operations', affectedCount: 9, resolvedCount: 7, resolutionRate: 77.8 },
    { misconceptionId: 'M4', name: 'Fraction / Division Isolation', affectedCount: 8, resolvedCount: 5, resolutionRate: 62.5 },
    { misconceptionId: 'M5', name: 'Unlike Terms Combination', affectedCount: 12, resolvedCount: 10, resolutionRate: 83.3 },
    { misconceptionId: 'M6', name: 'Order of Operations', affectedCount: 7, resolvedCount: 5, resolutionRate: 71.4 },
  ],
  recentAlerts: [
    { studentName: 'Rohan Gupta', question: '3(x + 4) = 27', misconceptionId: 'M2', severity: 'medium' },
    { studentName: 'Priya Patel', question: '4x + 9 = 2x + 25', misconceptionId: 'M5', severity: 'high' },
  ],
};

export const MOCK_EVALUATION = {
  sampleSize: 140,
  preTestAverage: 42.1,
  postTestAverage: 84.6,
  averageGain: 42.5,
  pVal: '< 0.001',
  cohensD: 1.62,
  misconceptionReduction: {
    M1: { preRate: 52, postRate: 11 },
    M2: { preRate: 64, postRate: 8 },
    M3: { preRate: 46, postRate: 10 },
    M4: { preRate: 38, postRate: 12 },
    M5: { preRate: 58, postRate: 9 },
    M6: { preRate: 34, postRate: 7 },
  },
  transferTaskAccuracy: 88.2,
};

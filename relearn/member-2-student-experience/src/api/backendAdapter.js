/**
 * Backend adapter for RE:Learn.
 *
 * The screens were built with short misconception keys (M1–M6) and their own
 * response shapes. The backend (FastAPI, team contract) uses taxonomy labels
 * and snake_case fields. This file is the ONLY place that knows both, so the
 * screens never need to change when the backend format does.
 *
 * Pure functions only (no fetch, no import.meta), so they can be unit-tested
 * with plain Node: node src/api/backendAdapter.test.mjs
 */

// UI key <-> backend taxonomy label (team contract, 6 misconceptions + slip)
export const UI_TO_LABEL = {
  M1: 'TRANSPOSITION',
  M2: 'PARTIAL_DISTRIBUTION',
  M3: 'NEGATIVE_DISTRIBUTION',
  M4: 'SQUARE_OF_SUM',
  M5: 'UNLIKE_TERMS',
  M6: 'NEG_TIMES_NEG',
  SLIP: 'ARITHMETIC_SLIP',
};
export const LABEL_TO_UI = Object.fromEntries(Object.entries(UI_TO_LABEL).map(([k, v]) => [v, k]));

// Which topic (Member 2's question list) each misconception belongs to
const LABEL_TO_TOPIC = {
  PARTIAL_DISTRIBUTION: { id: 'brackets', name: 'Brackets' },
  SQUARE_OF_SUM: { id: 'squaring-brackets', name: 'Squaring brackets' },
  NEGATIVE_DISTRIBUTION: { id: 'minus-signs-brackets', name: 'Minus signs and brackets' },
  TRANSPOSITION: { id: 'moving-terms', name: 'Moving terms across =' },
  UNLIKE_TERMS: { id: 'adding-terms', name: 'Adding terms' },
  NEG_TIMES_NEG: { id: 'multiplying-negatives', name: 'Multiplying negatives' },
};

const VERBS = ['Solve', 'Simplify', 'Expand', 'Calculate', 'Evaluate'];

/** "Solve: 3(x + 4) = 21." -> { verb: "Solve", math: "3(x + 4) = 21" } */
export function splitPrompt(prompt = '') {
  const text = prompt.trim().replace(/\.$/, '');
  for (const verb of VERBS) {
    if (text.toLowerCase().startsWith(verb.toLowerCase())) {
      return { verb, math: text.slice(verb.length).replace(/^[\s:]+/, '').trim() };
    }
  }
  return { verb: 'Solve', math: text };
}

/** Student-typed maths -> KaTeX: "(-3)*(-4)" -> "(-3)\\times(-4)" */
export function toLatex(math = '') {
  return math.replace(/\*/g, ' \\times ').replace(/\s+/g, ' ').trim();
}

/** Backend question (questions.json format) -> the shape the screens use */
export function adaptQuestion(q) {
  const { verb, math } = splitPrompt(q.prompt);
  const label = q.misconception_id;
  const topic = LABEL_TO_TOPIC[label] || { id: 'other', name: 'Algebra' };
  const retry = q.retry_question || null;
  const transfer = q.transfer_question || null;
  return {
    id: q.question_id,
    prompt: q.prompt,
    verb,
    latex: toLatex(math),
    title: `${verb} — ${topic.name}`,
    topicId: topic.id,
    topicName: topic.name,
    difficulty: q.difficulty || 'Medium',
    status: 'Not tried',
    label,
    targetMisconceptions: LABEL_TO_UI[label] ? [LABEL_TO_UI[label]] : [],
    rootConcept: q.root_concept,
    retryQuestion: retry && {
      id: retry.question_id,
      prompt: retry.prompt,
      ...(() => { const s = splitPrompt(retry.prompt); return { verb: s.verb, latex: toLatex(s.math) }; })(),
      expectedAnswer: retry.canonical_answer,
    },
    transferQuestion: transfer && adaptTransferQuestion(transfer, label),
  };
}

export function adaptTransferQuestion(t, label) {
  return {
    id: t.question_id,
    domain: t.domain,
    scenario: t.scenario,
    answerType: t.answer_type || 'auto',
    label,
  };
}

/** POST /attempt body from what StepInput sends */
export function buildAttemptPayload(payload, studentId) {
  return {
    student_id: studentId,
    question_id: payload.question_id,
    question: payload.question || undefined,
    steps: payload.steps,
    input_mode: payload.input_mode || 'typed',
    language: payload.language || 'en',
  };
}

/** Backend confidence 0–1 -> whole percent for the UI chips */
const percent = (c) => (typeof c === 'number' ? Math.round(c * 100) : null);

/** POST /attempt response -> the shape DiagnosisSummary / PracticePage read */
export function adaptAttemptResponse(r) {
  const d = r.diagnosis;
  const label = d?.label;
  const uiId = LABEL_TO_UI[label] || null; // unknown -> null
  const hasError = r.error_step_index !== null && r.error_step_index !== undefined;
  return {
    attemptId: r.attempt_id,
    isCorrect: r.check_status === 'correct',
    checkStatus: r.check_status, // correct | step_error | incomplete | cannot_verify
    error_step_index: hasError ? r.error_step_index : null,
    diagnosedMisconceptions: uiId && uiId !== 'SLIP' ? [uiId] : [],
    label: label || null,
    uiId,
    stepFeedback: hasError
      ? [{ stepIndex: r.error_step_index, misconceptionId: uiId, feedback: d?.evidence || '' }]
      : [],
    evidence: d?.evidence
      || (r.check_status === 'incomplete' ? 'Every step is correct so far. Keep going until you reach x = ...' : ''),
    source: label === 'unknown' ? 'unknown' : d?.source || 'unknown', // rule | model | llm | unknown
    confidence: percent(d?.confidence),
    rootConcept: d?.root_concept || null,
    candidates: (d?.candidates || []).map((c) => ({ ...c, uiId: LABEL_TO_UI[c.label] || null })),
    stage: r.stage,
    raw: r,
  };
}

/** POST /intervention body (Member 4's route) */
export function buildInterventionPayload({ misconceptionId, label, evidence, language }) {
  return {
    label: label || UI_TO_LABEL[misconceptionId] || 'PARTIAL_DISTRIBUTION',
    evidence: evidence || '',
    student_numbers: {},
    language: language || 'en',
  };
}

export function adaptInterventionResponse(r, misconceptionId) {
  return {
    interventionId: `int_${misconceptionId}`,
    animationId: r.animation_id,
    explanation: r.explanation,
    interactiveGuidance: [],
  };
}

/** POST /retry body */
export function buildRetryPayload({ studentId, retryQuestionId, label, steps }) {
  return { student_id: studentId, question_id: retryQuestionId, misconception_id: label, steps };
}

/** POST /retry response -> what Retry.jsx needs */
export function adaptRetryResponse(r) {
  const passed = r.stage === 'retry_passed';
  return {
    outcome: passed ? 'pass' : r.flagged_for_teacher || r.stage === 'teacher_flagged' ? 'fail_2'
      : r.stage === 'incomplete' ? 'incomplete' : 'fail_1',
    isCorrect: Boolean(r.isCorrect ?? passed),
    stage: r.stage,
    errorStepIndex: r.error_step_index ?? null,
    evidence: r.diagnosis?.evidence || r.message || '',
    newMisconception: r.stage === 'retry_failed_new' ? r.diagnosis?.label : null,
    retryCount: r.retry_count ?? 0,
    message: r.message || '',
    readyForTransfer: Boolean(r.readyForTransfer ?? passed),
  };
}

/** POST /transfer body */
export function buildTransferPayload({ studentId, transferQuestionId, label, answer }) {
  return { student_id: studentId, question_id: transferQuestionId, misconception_id: label, answer };
}

/** POST /transfer response -> what Transfer.jsx needs */
export function adaptTransferResponse(r) {
  return {
    stage: r.stage, // transfer_in_progress | transfer_passed | transfer_failed
    isCorrect: Boolean(r.isCorrect),
    verified: Boolean(r.transfer_verified),
    streak: r.consecutive_transfer_count ?? r.streak ?? 0,
    nextQuestionId: r.next_question_id || null,
    bridge: r.bridge_explanation || null,
    feedback: r.feedback || '',
  };
}

/** GET /history rows (attempts table) -> MOCK_HISTORY shape */
export function adaptHistoryRow(row) {
  let diagnosis = null;
  try { diagnosis = row.diagnosis_json ? JSON.parse(row.diagnosis_json) : null; } catch { diagnosis = null; }
  let steps = [];
  try { steps = JSON.parse(row.steps_json || '[]'); } catch { steps = []; }
  const uiId = LABEL_TO_UI[diagnosis?.label];
  return {
    attemptId: row.attempt_id,
    studentId: row.student_id,
    questionId: row.question_id,
    timestamp: row.created_at,
    status: row.stage,
    diagnosedMisconceptions: uiId && uiId !== 'SLIP' ? [uiId] : [],
    steps: steps.map((s, i) => ({ stepNumber: i + 1, rawInput: s })),
  };
}

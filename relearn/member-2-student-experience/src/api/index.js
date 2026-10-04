import { ENV } from '../config/env';
import { MOCK_QUESTIONS, TOPICS } from './mocks/questions';
import { MISCONCEPTIONS } from './mocks/misconceptions';
import { MOCK_HISTORY, MOCK_CLASS_SUMMARY, MOCK_EVALUATION } from './mocks/analytics';
import {
  adaptQuestion, buildAttemptPayload, adaptAttemptResponse, buildInterventionPayload,
  adaptInterventionResponse, buildRetryPayload, adaptRetryResponse, buildTransferPayload,
  adaptTransferResponse, adaptHistoryRow,
} from './backendAdapter';

/** Student id used for every backend call (one learner profile per id). */
export function getStudentId() {
  try {
    return localStorage.getItem('relearn_student_id') || 'student_1';
  } catch {
    return 'student_1';
  }
}
export function setStudentId(id) {
  try { localStorage.setItem('relearn_student_id', id); } catch { /* ignore */ }
}

/**
 * Standard HTTP helper when running against real backend
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${ENV.API_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error ${response.status}: ${errorBody || response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch all available algebra practice questions
 */
export async function getQuestions() {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_QUESTIONS]), 150);
    });
  }
  const questions = await apiFetch('/questions');
  return questions.map(adaptQuestion);
}

/**
 * Submit step-by-step student attempt for diagnosis
 */
export async function submitAttempt(payload) {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Detect if any step has known misconception error patterns
        const steps = payload.steps || [];
        const detectedErrors = [];
        
        steps.forEach((step, idx) => {
          const raw = (step.rawInput || step || '').trim();
          if (raw.includes('3x + 4 = 27') || raw.includes('3x+4=27')) {
            detectedErrors.push({
              stepIndex: idx,
              misconceptionId: 'M2',
              feedback: 'Distributive Property Neglect: You multiplied 3 by x, but did not multiply 3 by 4.',
            });
          } else if (raw.includes('2x = 15 + 5') || raw.includes('5x = 18 - 7')) {
            detectedErrors.push({
              stepIndex: idx,
              misconceptionId: 'M1',
              feedback: 'Sign Error: When moving the term to the other side, invert the sign.',
            });
          }
        });

        const isCorrect = detectedErrors.length === 0;
        resolve({
          attemptId: `att_${Date.now()}`,
          isCorrect,
          diagnosedMisconceptions: detectedErrors.map(e => e.misconceptionId),
          stepFeedback: detectedErrors,
          timestamp: new Date().toISOString(),
        });
      }, 300);
    });
  }
  const response = await apiFetch('/attempt', {
    method: 'POST',
    body: JSON.stringify(buildAttemptPayload(payload, getStudentId())),
  });
  return adaptAttemptResponse(response);
}

/**
 * Upload a photo of handwritten work and OCR/parse into steps
 */
export async function photoToSteps(file) {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          confidence: 0.94,
          extractedEquation: '3(x + 4) = 27',
          steps: [
            { stepNumber: 1, rawInput: '3x + 4 = 27', confidence: 0.92 },
            { stepNumber: 2, rawInput: '3x = 23', confidence: 0.95 },
            { stepNumber: 3, rawInput: 'x = 23/3', confidence: 0.89 },
          ],
        });
      }, 600);
    });
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${ENV.API_URL}/photo-to-steps`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Photo OCR Error: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch visual remediation / intervention for diagnosed misconception
 */
export async function getIntervention(payload) {
  const misconceptionId = payload.misconceptionId || 'M2';
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      const details = MISCONCEPTIONS[misconceptionId] || MISCONCEPTIONS.M2;
      setTimeout(() => {
        resolve({
          interventionId: `int_${misconceptionId}`,
          misconception: details,
          modelType: details.remediationStrategy,
          explanation: details.description,
          interactiveGuidance: [
            'Notice each term inside the bracket receives the outside multiplier.',
            'Step 1: 3 * x = 3x',
            'Step 2: 3 * 4 = 12',
            'Combined LHS: 3x + 12',
          ],
          retryProblem: {
            latex: '4(x + 3) = 28',
            hint: 'Distribute 4 to both x and 3.',
          },
        });
      }, 200);
    });
  }
  const response = await apiFetch('/intervention', {
    method: 'POST',
    body: JSON.stringify(buildInterventionPayload(payload)),
  });
  return adaptInterventionResponse(response, misconceptionId);
}

/**
 * Submit student retry attempt after intervention
 */
export async function submitRetry(payload) {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          outcome: 'pass',
          isCorrect: true,
          stage: 'retry_passed',
          errorStepIndex: null,
          evidence: '',
          retryCount: 1,
          message: 'Excellent! You applied the distributive property correctly.',
          readyForTransfer: true,
        });
      }, 250);
    });
  }
  const response = await apiFetch('/retry', {
    method: 'POST',
    body: JSON.stringify(buildRetryPayload({ studentId: getStudentId(), ...payload })),
  });
  return adaptRetryResponse(response);
}

/**
 * Submit transfer problem attempt to measure generalization
 */
export async function submitTransfer(payload) {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          stage: 'transfer_passed',
          isCorrect: true,
          verified: true,
          streak: 2,
          nextQuestionId: null,
          bridge: null,
          feedback: 'Transfer verified ✓',
        });
      }, 250);
    });
  }
  const response = await apiFetch('/transfer', {
    method: 'POST',
    body: JSON.stringify(buildTransferPayload({ studentId: getStudentId(), ...payload })),
  });
  return adaptTransferResponse(response);
}

/**
 * Get student practice and misconception remediation history
 */
export async function getHistory(studentId = getStudentId()) {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_HISTORY]), 150);
    });
  }
  const rows = await apiFetch(`/student/${encodeURIComponent(studentId)}/history`);
  return rows.map(adaptHistoryRow);
}

/**
 * Get classroom summary and misconception aggregation for teacher dashboard
 */
export async function getClassSummary() {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...MOCK_CLASS_SUMMARY }), 150);
    });
  }
  return apiFetch('/class/summary');
}

/**
 * Get empirical evaluation and resolution efficacy metrics
 */
export async function getEvaluation() {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...MOCK_EVALUATION }), 150);
    });
  }
  return apiFetch('/eval/summary');
}

export { MISCONCEPTIONS, TOPICS, MOCK_QUESTIONS };

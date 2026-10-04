import { ENV } from '../config/env.js';
import { MOCK_QUESTIONS, TOPICS } from './mocks/questions.js';
import { MISCONCEPTIONS } from './mocks/misconceptions.js';
import { MOCK_HISTORY, MOCK_CLASS_SUMMARY, MOCK_EVALUATION } from './mocks/analytics.js';

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
  return apiFetch('/questions');
}

// In-memory store initialized with MOCK_HISTORY
let savedAttempts = [...MOCK_HISTORY];

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
          const raw = (typeof step === 'string' ? step : step.rawInput || '').trim();
          const clean = raw.toLowerCase().replace(/\s+/g, '');
          
          // M1: Sign Change on Transposition / Minus Signs
          if (
            clean.includes('2x=15+5') ||
            clean.includes('5x=18-7') ||
            clean.includes('-x+5+2x=9') ||
            clean.includes('5-x+3') ||
            clean.includes('2x=25+9') ||
            clean.includes('4x-2x=25+9') ||
            clean.includes('4x-2x=9+25') ||
            (clean === '2x=20' && (payload.question || '').includes('2x + 5 = 15'))
          ) {
            detectedErrors.push({
              stepIndex: idx,
              misconceptionId: 'M1',
              feedback: 'Sign Error: When moving a term across the equals sign or distributing a negative, reverse the sign.',
            });
          }
          // M2: Distributive Property Neglect / Binomial Squaring
          else if (
            clean.includes('3x+4=27') ||
            clean.includes('2x+3=14') ||
            clean.includes('3x-2=12') ||
            clean.includes('6x-5=27') ||
            clean.includes('x^2+16=36') ||
            clean.includes('x^2+4^2=36') ||
            clean.includes('x^2+9=') ||
            clean === 'x^2+9' ||
            clean.includes('a^2+b^2') ||
            clean === '4+9=13' ||
            clean === '2^2+3^2=13' ||
            (clean.includes('2^2+3^2') && (payload.question || '').includes('a+b'))
          ) {
            detectedErrors.push({
              stepIndex: idx,
              misconceptionId: 'M2',
              feedback: 'Distributive Property Neglect: You multiplied only the first term inside parentheses and omitted the second term.',
            });
          }
          // M3: Unbalanced Operations Across Equality
          else if (
            clean.includes('3x=19') ||
            clean.includes('2x+9=25') ||
            clean.includes('4x=2x+25') ||
            clean === 'x+6=14' ||
            clean === 'x+6=7' ||
            clean === '2x=14'
          ) {
            detectedErrors.push({
              stepIndex: idx,
              misconceptionId: 'M3',
              feedback: 'Unbalanced Operations: An operation applied to one side of the equation was not balanced on the other side.',
            });
          }
          // M4: Fraction / Division Isolation
          else if (
            clean === 'x+6=8' ||
            clean === '2x+3=8' ||
            clean === '2x+8=10' ||
            clean === 'x+8=10' ||
            clean === 'x+9=5' ||
            clean.includes('x+6=8')
          ) {
            detectedErrors.push({
              stepIndex: idx,
              misconceptionId: 'M4',
              feedback: 'Fraction Division Error: Dividing a multi-term expression requires dividing every individual term.',
            });
          }
          // M5: Unlike Terms Combination
          else if (
            clean.includes('8x=20') ||
            clean.includes('12x=24') ||
            clean.includes('4x+8=12x') ||
            clean.includes('5x=11') ||
            clean.includes('3x+5=8x') ||
            clean.includes('2x+3=5x')
          ) {
            detectedErrors.push({
              stepIndex: idx,
              misconceptionId: 'M5',
              feedback: 'Unlike Terms Combination: Terms with variables cannot be directly added to constant numbers.',
            });
          }
          // M6: Order of Operations & Negative Multiplier
          else if (
            clean.includes('-3x-15=21') ||
            clean.includes('-3x-5=21') ||
            clean.includes('-3x-12') ||
            clean.includes('6x=10') ||
            clean.includes('-2x-8=12')
          ) {
            detectedErrors.push({
              stepIndex: idx,
              misconceptionId: 'M6',
              feedback: 'Order of Operations / Negative Sign: Multiplying two negative numbers yields a positive result (- * - = +).',
            });
          }
        });

        const isCorrect = detectedErrors.length === 0;
        const result = {
          attemptId: `att_${Date.now()}`,
          isCorrect,
          diagnosedMisconceptions: detectedErrors.map(e => e.misconceptionId),
          stepFeedback: detectedErrors,
          source: detectedErrors.length > 0 ? 'rule' : 'rule',
          timestamp: new Date().toISOString(),
        };

        // Save attempt to mock history
        const newHistoryItem = {
          attemptId: result.attemptId,
          studentId: 'student_1',
          questionId: payload.question_id || 'CUSTOM',
          question: payload.question || (payload.question_id === 'CUSTOM' ? (typeof steps[0] === 'string' ? steps[0] : 'Custom problem') : 'Algebra problem'),
          isCustom: payload.question_id === 'CUSTOM' || payload.isCustom === true,
          timestamp: result.timestamp,
          status: isCorrect ? 'completed' : 'diagnosed',
          diagnosedMisconceptions: result.diagnosedMisconceptions,
          steps: steps.map((s, i) => {
            const rawText = typeof s === 'string' ? s : s.rawInput || '';
            const err = detectedErrors.find(e => e.stepIndex === i);
            return {
              stepNumber: i + 1,
              rawInput: rawText,
              isCorrect: !err,
              errorType: err?.misconceptionId,
              explanation: err?.feedback,
            };
          }),
          isResolved: isCorrect,
          transferAccuracy: isCorrect ? 100 : 0,
        };

        savedAttempts = [newHistoryItem, ...savedAttempts];

        resolve(result);
      }, 300);
    });
  }
  return apiFetch('/attempts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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
  return apiFetch(`/interventions?misconceptionId=${misconceptionId}`);
}

/**
 * Submit student retry attempt after intervention
 */
export async function submitRetry(payload) {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          retryId: `retry_${Date.now()}`,
          isCorrect: true,
          message: 'Excellent! You applied the distributive property correctly.',
          readyForTransfer: true,
        });
      }, 250);
    });
  }
  return apiFetch('/retries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Submit transfer problem attempt to measure generalization
 */
export async function submitTransfer(payload) {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          transferId: `transfer_${Date.now()}`,
          isCorrect: true,
          score: 100,
          masteryStatus: 'Mastered',
        });
      }, 250);
    });
  }
  return apiFetch('/transfer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Get student practice and misconception remediation history
 */
export async function getHistory(studentId = 'student_1') {
  if (ENV.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...savedAttempts]), 150);
    });
  }
  return apiFetch(`/history?studentId=${encodeURIComponent(studentId)}`);
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
  return apiFetch('/teacher/summary');
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
  return apiFetch('/evaluation');
}

export { MISCONCEPTIONS, TOPICS, MOCK_QUESTIONS };

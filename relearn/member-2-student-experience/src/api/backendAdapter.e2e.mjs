/**
 * End-to-end check of the frontend <-> backend connection, without a browser.
 * Start the backend first (uvicorn backend.main:app --port 8000), then:
 *     node src/api/backendAdapter.e2e.mjs
 * It walks the three Core Gate journeys through the SAME adapter the screens use.
 */
import * as A from './backendAdapter.js';

const API = process.env.API_URL || 'http://localhost:8000';
let failures = 0;
const check = (ok, msg) => { console.log(`${ok ? '  ✓' : '  ✗'} ${msg}`); if (!ok) failures++; };
const call = async (path, body) => {
  const r = await fetch(API + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
  if (!r.ok) throw new Error(`${path} -> HTTP ${r.status}: ${await r.text()}`);
  return r.json();
};
const student = `e2e_${Date.now()}`;

const raw = await call('/questions');
const questions = raw.map(A.adaptQuestion);
const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
const canonical = Object.fromEntries(raw.map((q) => [q.transfer_question.question_id, q.transfer_question.canonical_answer]));
const transferById = (id) => questions.find((q) => q.transferQuestion?.id === id)?.transferQuestion;
console.log(`Questions: ${questions.length} loaded`);
check(questions.every((q) => q.latex && q.retryQuestion && q.transferQuestion), 'every question has latex, retry and transfer');

async function attempt(q, steps, sid = student) {
  return A.adaptAttemptResponse(await call('/attempt', A.buildAttemptPayload({ question_id: q.id, question: q.prompt, steps }, sid)));
}

// ---------- Run 1: success path ----------
console.log('\nRun 1 — success path (PD_01)');
const q1 = byId.PD_01;
const a1 = await attempt(q1, ['3x+4=21', '3x=17', 'x=17/3']);
check(a1.diagnosedMisconceptions[0] === 'M2' && a1.error_step_index === 0, `diagnosed ${a1.label} on line ${a1.error_step_index + 1}`);
check(a1.source === 'rule' && a1.confidence === 95, `source ${a1.source}, ${a1.confidence}% sure, evidence: "${a1.evidence}"`);
check(a1.candidates.length > 0, `confidence bars: ${a1.candidates.map((c) => `${c.uiId}=${c.prob}`).join(', ')}`);
const iv = A.adaptInterventionResponse(await call('/intervention', A.buildInterventionPayload({ misconceptionId: 'M2', evidence: a1.evidence })), 'M2');
check(iv.explanation?.length > 20, `intervention: ${iv.animationId} — "${iv.explanation.slice(0, 70)}..."`);
const r1 = A.adaptRetryResponse(await call('/retry', A.buildRetryPayload({ studentId: student, retryQuestionId: q1.retryQuestion.id, label: q1.label, steps: ['4x+8=24', '4x=16', 'x=4'] })));
check(r1.outcome === 'pass', `retry ${q1.retryQuestion.prompt} -> ${r1.stage}`);
let t = A.adaptTransferResponse(await call('/transfer', A.buildTransferPayload({ studentId: student, transferQuestionId: q1.transferQuestion.id, label: q1.label, answer: canonical[q1.transferQuestion.id] })));
check(t.stage === 'transfer_in_progress' && t.nextQuestionId, `transfer 1 -> ${t.stage}, next ${t.nextQuestionId}`);
const next = transferById(t.nextQuestionId);
t = A.adaptTransferResponse(await call('/transfer', A.buildTransferPayload({ studentId: student, transferQuestionId: next.id, label: q1.label, answer: canonical[next.id] })));
check(t.verified && t.stage === 'transfer_passed', `transfer 2 -> ${t.stage} (verified ${t.verified})`);

// ---------- Run 2: transfer failure (hero moment) ----------
console.log('\nRun 2 — transfer failure (TR_01)');
const s2 = `${student}_b`;
const q2 = byId.TR_01;
const wrongTR = q2.prompt.includes('=') ? null : null; // build the transposition mistake from the retry
const a2 = await attempt(q2, [q2.prompt.replace(/^Solve\s*/i, '').replace(/x\s*([+-])\s*(\d+)\s*=\s*(\d+)/, (m, s, a, b) => `x=${b}${s}${a}`)], s2);
check(a2.diagnosedMisconceptions[0] === 'M1', `diagnosed ${a2.label}`);
const rq = q2.retryQuestion;
const correctRetry = await (async () => {
  const m = rq.prompt.match(/x\s*([+-])\s*(\d+)\s*=\s*(-?\d+)/);
  const [ , s, a, b] = m; const x = s === '+' ? +b - +a : +b + +a;
  return [`x=${x}`];
})();
const r2 = A.adaptRetryResponse(await call('/retry', A.buildRetryPayload({ studentId: s2, retryQuestionId: rq.id, label: q2.label, steps: correctRetry })));
check(r2.outcome === 'pass', `retry ${rq.prompt} with ${correctRetry} -> ${r2.stage}`);
const t2 = A.adaptTransferResponse(await call('/transfer', A.buildTransferPayload({ studentId: s2, transferQuestionId: q2.transferQuestion.id, label: q2.label, answer: 'deposit = balance + bonus' })));
check(t2.stage === 'transfer_failed' && !t2.verified, `transfer -> ${t2.stage}`);
check(Boolean(t2.bridge), `bridge explanation: "${(t2.bridge || '').slice(0, 70)}..."`);

// ---------- Run 3: failing retries ----------
console.log('\nRun 3 — failing retries (UT_02)');
const s3 = `${student}_c`;
const q3 = byId.UT_02;
const a3 = await attempt(q3, ['11x=23'], s3);
check(a3.diagnosedMisconceptions[0] === 'M5', `diagnosed ${a3.label} for ${q3.prompt}`);
const bad = q3.retryQuestion.prompt.match(/(\d+)x\s*\+\s*(\d+)\s*=\s*(\d+)/);
const wrong = [`${+bad[1] + +bad[2]}x=${bad[3]}`];
const f1 = A.adaptRetryResponse(await call('/retry', A.buildRetryPayload({ studentId: s3, retryQuestionId: q3.retryQuestion.id, label: q3.label, steps: wrong })));
check(f1.outcome === 'fail_1', `retry 1 (${wrong}) -> ${f1.stage}: "${f1.evidence}"`);
const f2 = A.adaptRetryResponse(await call('/retry', A.buildRetryPayload({ studentId: s3, retryQuestionId: q3.retryQuestion.id, label: q3.label, steps: wrong })));
check(f2.outcome === 'fail_2', `retry 2 -> ${f2.stage} (flagged for teacher)`);

// ---------- Recurrence + expression questions + history ----------
console.log('\nRecurrence, expression questions, history');
const again = await attempt(byId.PD_02, ['2x+3=14']);
check(again.stage === 'recurred', `student from Run 1 repeats the mistake -> ${again.stage}`);
for (const [id, steps, ui] of [['SS_01', null, 'M4'], ['NN_01', null, 'M6']]) {
  const q = byId[id];
  const mistake = id === 'SS_01' ? 'x^2+25' : '-12';
  const a = await attempt(q, [mistake], `${student}_${id}`);
  check(a.diagnosedMisconceptions[0] === ui, `${q.prompt} -> "${mistake}" -> ${a.label}`);
}
const history = (await call(`/student/${student}/history`)).map(A.adaptHistoryRow);
check(history.length >= 2 && history[0].questionId, `history: ${history.length} attempts, last status ${history.at(-1).status}`);

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll journeys work end to end ✓');
process.exit(failures ? 1 : 0);

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle, Sparkles, Ruler, Atom, Code, Loader2 } from 'lucide-react';
import { getQuestions, submitTransfer, MISCONCEPTIONS } from '../api';

const DOMAIN = {
  geometry: { name: 'Geometry', Icon: Ruler },
  physics: { name: 'Physics', Icon: Atom },
  programming: { name: 'Code', Icon: Code },
  code: { name: 'Code', Icon: Code },
};

const PLACEHOLDER = {
  expression: 'Type an expression, e.g. 3x + 12',
  number: 'Type a number, e.g. -5',
  code_assignment: 'Type one line of code, e.g. price = total - tax',
  text: 'Answer in one sentence',
  equation: 'Type an equation, e.g. x = 4',
};

/**
 * Step 9 ★ HERO — cross-domain transfer.
 * The misconception counts as resolved only after TWO CONSECUTIVE correct
 * answers in new contexts (backend: transfer_in_progress -> transfer_passed).
 * A wrong answer shows "Persists in a new context ✗" with a bridge explanation.
 */
export default function Transfer({ question, misconceptionId = 'M2' }) {
  const misconception = MISCONCEPTIONS[misconceptionId] || MISCONCEPTIONS.M2;
  const label = misconception.label;

  const [current, setCurrent] = useState(question?.transferQuestion || null);
  const [number, setNumber] = useState(1); // 1st or 2nd transfer question
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // final pass / fail
  const [error, setError] = useState(null);

  useEffect(() => {
    setCurrent(question?.transferQuestion || null);
  }, [question]);

  const loadTransferQuestion = async (transferId) => {
    const all = await getQuestions();
    const owner = all.find((q) => q.transferQuestion?.id === transferId);
    return owner?.transferQuestion || null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!answer.trim() || !current || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitTransfer({ transferQuestionId: current.id, label, answer: answer.trim() });
      if (res.stage === 'transfer_in_progress' && res.nextQuestionId) {
        const next = await loadTransferQuestion(res.nextQuestionId);
        if (next) {
          setCurrent(next);
          setNumber(2);
          setAnswer('');
          return;
        }
      }
      setResult(res);
    } catch (err) {
      setError(err.message || 'Could not check your answer. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!current) {
    return (
      <div className="bg-white rounded-[20px] border border-[#E3EEF7] p-8 text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-h2 font-display text-navy">No transfer question for this problem yet</h2>
        <Link to="/practice" className="btn-primary"><span>Return to practice list</span></Link>
      </div>
    );
  }

  const domain = DOMAIN[current.domain] || { name: current.domain || 'New context', Icon: Sparkles };
  const DomainIcon = domain.Icon;

  // ---------------- PASS: Transfer verified ✓ ----------------
  if (result?.verified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-3xl mx-auto bg-white rounded-[24px] border-2 border-[#22B573] shadow-[0_16px_40px_-14px_rgba(34,181,115,0.45)] p-8 sm:p-10 text-center space-y-5"
      >
        <motion.div
          initial={{ scale: 0.6, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 12 }}
          className="w-20 h-20 rounded-3xl bg-mint text-leaf flex items-center justify-center mx-auto"
        >
          <CheckCircle2 className="w-11 h-11" strokeWidth={2.4} />
        </motion.div>
        <span className="text-xs font-bold uppercase tracking-wider text-leaf">Transfer verified ✓</span>
        <h2 className="text-h1 font-display text-navy">You really understand it.</h2>
        <p className="text-body text-slate max-w-xl mx-auto">
          You fixed <strong>{misconception.name}</strong> in algebra, then used the same idea correctly in two
          different subjects in a row. That is how we know it is learned, not memorised.
        </p>
        <div className="pt-2">
          <Link to="/practice" className="btn-primary"><span>Back to practice</span><ArrowRight className="w-4 h-4" strokeWidth={2} /></Link>
        </div>
      </motion.div>
    );
  }

  // ---------------- FAIL: Persists in a new context ✗ ----------------
  if (result && !result.verified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-3xl mx-auto bg-white rounded-[24px] border-2 border-[#E5484D] shadow-[0_16px_40px_-14px_rgba(229,72,77,0.40)] p-8 sm:p-10 space-y-5"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ boxShadow: ['0 0 0 0 rgba(229,72,77,0.5)', '0 0 0 14px rgba(229,72,77,0)'] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="w-14 h-14 rounded-2xl bg-[#FDE7E8] text-[#E5484D] flex items-center justify-center shrink-0"
          >
            <XCircle className="w-8 h-8" strokeWidth={2.4} />
          </motion.div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5484D]">Persists in a new context ✗</span>
            <h2 className="text-h2 font-display text-navy">Fixed in algebra, but not yet everywhere.</h2>
          </div>
        </div>
        <p className="text-body text-slate">
          You solved the algebra retry correctly, but the same idea — <strong>{misconception.name}</strong> — tripped
          you up in {domain.name.toLowerCase()}. This is exactly the gap Re:Learn is built to find.
        </p>
        {result.bridge && (
          <div className="bg-sky/50 border border-ocean/30 rounded-xl p-5 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-ocean">The bridge back to algebra</span>
            <p className="text-body text-navy">{result.bridge}</p>
          </div>
        )}
        <p className="text-small text-slate">Your teacher has been notified so you can work on it together.</p>
        <div className="flex flex-wrap gap-3 justify-end pt-1">
          <Link to="/practice" className="btn-secondary"><span>Back to practice</span></Link>
        </div>
      </motion.div>
    );
  }

  // ---------------- QUESTION ----------------
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 font-body">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-ocean">
          Same idea, different subject · Question {number} of 2
        </span>
        <h1 className="text-h1 font-display text-navy tracking-tight">Can you use it outside algebra?</h1>
        <p className="text-body text-slate">Get two in a row right to prove the idea really stuck.</p>
      </div>

      <motion.form
        key={current.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-[20px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)] p-6 sm:p-8 space-y-5"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky text-ocean border border-sky/80">
          <DomainIcon className="w-3.5 h-3.5" strokeWidth={1.9} />
          <span>{domain.name}</span>
        </span>
        <p className="text-body sm:text-lg text-navy leading-relaxed">{current.scenario}</p>

        {current.answerType === 'text' ? (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
            placeholder={PLACEHOLDER.text}
            className="w-full rounded-xl border border-[#E3EEF7] p-3 text-body focus:outline-none focus:ring-2 focus:ring-ocean"
          />
        ) : (
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={PLACEHOLDER[current.answerType] || 'Type your answer'}
            className={`w-full rounded-xl border border-[#E3EEF7] p-3 text-body focus:outline-none focus:ring-2 focus:ring-ocean ${
              current.answerType === 'code_assignment' ? 'font-mono' : ''
            }`}
          />
        )}

        {error && <p className="text-small text-[#E5484D]">{error}</p>}

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={!answer.trim() || submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Check my answer</span>
            {!submitting && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

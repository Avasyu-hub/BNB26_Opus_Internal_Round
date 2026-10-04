import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Check, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  HelpCircle,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import MathView from '../components/MathView';
import StepInput from '../components/practice/StepInput';
import ErrorStepCard from '../components/diagnosis/ErrorStepCard';
import { submitRetry, MISCONCEPTIONS } from '../api';

export default function Retry({
  originalQuestion,
  misconceptionId = 'M2',
  retryCount = 0,
  onPassRetry,
  onShowAlternateIntervention,
}) {
  // Retry problem from the question bank: same misconception, fresh numbers
  const retryQuestion = {
    id: originalQuestion?.retryQuestion?.id || 'retry_q1',
    prompt: originalQuestion?.retryQuestion?.prompt,
    verb: originalQuestion?.retryQuestion?.verb || 'Solve',
    topicName: originalQuestion?.topicName || 'Brackets',
    title: `Retry: ${originalQuestion?.topicName || 'same idea'}`,
    latex: originalQuestion?.retryQuestion?.latex || '4(x + 2) = 24',
    difficulty: originalQuestion?.difficulty || 'Medium',
    expectedAnswer: originalQuestion?.retryQuestion?.expectedAnswer || 'x = 4',
  };
  const label = MISCONCEPTIONS[misconceptionId]?.label;

  const [outcome, setOutcome] = useState(null); // null | 'pass' | 'fail_1' | 'fail_2'
  const [retrySteps, setRetrySteps] = useState(['']);
  const [failedStepIndex, setFailedStepIndex] = useState(0);
  const [failEvidence, setFailEvidence] = useState('');

  // StepInput calls this instead of /attempt, so the backend grades the retry:
  // it passes only if the answer is right AND the misconception is gone.
  const submitThisRetry = (payload) =>
    submitRetry({ retryQuestionId: retryQuestion.id, label, steps: payload.steps });

  const handleStepSubmit = async (result, normalizedSteps) => {
    setRetrySteps(normalizedSteps);
    if (result.outcome === 'pass') {
      setOutcome('pass');
      return;
    }
    if (result.outcome === 'incomplete') {
      setFailEvidence(result.message);
      setFailedStepIndex(normalizedSteps.length - 1);
      setOutcome(retryCount >= 1 ? 'fail_2' : 'fail_1');
      return;
    }
    setFailedStepIndex(result.errorStepIndex ?? 0);
    setFailEvidence(result.evidence);
    setOutcome(result.outcome === 'fail_2' || retryCount >= 1 ? 'fail_2' : 'fail_1');
  };

  // Step indicator stages
  const stepIndicators = [
    { label: 'Diagnosed', status: 'completed' },
    { label: 'Learned', status: 'completed' },
    { label: 'Try again', status: 'current' },
    { label: 'Different subject', status: 'upcoming' },
    { label: 'Done', status: 'upcoming' },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto font-body">
      {/* 1. STEP PROGRESS INDICATOR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3EEF7] shadow-xs">
        <div className="relative flex items-center justify-between max-w-2xl mx-auto">
          {/* Connecting gradient line */}
          <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-progress-gradient -z-0 opacity-60" />

          {stepIndicators.map((step, idx) => (
            <div key={step.label} className="relative z-10 flex flex-col items-center gap-1.5 text-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step.status === 'completed'
                    ? 'bg-leaf text-white shadow-2xs'
                    : step.status === 'current'
                    ? 'bg-ocean text-white ring-4 ring-sky shadow-xs'
                    : 'bg-white border-2 border-slate/30 text-slate'
                }`}
              >
                {step.status === 'completed' ? (
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-[11px] sm:text-xs font-medium ${
                  step.status === 'current'
                    ? 'font-bold text-navy'
                    : step.status === 'completed'
                    ? 'text-leaf font-semibold'
                    : 'text-slate'
                }`}
              >
                {step.label} {step.status === 'completed' && '✓'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. TITLE & HEADER */}
      <div className="space-y-1 text-left">
        <h1 className="text-h1 sm:text-display-lg font-display text-navy tracking-tight">
          Your turn
        </h1>
        <p className="text-body text-slate">
          Same idea, new numbers.
        </p>
      </div>

      {/* 3. HERO RETRY QUESTION PANEL */}
      <div className="bg-white rounded-[20px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-h3 font-medium text-slate">
              {retryQuestion.verb}
            </span>
            <div className="text-2xl sm:text-3xl font-display font-bold text-navy">
              <MathView math={retryQuestion.latex} className="text-2xl sm:text-3xl font-bold" />
            </div>
          </div>
          <p className="text-small text-slate">
            {retryQuestion.title} &bull; <span className="font-medium text-slate/80">{retryQuestion.difficulty}</span>
          </p>
        </div>

        <span className="text-xs font-semibold bg-sky text-ocean px-3 py-1.5 rounded-xl border border-sky/80 self-start sm:self-auto">
          Retry Attempt {retryCount + 1} of 2
        </span>
      </div>

      {/* 4. MAIN WORKING AREA / OUTCOMES */}
      {!outcome && (
        <StepInput
          question={retryQuestion}
          initialSteps={retrySteps}
          onSubmitAttempt={handleStepSubmit}
          submitFn={submitThisRetry}
        />
      )}

      {/* OUTCOME 1: PASS */}
      {outcome === 'pass' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white rounded-[20px] border-2 border-[#22B573] shadow-[0_10px_30px_-12px_rgba(34,181,115,0.25)] p-6 sm:p-8 space-y-6"
        >
          {/* Success Check Badge */}
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-12 h-12 rounded-2xl bg-mint text-leaf flex items-center justify-center shadow-xs"
            >
              <CheckCircle2 className="w-7 h-7" strokeWidth={2.5} />
            </motion.div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-leaf">
                Step Resolved
              </span>
              <h2 className="text-h2 font-display text-navy">
                Resolved in algebra.
              </h2>
            </div>
          </div>

          {/* Mint Panel for Next Challenge */}
          <div className="bg-mint/80 p-5 rounded-xl border border-leaf/30 space-y-3">
            <h4 className="font-heading font-bold text-navy text-base sm:text-lg">
              Now let's check you really understand it — same idea, different subject.
            </h4>
            <p className="text-small text-slate">
              Apply this distribution principle in geometry, physics, or Python code to prove complete concept transfer.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onPassRetry}
              className="btn-primary"
            >
              <span>Take the challenge</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}

      {/* OUTCOME 2: FAIL (retryCount 1) */}
      {outcome === 'fail_1' && (
        <div className="space-y-6 animate-fade-in">
          <ErrorStepCard
            steps={retrySteps}
            error_step_index={failedStepIndex}
            evidence={failEvidence || 'This step does not follow from the line before it.'}
            marginNote="Check this line!"
            animate={true}
          />

          <div className="bg-white rounded-[20px] border border-[#E3EEF7] shadow-sm p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-h3 font-display font-bold text-navy">
                Not quite yet — let's look at it another way.
              </h3>
              <p className="text-small text-slate">
                We'll review an alternative visual proof so you can master the principle.
              </p>
            </div>

            <button
              type="button"
              onClick={onShowAlternateIntervention}
              className="btn-primary shrink-0"
            >
              <span>Show me again</span>
              <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}

      {/* OUTCOME 3: FAIL (retryCount 2) */}
      {outcome === 'fail_2' && (
        <div className="bg-white rounded-[20px] border border-[#E3EEF7] shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-mist text-slate flex items-center justify-center">
              <BookOpen className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-h3 font-display font-bold text-navy">
                We'll come back to this one.
              </h3>
              <p className="text-small text-slate">
                Your teacher can see it too, and you can revisit this topic anytime.
              </p>
            </div>
          </div>

          <p className="text-body text-slate max-w-xl">
            Learning algebra takes practice. Take a quick break or explore other problem topics to build confidence.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
            <Link to="/practice" className="btn-primary">
              <span>Pick another problem</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
            <Link to="/profile" className="btn-secondary">
              <span>See my progress</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import MathView from '../components/MathView';
import StepInput from '../components/practice/StepInput';
import DiagnosisSummary from '../components/diagnosis/DiagnosisSummary';
import Intervention from './Intervention';
import Retry from './Retry';
import Transfer from './Transfer';
import { getQuestions, MOCK_QUESTIONS } from '../api';
import { useApp } from '../context/AppContext';

export default function PracticePage() {
  const { questionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { language } = useApp();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Flow State
  const stage = searchParams.get('stage') || 'input'; // 'input' | 'diagnosed' | 'intervention' | 'retry' | 'transfer'
  const attemptNumber = parseInt(searchParams.get('attempt') || '1', 10);
  const [retryCount, setRetryCount] = useState(0);

  const [studentSteps, setStudentSteps] = useState(['']);
  const [attemptResult, setAttemptResult] = useState(null);

  useEffect(() => {
    getQuestions().then((questions) => {
      const found = questions.find((q) => q.id === questionId) || MOCK_QUESTIONS[0];
      setQuestion(found);
      setLoading(false);
    });
  }, [questionId]);

  const updateStage = (newStage, newAttempt = attemptNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set('stage', newStage);
    if (newAttempt > 1) {
      params.set('attempt', String(newAttempt));
    } else {
      params.delete('attempt');
    }
    setSearchParams(params, { replace: true });
  };

  const handleAttemptSubmitted = (result, normalizedSteps) => {
    setAttemptResult(result);
    setStudentSteps(normalizedSteps);
    updateStage('diagnosed', 1);
  };

  const handleEditWorking = () => {
    updateStage('input', 1);
  };

  const handleShowWhy = () => {
    updateStage('intervention', 1);
  };

  const handleProceedToRetry = () => {
    updateStage('retry', attemptNumber);
  };

  const handleShowAlternateIntervention = () => {
    setRetryCount((prev) => prev + 1);
    updateStage('intervention', 2);
  };

  const handlePassRetry = () => {
    updateStage('transfer', 1);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate/15 rounded-md w-32" />
        <div className="h-32 bg-white rounded-[20px] border border-[#E3EEF7]" />
        <div className="h-80 bg-white rounded-[20px] border border-[#E3EEF7]" />
      </div>
    );
  }

  // The misconception this practice question targets, unless the diagnosis found another one.
  const misconceptionId = attemptResult?.diagnosedMisconceptions?.[0]
    || question?.targetMisconceptions?.[0] || 'M2';

  return (
    <div className="space-y-8 pb-16 font-body">
      {/* 1. TOP BAR & HERO QUESTION PANEL (Shown during input and diagnosis) */}
      {(stage === 'input' || stage === 'diagnosed') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link
              to="/practice"
              className="inline-flex items-center gap-1.5 text-small font-semibold text-slate hover:text-navy group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-md px-1"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
              <span>All problems</span>
            </Link>

            {question?.topicName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky text-ocean border border-sky/80">
                <BookOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>{question.topicName}</span>
              </span>
            )}
          </div>

          {/* HERO QUESTION PANEL */}
          <div className="bg-white rounded-[20px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-h3 font-medium text-slate">
                  {question?.verb || 'Solve'}
                </span>
                <div className="text-2xl sm:text-3xl font-display font-bold text-navy">
                  <MathView math={question?.latex || '2(x + 3) = 14'} className="text-2xl sm:text-3xl font-bold" />
                </div>
              </div>
              <p className="text-small text-slate">
                {question?.title || 'Linear equation'} &bull; <span className="font-medium text-slate/80">{question?.difficulty || 'Medium'}</span>
              </p>
            </div>

            <div className="text-xs text-slate bg-mist px-3 py-1.5 rounded-xl border border-[#E3EEF7] self-start sm:self-auto font-medium">
              Question ID: <span className="font-mono font-bold text-navy">{question?.id || questionId}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. WORKING STAGES */}

      {/* STAGE: INPUT */}
      {stage === 'input' && (
        <StepInput
          question={question}
          initialSteps={studentSteps}
          onSubmitAttempt={handleAttemptSubmitted}
        />
      )}

      {/* STAGE: DIAGNOSED */}
      {stage === 'diagnosed' && (
        <DiagnosisSummary
          attemptResult={attemptResult}
          steps={studentSteps}
          onEditWorking={handleEditWorking}
          onShowWhy={handleShowWhy}
          onTakeChallenge={() => updateStage('transfer', 1)}
          transferDomain={question?.transferQuestion?.domain}
        />
      )}

      {/* STAGE: INTERVENTION (STEP 7) */}
      {stage === 'intervention' && (
        <Intervention
          question={question}
          misconceptionId={misconceptionId}
          evidence={attemptResult?.evidence || ''}
          language={language}
          attemptNumber={attemptNumber}
          onProceedToRetry={handleProceedToRetry}
        />
      )}

      {/* STAGE: RETRY (STEP 8) */}
      {stage === 'retry' && (
        <Retry
          originalQuestion={question}
          misconceptionId={misconceptionId}
          retryCount={retryCount}
          onPassRetry={handlePassRetry}
          onShowAlternateIntervention={handleShowAlternateIntervention}
        />
      )}

      {/* STAGE: TRANSFER (STEP 9 ★ HERO) */}
      {stage === 'transfer' && (
        <Transfer
          question={question}
          misconceptionId={misconceptionId}
        />
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Pencil,
  AlertCircle,
  CheckCircle2,
  Calculator,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Info,
  Check,
  BrainCircuit,
  Network
} from 'lucide-react';
import MathView from '../components/MathView';
import StepInput from '../components/practice/StepInput';
import DiagnosisSummary from '../components/diagnosis/DiagnosisSummary';
import ErrorStepCard from '../components/diagnosis/ErrorStepCard';
import Intervention from './Intervention';
import Retry from './Retry';
import { submitAttempt, getQuestions, MISCONCEPTIONS, MOCK_QUESTIONS } from '../api';
import FLAGS from '../config/flags';

const QUICK_START_EXAMPLES = [
  { latex: '2(x + 3) = 14', label: '2(x + 3) = 14', topic: 'Brackets' },
  { latex: '-(x + 5) + 2x = 9', label: '−(x + 5) + 2x = 9', topic: 'Minus signs' },
  { latex: '(a + b)^2', label: '(a+b)² when a = 2, b = 3', topic: 'Squaring' },
  { latex: '2x + 5 = 15', label: '2x + 5 = 15', topic: 'Moving terms' },
  { latex: '3x + 5 = 20', label: '3x + 5 = 20', topic: 'Adding terms' },
  { latex: '-3(x - 5) = 21', label: '−3(x − 5) = 21', topic: 'Multiplying negatives' },
];

export default function CustomProblem() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Problem definition state
  const [problemInput, setProblemInput] = useState('');
  const [studentSteps, setStudentSteps] = useState(['']);
  const [attemptResult, setAttemptResult] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showKeypad, setShowKeypad] = useState(false);

  const problemInputRef = useRef(null);

  // Stages: 'input_problem' | 'solving' | 'diagnosed' | 'intervention' | 'retry' | 'transfer'
  const stage = searchParams.get('stage') || 'input_problem';
  const attemptNumber = parseInt(searchParams.get('attempt') || '1', 10);

  // Focus problem input on mount if in input_problem stage
  useEffect(() => {
    if (stage === 'input_problem' && problemInputRef.current) {
      problemInputRef.current.focus();
    }
  }, [stage]);

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

  // Validation function for student custom problem
  const validation = useMemo(() => {
    const text = (problemInput || '').trim();
    if (!text) {
      return {
        isValid: false,
        isEmpty: true,
        errorType: null,
        errorMessage: null,
        hasMultipleVariables: false,
        noteMessage: null,
      };
    }

    // 1. Check out of scope math: sin, cos, tan, log, ln, ∫, d/dx, matrices, etc.
    const outOfScopeRegex = /\b(sin|cos|tan|cot|sec|csc|log|ln|det|matrix|pmatrix|bmatrix)\b|[∫∑∏√]|\\(int|sum|prod|sqrt|frac\{d\}\{dx\}|matrix|begin\{matrix\})/i;
    if (outOfScopeRegex.test(text)) {
      return {
        isValid: false,
        isEmpty: false,
        errorType: 'out_of_scope',
        errorMessage: 'Re:Learn works with algebra like brackets, equations and negative numbers. Try a problem like 2(x + 3) = 14.',
        hasMultipleVariables: false,
        noteMessage: null,
      };
    }

    // 2. Check unparseable / brackets imbalance / malformed symbols
    const openParens = (text.match(/\(/g) || []).length;
    const closeParens = (text.match(/\)/g) || []).length;
    const openBrackets = (text.match(/\[/g) || []).length;
    const closeBrackets = (text.match(/\]/g) || []).length;
    const openBraces = (text.match(/\{/g) || []).length;
    const closeBraces = (text.match(/\}/g) || []).length;

    if (openParens !== closeParens || openBrackets !== closeBrackets || openBraces !== closeBraces) {
      return {
        isValid: false,
        isEmpty: false,
        errorType: 'unparseable',
        errorMessage: "We couldn't read that problem. Check the brackets and symbols.",
        hasMultipleVariables: false,
        noteMessage: null,
      };
    }

    // Check invalid syntax like empty brackets "()" or multiple equals "===" or invalid operator sequence
    if (/\(\s*\)|\[\s*\]|\{\s*\}|[=]{2,}|[+*/^]{2,}|[=]\s*[+*/^]/.test(text)) {
      return {
        isValid: false,
        isEmpty: false,
        errorType: 'unparseable',
        errorMessage: "We couldn't read that problem. Check the brackets and symbols.",
        hasMultipleVariables: false,
        noteMessage: null,
      };
    }

    // 3. Check for multiple unknowns in equation (allow it, but show note)
    const stripped = text.replace(/\\[a-zA-Z]+/g, '');
    const letters = stripped.match(/[a-zA-Z]/g) || [];
    const uniqueVars = [...new Set(letters.map((l) => l.toLowerCase()))];
    const hasMultipleVariables = uniqueVars.length > 1;

    return {
      isValid: true,
      isEmpty: false,
      errorType: null,
      errorMessage: null,
      hasMultipleVariables,
      noteMessage: hasMultipleVariables
        ? "We'll check your steps, but this one may have more than one answer."
        : null,
    };
  }, [problemInput]);

  const handleStartSolving = () => {
    if (!validation.isValid) return;
    setStudentSteps(['']);
    updateStage('solving', 1);
  };

  const handleAttemptSubmitted = (result, normalizedSteps) => {
    setAttemptResult(result);
    setStudentSteps(normalizedSteps);
    updateStage('diagnosed', 1);
  };

  const handleEditProblem = () => {
    updateStage('input_problem', 1);
  };

  const handleEditWorking = () => {
    updateStage('solving', 1);
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

  const handleKeypadInsert = (symbol) => {
    if (!problemInputRef.current) return;
    const input = problemInputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const current = problemInput;
    const updated = current.substring(0, start) + symbol + current.substring(end);
    setProblemInput(updated);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 20);
  };

  const keypadButtons = ['(', ')', '^', '²', '−', '=', 'x', '÷', '+', '*'];

  // Bank question associated with diagnosed misconception for Retry and Transfer
  const diagnosedMisconceptionId = attemptResult?.diagnosedMisconceptions?.[0] || 'M2';
  const bankQuestion = useMemo(() => {
    return (
      MOCK_QUESTIONS.find((q) => q.targetMisconceptions?.includes(diagnosedMisconceptionId)) ||
      MOCK_QUESTIONS[0]
    );
  }, [diagnosedMisconceptionId]);

  const customQuestionObject = useMemo(() => ({
    id: 'CUSTOM',
    prompt: problemInput,
    latex: problemInput,
    title: 'Your custom problem',
    difficulty: 'Student problem',
    isCustom: true,
  }), [problemInput]);

  const isAllCorrect = attemptResult?.isCorrect === true;
  const isUnknownDiagnosis = attemptResult && !isAllCorrect && (!attemptResult.diagnosedMisconceptions || attemptResult.diagnosedMisconceptions.length === 0);

  return (
    <div className="space-y-8 pb-16 font-body max-w-5xl mx-auto">
      {/* ============================================================ */}
      {/* STEP A — ENTER THE PROBLEM */}
      {/* ============================================================ */}
      {stage === 'input_problem' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 bg-sky/70 px-3.5 py-1 rounded-full text-ocean text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} />
              <span>Solve Your Own</span>
            </div>
            <h1 className="text-h1 sm:text-display-lg font-display text-navy tracking-tight">
              Got a problem from class or homework?
            </h1>
            <p className="text-body text-slate max-w-2xl">
              Type it in, then show your working. We'll check every step.
            </p>
          </div>

          {/* Main White Panel for Input */}
          <div className="bg-white rounded-[20px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)] p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <label htmlFor="custom-problem-input" className="block text-small font-bold text-navy">
                Enter your equation or expression
              </label>

              {/* Large Input */}
              <div className="relative">
                <input
                  id="custom-problem-input"
                  ref={problemInputRef}
                  type="text"
                  value={problemInput}
                  onChange={(e) => setProblemInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && validation.isValid) {
                      handleStartSolving();
                    }
                  }}
                  placeholder="e.g. 3(x − 2) = 12"
                  className="w-full text-[1.25rem] sm:text-[1.35rem] font-body text-navy bg-white border-2 border-[#E3EEF7] focus:border-ocean focus:ring-4 focus:ring-sky/40 rounded-2xl p-4 transition-all outline-none placeholder:text-slate/40 shadow-xs"
                />
              </div>

              {/* Live KaTeX Preview */}
              <div className="p-4 rounded-xl bg-mist/80 border border-[#E3EEF7] flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-h-[56px]">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate/70">
                  Live preview:
                </div>
                <div className="text-xl sm:text-2xl font-bold text-navy">
                  {problemInput.trim().length > 0 ? (
                    <MathView math={problemInput} />
                  ) : (
                    <span className="text-sm text-slate/50 font-normal italic">
                      Formula preview will appear here as you type
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Validation Feedback Messages */}
            {validation.errorMessage && (
              <div className="p-4 rounded-xl bg-[#FDE7E8] border border-[#E5484D]/30 flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-[#E5484D] shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-small text-[#E5484D] font-medium leading-relaxed">
                  {validation.errorMessage}
                </p>
              </div>
            )}

            {validation.noteMessage && (
              <div className="p-4 rounded-xl bg-sky/60 border border-ocean/30 flex items-start gap-3 animate-fade-in">
                <Info className="w-5 h-5 text-ocean shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-small text-ocean font-medium leading-relaxed">
                  {validation.noteMessage}
                </p>
              </div>
            )}

            {/* Quick-Start Chips Under Input */}
            <div className="space-y-2.5 pt-2 border-t border-[#E3EEF7]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate">
                Or try one of these quick examples:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_START_EXAMPLES.map((ex) => (
                  <button
                    key={ex.latex}
                    type="button"
                    onClick={() => {
                      setProblemInput(ex.latex);
                      if (problemInputRef.current) {
                        problemInputRef.current.focus();
                      }
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-small font-semibold bg-mist hover:bg-sky/60 text-navy hover:text-ocean border border-[#E3EEF7] hover:border-ocean/40 transition-all hover:scale-102 active:scale-98 shadow-2xs"
                  >
                    <span>{ex.label}</span>
                    <span className="text-[10px] text-slate/70 font-normal uppercase tracking-wider bg-white/80 px-1.5 py-0.5 rounded-md border border-[#E3EEF7]">
                      {ex.topic}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile / Toggleable Maths Keypad */}
            <div className="pt-2 border-t border-[#E3EEF7]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate uppercase tracking-wider">
                  Maths Keypad
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeypad(!showKeypad)}
                  className="text-xs text-ocean font-medium hover:underline flex items-center gap-1"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>{showKeypad ? 'Hide keys' : 'Show keys'}</span>
                </button>
              </div>
              <div className={`flex flex-wrap gap-2 ${showKeypad ? 'block' : 'block sm:hidden'}`}>
                {keypadButtons.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeypadInsert(key)}
                    className="w-10 h-10 rounded-xl bg-white border border-[#E3EEF7] shadow-xs text-navy font-semibold text-base hover:bg-sky/40 active:scale-95 transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#E3EEF7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                to="/practice"
                className="inline-flex items-center gap-1.5 text-small font-semibold text-slate hover:text-navy group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
                <span>Back to practice topics</span>
              </Link>

              <button
                type="button"
                onClick={handleStartSolving}
                disabled={!validation.isValid}
                className="btn-primary w-full sm:w-auto min-w-[200px] justify-center shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                <span>Start solving</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP B — SOLVE IT (WITH HERO HEADER AND STEPINPUT) */}
      {/* ============================================================ */}
      {stage === 'solving' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleEditProblem}
              className="inline-flex items-center gap-1.5 text-small font-semibold text-slate hover:text-navy group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-md px-1"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
              <span>Edit problem</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky text-ocean border border-sky/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Your problem</span>
            </span>
          </div>

          {/* HERO QUESTION PANEL (Same style as Step 2) */}
          <div className="bg-white rounded-[20px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-h3 font-medium text-slate">
                  Solve
                </span>
                <div className="text-2xl sm:text-3xl font-display font-bold text-navy">
                  <MathView math={problemInput} className="text-2xl sm:text-3xl font-bold" />
                </div>
              </div>
              <p className="text-small text-slate">
                Custom algebra problem &bull; <span className="font-medium text-slate/80">Step-by-step verification</span>
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleEditProblem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-ocean bg-sky/50 hover:bg-sky border border-ocean/20 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit problem</span>
              </button>
            </div>
          </div>

          {/* Reusing <StepInput /> component */}
          <StepInput
            question={customQuestionObject}
            initialSteps={studentSteps}
            onSubmitAttempt={handleAttemptSubmitted}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP C — DIAGNOSIS SUMMARY */}
      {/* ============================================================ */}
      {stage === 'diagnosed' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleEditWorking}
              className="inline-flex items-center gap-1.5 text-small font-semibold text-slate hover:text-navy group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
              <span>Back to working</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky text-ocean border border-sky/80">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Your problem</span>
            </span>
          </div>

          {/* HERO QUESTION PANEL */}
          <div className="bg-white rounded-[20px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-h3 font-medium text-slate">
                  Solve
                </span>
                <div className="text-2xl sm:text-3xl font-display font-bold text-navy">
                  <MathView math={problemInput} className="text-2xl sm:text-3xl font-bold" />
                </div>
              </div>
              <p className="text-small text-slate">
                Custom algebra problem
              </p>
            </div>
          </div>

          {/* CASE 1: ALL STEPS ARE CORRECT */}
          {isAllCorrect ? (
            <div className="bg-white rounded-[20px] border-2 border-[#22B573] shadow-[0_10px_30px_-12px_rgba(34,181,115,0.25)] p-6 sm:p-8 space-y-6 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-mint text-leaf flex items-center justify-center shrink-0 shadow-xs mx-auto sm:mx-0">
                  <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-leaf">
                    Verified Correct
                  </span>
                  <h2 className="text-h2 sm:text-display-lg font-display text-navy">
                    Every step checks out.
                  </h2>
                  <p className="text-body text-slate">
                    All your steps follow algebraic laws accurately.
                  </p>
                </div>
              </div>

              {/* Working breakdown preview */}
              <div className="bg-mist p-4 sm:p-5 rounded-xl border border-[#E3EEF7] space-y-2">
                <span className="text-xs font-bold text-slate uppercase tracking-wider block">
                  Your verified working:
                </span>
                <div className="space-y-1.5 font-mono text-sm sm:text-base">
                  {studentSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-[#E3EEF7]">
                      <span className="w-6 text-xs text-slate font-bold">{idx + 1}.</span>
                      <div className="font-semibold text-navy flex-1">
                        <MathView math={typeof step === 'string' ? step : step.rawInput || ''} />
                      </div>
                      <span className="text-xs font-semibold text-leaf bg-mint px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Correct
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setProblemInput('');
                    setStudentSteps(['']);
                    setAttemptResult(null);
                    updateStage('input_problem', 1);
                  }}
                  className="btn-secondary w-full sm:w-auto justify-center"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try another of your own</span>
                </button>

                <Link
                  to="/practice"
                  className="btn-primary w-full sm:w-auto justify-center"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Practice a topic</span>
                </Link>
              </div>
            </div>
          ) : isUnknownDiagnosis ? (
            /* CASE 2: UNKNOWN DIAGNOSIS */
            <div className="bg-white rounded-[20px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-mist text-slate flex items-center justify-center shrink-0 shadow-2xs">
                  <HelpCircle className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate">
                    Diagnosis Note
                  </span>
                  <h2 className="text-h2 font-display text-navy">
                    We couldn't pin down the reason
                  </h2>
                </div>
              </div>

              <div className="bg-sky/50 p-4 rounded-xl border border-sky space-y-2">
                <p className="text-body text-navy leading-relaxed">
                  Take another look at how the terms are grouped and moved across the equals sign. Make sure that any operation you apply to one side is mirrored on the other side.
                </p>
                <p className="text-small text-slate">
                  Working through our guided topic problems can help reinforce each pattern step-by-step.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleEditWorking}
                  className="btn-secondary w-full sm:w-auto justify-center"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Edit my working</span>
                </button>

                <Link
                  to="/practice"
                  className="btn-primary w-full sm:w-auto justify-center"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Practice a topic instead</span>
                </Link>
              </div>
            </div>
          ) : (
            /* CASE 3: KNOWN MISCONCEPTION DIAGNOSED */
            <DiagnosisSummary
              attemptResult={attemptResult}
              steps={studentSteps}
              onEditWorking={handleEditWorking}
              onShowWhy={handleShowWhy}
            />
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP C — INTERVENTION */}
      {/* ============================================================ */}
      {stage === 'intervention' && (
        <Intervention
          question={bankQuestion}
          misconceptionId={diagnosedMisconceptionId}
          attemptNumber={attemptNumber}
          onProceedToRetry={handleProceedToRetry}
        />
      )}

      {/* ============================================================ */}
      {/* STEP C — RETRY */}
      {/* ============================================================ */}
      {stage === 'retry' && (
        <div className="space-y-6 animate-fade-in">
          {/* Note before retry: Now try one of ours on the same idea */}
          <div className="bg-sky/70 p-4 rounded-2xl border border-ocean/30 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-ocean text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <p className="font-semibold text-navy text-sm sm:text-base">
                Now try one of ours on the same idea.
              </p>
              <p className="text-xs text-slate">
                We'll test this concept with a verified problem from the curriculum bank.
              </p>
            </div>
          </div>

          <Retry
            originalQuestion={bankQuestion}
            misconceptionId={diagnosedMisconceptionId}
            retryCount={retryCount}
            onPassRetry={handlePassRetry}
            onShowAlternateIntervention={handleShowAlternateIntervention}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP C — TRANSFER */}
      {/* ============================================================ */}
      {stage === 'transfer' && (
        <div className="bg-white rounded-[20px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)] p-8 text-center space-y-6 max-w-2xl mx-auto animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-mint text-leaf flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-7 h-7" strokeWidth={2} />
          </div>
          <div className="space-y-2">
            <h2 className="text-h2 font-display text-navy">
              Cross-Domain Transfer Challenge
            </h2>
            <p className="text-body text-slate">
              You've conquered your custom problem and mastered the underlying concept.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                setProblemInput('');
                setStudentSteps(['']);
                setAttemptResult(null);
                updateStage('input_problem', 1);
              }}
              className="btn-primary"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Solve another problem of your own</span>
            </button>
            <Link to="/practice" className="btn-secondary">
              <BookOpen className="w-4 h-4" />
              <span>Explore practice topics</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

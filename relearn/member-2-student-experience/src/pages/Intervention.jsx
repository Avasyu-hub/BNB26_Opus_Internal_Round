import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lightbulb, 
  ArrowRight, 
  Sparkles, 
  Check, 
  AlertCircle, 
  RefreshCw,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import MathView from '../components/MathView';
import { AnimationPlayer } from '../animations';
import { getIntervention, MISCONCEPTIONS } from '../api';

export default function Intervention({
  question,
  misconceptionId = 'M2',
  evidence = '',
  language = 'en',
  attemptNumber = 1,
  onProceedToRetry,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  // Parse values from question (e.g., 2(x + 3) => a=2, b=3)
  const parsedValues = useMemo(() => {
    const raw = question?.latex || '2(x + 3) = 14';
    const match = raw.match(/(\d+)\s*\(\s*([a-zA-Z])\s*([+-])\s*(\d+)\s*\)/);
    if (match) {
      return {
        a: parseInt(match[1], 10),
        variable: match[2],
        sign: match[3],
        b: parseInt(match[4], 10),
      };
    }
    return { a: 2, b: 3, variable: 'x', sign: '+' };
  }, [question]);

  const loadExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIntervention({ misconceptionId, evidence, language, attempt: attemptNumber });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load explanation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExplanation();
  }, [misconceptionId, attemptNumber, language]);

  // Enable button after animation finishes OR after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanProceed(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleAnimationComplete = () => {
    setAnimationCompleted(true);
    setCanProceed(true);
  };

  const misconception = MISCONCEPTIONS[misconceptionId] || MISCONCEPTIONS.M2;

  // Visual comparison items
  const studentComparison = {
    M1: {
      yours: '2x + 5 = 15 \\implies 2x = 15 \\color{#E5484D}{+ 5}',
      correct: '2x + 5 = 15 \\implies 2x = 15 \\mathbf{\\color{#22B573}{- 5}}',
      takeaway: 'Moving any term across the equals sign always flips its sign.',
    },
    M2: {
      yours: '2(x + 3) \\implies 2x + \\color{#E5484D}{3}',
      correct: '2(x + 3) \\implies 2x + \\mathbf{\\color{#22B573}{6}}',
      takeaway: 'Multiply EVERY term inside the bracket by the number outside.',
    },
    M3: {
      yours: '-(x + 4) \\implies -x \\color{#E5484D}{+ 4}',
      correct: '-(x + 4) \\implies -x \\mathbf{\\color{#22B573}{- 4}}',
      takeaway: 'A minus in front of a bracket changes the sign of EVERY term inside it.',
    },
    M4: {
      yours: '(x + 3)^2 \\implies x^2 \\color{#E5484D}{+ 9}',
      correct: '(x + 3)^2 \\implies x^2 \\mathbf{\\color{#22B573}{+ 6x}} + 9',
      takeaway: '(a + b)^2 is (a + b)(a + b): the two middle terms 2ab never disappear.',
    },
    M5: {
      yours: '3x + 5 \\implies \\color{#E5484D}{8x}',
      correct: '3x + 5 \\implies \\mathbf{\\color{#22B573}{3x + 5}} \\text{ (cannot combine)}',
      takeaway: 'Only add like terms (terms with identical variable powers).',
    },
    M6: {
      yours: '(-2)(-3x) \\implies \\color{#E5484D}{-6x}',
      correct: '(-2)(-3x) \\implies \\mathbf{\\color{#22B573}{6x}}',
      takeaway: 'A negative times a negative is always positive.',
    },
  }[misconceptionId] || {
    yours: '2(x + 3) \\implies 2x + \\color{#E5484D}{3}',
    correct: '2(x + 3) \\implies 2x + \\mathbf{\\color{#22B573}{6}}',
    takeaway: 'Multiply EVERY term inside the bracket by the number outside.',
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto font-body">
      {/* SECOND ATTEMPT BANNER (If attempt === 2) */}
      {attemptNumber >= 2 && (
        <div className="bg-sky/60 p-4 rounded-2xl border border-ocean/30 flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-ocean text-white flex items-center justify-center shrink-0 shadow-xs">
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <h4 className="font-heading font-bold text-navy text-sm sm:text-base">
              Let's look at it another way.
            </h4>
            <p className="text-small text-slate">
              Here is an alternate representation to make the concept crystal clear.
            </p>
          </div>
        </div>
      )}

      {/* TWO COLUMNS: 6 / 6 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (6 / 12): Animation Player */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-2 rounded-[24px] bg-soft-gradient border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)]">
            <AnimationPlayer
              id={misconceptionId}
              values={parsedValues}
              onComplete={handleAnimationComplete}
            />
          </div>

          <div className="px-2 text-center sm:text-left">
            <p className="text-xs text-slate">
              Interactive SVG proof demonstrating the area decomposition model for binomial expansion.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN (6 / 12): Explanation & Comparison */}
        <div className="lg:col-span-6 bg-white rounded-[20px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)] p-6 sm:p-8 space-y-6">
          {/* Label & Headline */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-ocean bg-sky/60 px-3 py-1 rounded-full inline-block">
              Let's see why
            </span>
            <h2 className="text-h2 sm:text-display-lg font-display text-navy tracking-tight pt-1">
              {misconception.name}
            </h2>
          </div>

          {/* Explanation Text */}
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-slate/15 rounded-md w-full" />
              <div className="h-4 bg-slate/15 rounded-md w-5/6" />
              <div className="h-4 bg-slate/15 rounded-md w-4/6" />
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-[#FDE7E8]/50 border border-[#E5484D]/30 flex items-center justify-between gap-3">
              <p className="text-small text-[#E5484D]">Couldn't load the explanation. Try again.</p>
              <button
                type="button"
                onClick={loadExplanation}
                className="btn-secondary text-xs px-3 py-1 h-auto"
              >
                Retry
              </button>
            </div>
          ) : (
            data?.explanation ? (
              <div className="space-y-3 text-body text-navy leading-relaxed">
                <p>{data.explanation}</p>
              </div>
            ) : misconceptionId === 'M2' ? (
              <div className="space-y-3 text-body text-navy leading-relaxed">
                <p>
                  When a number sits right outside brackets like <MathView math={`${parsedValues.a}(${parsedValues.variable} + ${parsedValues.b})`} />, it multiplies <strong>everything</strong> inside.
                </p>
                <p className="text-slate">
                  Think of it as finding the total area of two adjacent rooms: width {parsedValues.a} by length {parsedValues.variable} gives <MathView math={`${parsedValues.a}${parsedValues.variable}`} />, and width {parsedValues.a} by length {parsedValues.b} gives <MathView math={`${parsedValues.a * parsedValues.b}`} />.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-body text-navy leading-relaxed">
                <p>{misconception.description}</p>
              </div>
            )
          )}

          {/* YOUR STEP VS THE CORRECT STEP COMPARISON */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate block">
              Your step vs the correct step
            </span>

            {/* Stacked Mini Rows */}
            <div className="space-y-2.5">
              {/* Yours */}
              <div className="p-3.5 rounded-xl border border-[#E3EEF7] border-l-4 border-l-[#E5484D] bg-[#FDE7E8]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-[#E5484D] uppercase tracking-wider">Yours:</span>
                  <div className="text-body font-semibold text-navy">
                    <MathView math={studentComparison.yours} />
                  </div>
                </div>
                <span className="text-xs text-[#E5484D] font-medium font-pen">The mistake</span>
              </div>

              {/* Correct */}
              <div className="p-3.5 rounded-xl border border-[#E3EEF7] border-l-4 border-l-[#22B573] bg-[#DDF5E9]/25 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-[#22B573] uppercase tracking-wider">Correct:</span>
                  <div className="text-body font-semibold text-navy">
                    <MathView math={studentComparison.correct} />
                  </div>
                </div>
                <span className="text-xs text-[#22B573] font-bold bg-[#DDF5E9] px-2 py-0.5 rounded-md">
                  ✓ Full distribution
                </span>
              </div>
            </div>
          </div>

          {/* ONE-LINE TAKEAWAY IN MINT BOX */}
          <div className="bg-mint/80 p-4 rounded-xl border border-leaf/30 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-leaf text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <Lightbulb className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-leaf block mb-0.5">
                Key Takeaway
              </span>
              <p className="text-small font-semibold text-navy">
                {studentComparison.takeaway}
              </p>
            </div>
          </div>

          {/* PRIMARY BUTTON: TRY ANOTHER ONE -> STEP 8 */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onProceedToRetry}
              disabled={!canProceed}
              className="btn-primary w-full justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Try another one</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
            {!canProceed && (
              <p className="text-xs text-slate text-center mt-2">
                Watch the proof above or wait a moment to continue…
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

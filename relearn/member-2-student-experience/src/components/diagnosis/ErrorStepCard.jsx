import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Check, Sparkles } from 'lucide-react';
import MathView from '../MathView';

export default function ErrorStepCard({
  steps = [],
  error_step_index = null,
  evidence = '',
  marginNote = '',
  highlightText = '',
  animate = true,
}) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [showNote, setShowNote] = useState(!animate);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    if (animate && !mediaQuery.matches) {
      const timer = setTimeout(() => {
        setShowNote(true);
      }, 950); // 300ms delay + 650ms draw
      return () => clearTimeout(timer);
    } else {
      setShowNote(true);
    }
  }, [animate]);

  const noteText = marginNote || evidence || 'Check this line!';
  const isAllCorrect = error_step_index === null || error_step_index === undefined;

  return (
    <div className="bg-white rounded-[20px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)] p-6 relative overflow-hidden font-body">
      {/* Notebook Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            'linear-gradient(to right, #E6F0F8 1px, transparent 1px), linear-gradient(to bottom, #E6F0F8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between pb-4 mb-5 border-b border-[#E3EEF7]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-ocean" />
          <span className="text-small font-bold text-navy uppercase tracking-wider">
            Step-by-Step Analysis
          </span>
        </div>

        {isAllCorrect ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-mint text-leaf border border-leaf/30 shadow-2xs">
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>All correct</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDE7E8] text-[#E5484D] border border-[#E5484D]/30 shadow-2xs">
            <span>Error on line {(error_step_index ?? 0) + 1}</span>
          </span>
        )}
      </div>

      {/* Notebook Lines with Left Margin Line */}
      <div className="relative z-10 pl-6 sm:pl-8 border-l-2 border-ocean/35 space-y-4 ml-2 sm:ml-4">
        {steps.map((stepRaw, index) => {
          const isBeforeError = !isAllCorrect && index < error_step_index;
          const isErrorStep = !isAllCorrect && index === error_step_index;
          const isAfterError = !isAllCorrect && index > error_step_index;

          return (
            <div key={index} className="space-y-2">
              <div
                className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                  isErrorStep
                    ? 'bg-[#FDE7E8]/20 border border-[#E5484D]/30'
                    : isAfterError
                    ? 'opacity-45'
                    : 'bg-white/60'
                }`}
                aria-label={
                  isErrorStep
                    ? `Line ${index + 1}: this is where it went wrong. ${evidence}`
                    : `Line ${index + 1}`
                }
              >
                {/* Left: Step Number, Status Icon, and Math */}
                <div className="flex items-center gap-3 relative">
                  {/* Step status icon in margin */}
                  <div className="w-6 text-center select-none flex items-center justify-center">
                    {isAllCorrect || isBeforeError ? (
                      <span className="w-5 h-5 rounded-full bg-mint text-leaf flex items-center justify-center text-xs shadow-2xs">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </span>
                    ) : isErrorStep ? (
                      <span className="w-5 h-5 rounded-full bg-[#E5484D] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        !
                      </span>
                    ) : (
                      <span className="text-small font-mono text-slate/60">
                        {index + 1}.
                      </span>
                    )}
                  </div>

                  {/* Expression Container */}
                  <div className="relative inline-block px-3 py-1">
                    <span className="text-h3 font-semibold text-navy">
                      <MathView math={stepRaw} className="katex-large" />
                    </span>

                    {/* Animated Hand-Drawn Wobbly Red Ellipse */}
                    {isErrorStep && (
                      <svg
                        className="absolute -inset-x-3 -inset-y-2 w-[calc(100%+24px)] h-[calc(100%+16px)] pointer-events-none z-10"
                        viewBox="0 0 240 56"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <motion.path
                          d="M 12 28 C 14 10, 226 6, 232 26 C 238 46, 32 52, 10 30"
                          stroke="#E5484D"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={
                            animate && !isReducedMotion
                              ? { pathLength: 0, opacity: 0 }
                              : { pathLength: 1, opacity: 1 }
                          }
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{
                            delay: animate && !isReducedMotion ? 0.3 : 0,
                            duration: animate && !isReducedMotion ? 0.65 : 0,
                            ease: 'easeOut',
                          }}
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Right: Margin Note in Kalam 700 with curved arrow */}
                {isErrorStep && showNote && (
                  <motion.div
                    initial={
                      animate && !isReducedMotion
                        ? { opacity: 0, scale: 0.95, y: 3 }
                        : { opacity: 1, scale: 1, y: 0 }
                    }
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="mt-3 sm:mt-0 sm:ml-4 flex items-center gap-2 self-start sm:self-center font-pen text-[#E5484D] text-base sm:text-lg font-bold sm:-rotate-3 bg-[#FDE7E8] px-3 py-1 rounded-xl border border-[#E5484D]/30 shadow-xs select-none"
                  >
                    {/* Tiny curved arrow */}
                    <svg
                      className="w-4 h-4 shrink-0 -scale-x-100 hidden sm:block"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M4 12a8 8 0 018-8v4l6-6-6-6v4a12 12 0 00-12 12z" />
                    </svg>
                    <span>{noteText}</span>
                  </motion.div>
                )}
              </div>

              {/* Sub-note under consecutive steps after error */}
              {isAfterError && index === error_step_index + 1 && (
                <p className="text-xs text-slate italic pl-9">
                  These lines follow from the mistake above.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ALL CORRECT CALM BANNER */}
      {isAllCorrect && (
        <div className="mt-6 bg-mint/80 p-4 rounded-xl border border-leaf/30 flex items-center gap-3 text-leaf relative z-10 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-leaf text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div>
            <h4 className="font-heading font-bold text-navy text-sm sm:text-base">
              Every step checks out.
            </h4>
            <p className="text-small text-slate">
              Great job! Your algebraic reasoning is sound and balanced across all lines.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

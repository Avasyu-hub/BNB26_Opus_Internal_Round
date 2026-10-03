import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Sparkles, Check, AlertCircle } from 'lucide-react';
import MathView from '../MathView';

export default function HeroDemo() {
  const [step, setStep] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setStep(6);
    }
  }, []);

  const runAnimation = useCallback(() => {
    setStep(0);
    const t0 = setTimeout(() => setStep(1), 600);   // Step 1: 2x + 3 = 14
    const t1 = setTimeout(() => setStep(2), 1600);  // Step 2: 2x = 11
    const t2 = setTimeout(() => setStep(3), 2600);  // Step 3: x = 5.5
    const t3 = setTimeout(() => setStep(4), 3800);  // Red circle & margin note
    const t4 = setTimeout(() => setStep(5), 4800);  // Diagnosis tag
    const t5 = setTimeout(() => setStep(6), 5800);  // Transfer check

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  useEffect(() => {
    if (!isReducedMotion) {
      return runAnimation();
    }
  }, [isReducedMotion, runAnimation]);

  const handleReplay = () => {
    runAnimation();
  };

  return (
    <div className="w-full max-w-xl mx-auto lg:max-w-none">
      <div className="bg-white/95 backdrop-blur-xl rounded-[26px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border-2 border-white/80 p-5 sm:p-7 text-navy relative overflow-hidden transition-all duration-300 hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)]">
        {/* Notebook Squared Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-45"
          style={{
            backgroundImage:
              'linear-gradient(to right, #E2EEF8 1px, transparent 1px), linear-gradient(to bottom, #E2EEF8 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        {/* Notebook Top Bar with window controls */}
        <div className="relative z-10 flex items-center justify-between pb-4 mb-4 border-b border-[#E3EEF7]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#E5484D] shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#14A3A3] shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#22B573] shadow-xs" />
            <span className="ml-2 text-xs font-bold text-slate uppercase tracking-wider font-body">
              Live Notebook Simulator
            </span>
          </div>

          <button
            type="button"
            onClick={handleReplay}
            className="text-xs font-bold text-ocean hover:text-navy px-3.5 py-1.5 rounded-xl bg-sky/70 hover:bg-sky transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean shadow-2xs hover:scale-105 active:scale-95"
            title="Replay notebook sequence"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>Replay</span>
          </button>
        </div>

        {/* Live Notebook Content */}
        <div className="relative z-10 space-y-3.5 font-body min-h-[320px]">
          {/* Problem Statement Card */}
          <div className="bg-mist/90 px-4 py-3 rounded-2xl border border-[#E3EEF7] flex items-center justify-between shadow-2xs">
            <span className="text-xs font-bold text-slate uppercase tracking-wider">Problem</span>
            <div className="text-h3 font-bold text-navy">
              <MathView math="2(x + 3) = 14" className="katex-large" />
            </div>
          </div>

          {/* Left Margin Line with Steps */}
          <div className="pl-4 sm:pl-6 border-l-2 border-ocean/40 space-y-3 ml-1 sm:ml-2">
            {/* Step 1 with Hand-drawn Red Ellipse and Margin Note */}
            <div
              className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-xl transition-all duration-300 ${
                step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-slate/70 w-4">1.</span>
                <div className="relative inline-block px-3 py-1">
                  <span className="text-h3 font-semibold text-navy">
                    <MathView math="2x + 3 = 14" />
                  </span>

                  {/* Red Hand-Drawn SVG Ellipse */}
                  {step >= 4 && (
                    <svg
                      className="absolute -inset-x-3 -inset-y-2 w-[calc(100%+24px)] h-[calc(100%+16px)] pointer-events-none"
                      viewBox="0 0 160 46"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 8 23 C 10 9, 148 4, 153 22 C 157 37, 24 43, 6 25"
                        stroke="#E5484D"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="400"
                        strokeDashoffset="0"
                        className={isReducedMotion ? '' : 'animate-[draw_0.7s_ease-out_forwards]'}
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Margin Note in Handwritten Kalam Font */}
              {step >= 4 && (
                <div className="mt-2 sm:mt-0 flex items-center gap-1.5 text-base font-pen font-bold text-[#E5484D] bg-[#FDE7E8] px-3.5 py-1 rounded-full border border-[#E5484D]/40 transition-all animate-fade-in shadow-xs self-start sm:self-center -rotate-2">
                  <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
                  <span>2 &times; 3 is missing!</span>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div
              className={`flex items-center gap-2.5 p-2 rounded-xl transition-all duration-300 ${
                step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              }`}
            >
              <span className="text-xs font-mono font-bold text-slate/70 w-4">2.</span>
              <span className="text-h3 font-semibold text-navy px-3">
                <MathView math="2x = 11" />
              </span>
            </div>

            {/* Step 3 */}
            <div
              className={`flex items-center gap-2.5 p-2 rounded-xl transition-all duration-300 ${
                step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              }`}
            >
              <span className="text-xs font-mono font-bold text-slate/70 w-4">3.</span>
              <span className="text-h3 font-semibold text-navy px-3">
                <MathView math="x = 5.5" />
              </span>
            </div>
          </div>

          {/* Diagnosis Tag */}
          {step >= 5 && (
            <div className="mt-4 pt-3 border-t border-[#E3EEF7] animate-fade-in">
              <div className="flex items-start gap-3 bg-mist p-3.5 rounded-2xl border border-[#E3EEF7] shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-full bg-ocean mt-1.5 shrink-0 animate-ping" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ocean block">
                    Diagnosed Misconception
                  </span>
                  <p className="text-body text-navy font-bold mt-0.5">
                    Multiplying only the first term in a bracket
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Check Prompt */}
          {step >= 6 && (
            <div className="mt-2 bg-[#DDF5E9]/90 p-3.5 rounded-2xl border border-[#22B573]/50 transition-all animate-fade-in flex items-start gap-3 shadow-2xs">
              <span className="bg-teal text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shrink-0 mt-0.5 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} />
                Transfer check
              </span>
              <p className="text-small text-navy leading-relaxed font-semibold">
                Now try it in geometry: a rectangle 2 m by <MathView math="(x+3)" /> m…
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

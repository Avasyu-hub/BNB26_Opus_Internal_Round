/* STUB — replaced by Member 3 */
import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import MathView from '../components/MathView';

/**
 * AnimationPlayer Component
 * Contract with Member 3:
 * @param {string} id - Misconception ID or animation key (e.g., 'M1', 'M2', 'distribution-area')
 * @param {object} values - Parameters extracted from student question (e.g., { a: 2, b: 3 })
 * @param {function} onComplete - Callback triggered when visual proof completes
 */
export default function AnimationPlayer({
  id = 'M2',
  values = { a: 2, b: 3 },
  onComplete,
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            if (onComplete) onComplete();
            return 100;
          }
          return prev + 20;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, onComplete]);

  const handleReplay = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  const a = values.a || 2;
  const b = values.b || 3;

  return (
    <div className="w-full bg-white rounded-2xl p-6 flex flex-col justify-between min-h-[340px] relative font-body select-none">
      {/* Visual Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4">
        <div className="w-16 h-16 rounded-2xl bg-sky flex items-center justify-center text-ocean shadow-xs">
          <Sparkles className="w-8 h-8" strokeWidth={1.75} />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-ocean bg-sky/60 px-3 py-0.5 rounded-full inline-block">
            Visual Proof: {id}
          </span>
          <h4 className="text-h3 font-display font-bold text-navy">
            Geometric Area Model
          </h4>
          <p className="text-small text-slate max-w-sm mx-auto">
            Showing why <MathView math={`${a}(x + ${b}) = ${a}x + ${a * b}`} />
          </p>
        </div>

        {/* Geometric Area Representation Simulation */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {/* Box 1: a * x */}
          <div className="w-24 h-16 rounded-xl bg-ocean/15 border-2 border-ocean flex flex-col items-center justify-center text-ocean font-bold text-sm shadow-xs transition-all duration-300">
            <span className="text-xs text-slate">Width {a} &times; x</span>
            <span>{a}x</span>
          </div>

          {/* Plus sign */}
          <span className="text-h3 font-bold text-slate">+</span>

          {/* Box 2: a * b */}
          <div className="w-24 h-16 rounded-xl bg-teal/15 border-2 border-teal flex flex-col items-center justify-center text-teal font-bold text-sm shadow-xs transition-all duration-300">
            <span className="text-xs text-slate">Width {a} &times; {b}</span>
            <span className="text-[#22B573] font-bold">{a * b}</span>
          </div>
        </div>
      </div>

      {/* Animation Progress & Controls */}
      <div className="pt-4 border-t border-[#E3EEF7] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReplay}
            className="p-2 rounded-xl bg-mist hover:bg-sky/50 text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
            title="Replay visual proof"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
          </button>
          <span className="text-xs font-medium text-slate">
            {progress < 100 ? `Playing visual proof (${progress}%)` : 'Proof complete ✓'}
          </span>
        </div>

        <div className="w-32 h-2 bg-mist rounded-full overflow-hidden border border-[#E3EEF7]">
          <div
            className="h-full bg-progress-gradient transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

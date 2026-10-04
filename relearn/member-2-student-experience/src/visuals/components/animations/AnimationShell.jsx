import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * Shared frame for every visual proof.
 * - Steps through `stages` (each { caption, duration }) automatically.
 * - Renders `children(stage)` inside a fixed 500×300 viewBox (never clips).
 * - Calls onComplete once the last stage is reached during autoplay.
 */
export default function AnimationShell({
  title, law, stages, autoPlay = true, onComplete, className = '', children,
}) {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const reduce = useReducedMotion();
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const last = stages.length - 1;

  useEffect(() => {
    if (!playing) return undefined;
    if (stage >= last) { setPlaying(false); completeRef.current?.(); return undefined; }
    const ms = (stages[stage]?.duration ?? 1800) * (reduce ? 1.4 : 1);
    const t = setTimeout(() => setStage((s) => Math.min(s + 1, last)), ms);
    return () => clearTimeout(t);
  }, [playing, stage, last, stages, reduce]);

  const go = (s) => { setPlaying(false); setStage(Math.max(0, Math.min(last, s))); };
  const replay = () => { setStage(0); setPlaying(true); };

  return (
    <figure className={`w-full rounded-xl border border-slate-700/70 bg-slate-900 p-4 text-slate-100 ${className}`}>
      <header className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        {law && <span className="text-xs text-slate-400">{law}</span>}
      </header>

      <svg
        viewBox="0 0 500 300" width="100%" preserveAspectRatio="xMidYMid meet"
        role="img" aria-label={`${title}: ${stages[stage]?.caption ?? ''}`}
        className="block select-none"
      >
        {children(stage)}
      </svg>

      <figcaption className="mt-3 min-h-[3rem] text-[15px] leading-relaxed text-slate-200" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            {stages[stage]?.caption}
          </motion.p>
        </AnimatePresence>
      </figcaption>

      <div className="mt-3 flex items-center gap-2">
        <button type="button" onClick={() => go(stage - 1)} disabled={stage === 0}
          className="rounded-md px-2.5 py-1 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
          aria-label="Previous step">◀</button>
        <div className="flex flex-1 items-center gap-1.5" aria-hidden="true">
          {stages.map((_, i) => (
            <button key={i} type="button" tabIndex={-1} onClick={() => go(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= stage ? 'bg-sky-400' : 'bg-slate-700'}`} />
          ))}
        </div>
        <button type="button" onClick={() => go(stage + 1)} disabled={stage === last}
          className="rounded-md px-2.5 py-1 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
          aria-label="Next step">▶</button>
        <button type="button" onClick={playing ? () => setPlaying(false) : replay}
          className="ml-1 rounded-md bg-slate-800 px-3 py-1 text-sm text-slate-100 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400">
          {playing ? 'Pause' : 'Replay'}
        </button>
      </div>
    </figure>
  );
}

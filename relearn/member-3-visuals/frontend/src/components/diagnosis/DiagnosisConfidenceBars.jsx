import { motion } from 'framer-motion';
import { labelOf } from '../../theme/nodeStates';

/**
 * C — Live differentiation bars. Member 2 mounts this inside the diagnosis card.
 * Reads the optional `diagnosis.candidates` ([{ label, score }]); renders nothing if it is missing.
 */
export default function DiagnosisConfidenceBars({ diagnosis, max = 3, showRawIds = true }) {
  const raw = diagnosis?.candidates;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const top = raw
    .map((c) => ({ id: c.label ?? c.misconception_id ?? c.id, score: Number(c.score ?? c.confidence ?? 0) }))
    .filter((c) => c.id)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
  if (!top.length) return null;

  return (
    <div className="w-full rounded-lg border border-slate-700/70 bg-slate-950/60 p-3" role="group" aria-label="Model's top guesses">
      <div className="mb-2 text-sm text-slate-300">What else the model considered</div>
      <ul className="space-y-2">
        {top.map((c, i) => (
          <li key={c.id} className="grid grid-cols-[minmax(0,14.5rem)_1fr_3rem] items-center gap-3 text-sm">
            <span className={`truncate text-[13px] ${i === 0 ? 'font-semibold text-slate-100' : 'text-slate-400'}`} title={c.id}>
              {showRawIds ? c.id : labelOf(c.id)}
            </span>
            <span className="h-2.5 overflow-hidden rounded-full bg-slate-800">
              <motion.span className="block h-full rounded-full"
                style={{ background: i === 0 ? '#f97316' : '#64748b' }}
                initial={{ width: 0 }} animate={{ width: `${Math.max(1.5, c.score * 100)}%` }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.12, ease: 'easeOut' }} />
            </span>
            <span className={`text-right tabular-nums ${i === 0 ? 'text-slate-100' : 'text-slate-400'}`}>{c.score.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      {diagnosis.decided_by && (
        <div className="mt-2.5 text-xs text-slate-400">Decided by: <span className="text-slate-200">{diagnosis.decided_by}</span></div>
      )}
    </div>
  );
}

import { useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useFetchWithFallback } from '../../lib/useFetchWithFallback';
import { MISCONCEPTIONS, NODE_STATES, labelOf } from '../../theme/nodeStates';
import { eventsFromHistory } from '../graph/deriveNodeStates';
import mockHistory from '../../mocks/history.json';

// Y-axis: cognitive status, ordered by mastery.
const LEVEL = { diagnosed: 1, recurred: 1, transfer_failed: 2, retry_passed: 3, transfer_passed: 4 };
const LEVEL_LABEL = { 1: 'Diagnosed', 2: 'Transfer failed', 3: 'Retry passed', 4: 'Transfer passed' };
const STAGE_STATE = {
  diagnosed: 'detected', recurred: 'recurred', retry_passed: 'resolved_algebra',
  transfer_passed: 'transfer_verified', transfer_failed: 'transfer_failed',
};
// Line colours identify the misconception; dot colours show the state.
const SERIES = ['#38bdf8', '#f472b6', '#facc15', '#2dd4bf', '#a5b4fc', '#fb923c'];

function rowsOf(history) {
  return Array.isArray(history) ? history : history?.attempts ?? history?.history ?? [];
}

/** Marks a 'diagnosed' after a previous resolution as 'recurred' (same rule as the graph). */
function withRecurrence(rows) {
  const grouped = eventsFromHistory(rows);
  const out = [];
  for (const [id, evs] of Object.entries(grouped)) {
    let resolved = false;
    for (const e of evs) {
      const stage = e.stage === 'diagnosed' && resolved ? 'recurred' : e.stage;
      if (e.stage === 'retry_passed' || e.stage === 'transfer_passed') resolved = true;
      out.push({ ...e, misconception_id: id, stage });
    }
  }
  return out.sort((a, b) => (a.attempt ?? 0) - (b.attempt ?? 0) || String(a.timestamp).localeCompare(String(b.timestamp)));
}

function StateDot({ cx, cy, payload, dataKey }) {
  if (cx == null || cy == null || payload?.[dataKey] == null) return null;
  const stage = payload.meta?.[dataKey]?.stage;
  const st = STAGE_STATE[stage] ?? 'inactive';
  const c = NODE_STATES[st].color;
  return (
    <g>
      {st === 'transfer_failed' && <circle cx={cx} cy={cy} r={10} fill="none" stroke={c} strokeWidth={2} />}
      <circle cx={cx} cy={cy} r={5.5} fill={c} stroke="#0f172a" strokeWidth={2}
        strokeDasharray={st === 'recurred' ? '2 2' : undefined} />
    </g>
  );
}

function TimelineTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-lg">
      <div className="mb-1 text-slate-400">Attempt {row.attempt}</div>
      {Object.entries(row.meta).map(([id, m]) => (
        <div key={id}>
          <span className="font-medium">{labelOf(id)}</span>: {NODE_STATES[STAGE_STATE[m.stage]]?.label ?? m.stage}
          {m.context && m.context !== 'algebra' && <span className="text-slate-400"> in {m.context}</span>}
        </div>
      ))}
    </div>
  );
}

/**
 * W6 — Knowledge Evolution Timeline.
 * Pass `history` directly, or `studentId` to fetch GET /student/{id}/history (falls back to mock).
 */
export default function KnowledgeTimeline({ studentId, history: historyProp, height = 320 }) {
  const { data, source } = useFetchWithFallback(
    studentId ? `/student/${studentId}/history` : null, mockHistory, { skip: Boolean(historyProp) || !studentId },
  );
  const history = historyProp ?? data;

  const { rows, ids, outcomes } = useMemo(() => {
    const evs = withRecurrence(rowsOf(history));
    const byAttempt = new Map();
    for (const e of evs) {
      const key = e.attempt ?? byAttempt.size + 1;
      if (!byAttempt.has(key)) byAttempt.set(key, { attempt: key, meta: {} });
      const r = byAttempt.get(key);
      r[e.misconception_id] = LEVEL[e.stage] ?? null;
      r.meta[e.misconception_id] = e;
    }
    const idsSeen = [...new Set(evs.map((e) => e.misconception_id))].filter((id) => MISCONCEPTIONS[id]);
    const out = evs.filter((e) => e.stage === 'transfer_passed' || e.stage === 'transfer_failed' || e.stage === 'recurred');
    return { rows: [...byAttempt.values()], ids: idsSeen, outcomes: out };
  }, [history]);

  if (!history) return <div className="text-sm text-slate-400">Loading history…</div>;
  if (!rows.length) return <div className="text-sm text-slate-400">No attempts yet. Answer a question to start the timeline.</div>;

  return (
    <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900 p-4 text-slate-100">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold">How this student's understanding changed</h3>
        {source === 'mock' && !historyProp && <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">Mock data</span>}
      </header>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 10, right: 16, bottom: 4, left: 8 }}>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis dataKey="attempt" padding={{ left: 14, right: 14 }} stroke="#64748b" tick={{ fill: '#334155', fontSize: 12 }}
              label={{ value: 'Attempt', position: 'insideBottomRight', offset: -2, fill: '#64748b', fontSize: 12 }} />
            <YAxis domain={[0.5, 4.5]} ticks={[1, 2, 3, 4]} tickFormatter={(v) => LEVEL_LABEL[v]} width={110}
              stroke="#64748b" tick={{ fill: '#334155', fontSize: 12 }} />
            <Tooltip content={<TimelineTooltip />} cursor={{ stroke: '#334155' }} />
            <Legend wrapperStyle={{ fontSize: 13 }} formatter={(id) => <span className="text-slate-300">{labelOf(id)}</span>} />
            {ids.map((id, i) => (
              <Line key={id} dataKey={id} name={id} type="linear" connectNulls
                stroke={SERIES[i % SERIES.length]} strokeWidth={2.5}
                dot={<StateDot />} activeDot={false} isAnimationActive />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {outcomes.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {outcomes.map((e, i) => {
            const st = STAGE_STATE[e.stage];
            return (
              <li key={i} className="rounded-full border px-3 py-1"
                style={{ borderColor: NODE_STATES[st].color, color: NODE_STATES[st].color, borderStyle: st === 'recurred' ? 'dashed' : 'solid' }}>
                #{e.attempt} {labelOf(e.misconception_id)}:{' '}
                {e.stage === 'transfer_passed' && `cleared in ${e.context ?? 'a new context'}`}
                {e.stage === 'transfer_failed' && `persisted into ${e.context ?? 'a new context'}`}
                {e.stage === 'recurred' && 'came back'}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList, Legend,
} from 'recharts';
import { useFetchWithFallback } from '../../lib/useFetchWithFallback';
import { labelOf } from '../../theme/nodeStates';
import { pct } from '../../lib/format';
import ConfusionMatrix from './ConfusionMatrix';
import mockSummary from '../../mocks/evalSummary.json';

const axis = { stroke: '#475569', tick: { fill: '#334155', fontSize: 12 } };
const tip = {
  contentStyle: { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' },
  itemStyle: { color: '#e2e8f0' }, labelStyle: { color: '#94a3b8' }, cursor: { fill: 'rgba(148,163,184,.08)' },
};

function Panel({ title, note, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-slate-700/70 bg-slate-900 p-4 ${className}`}>
      <h3 className="text-[15px] font-semibold text-slate-100">{title}</h3>
      {note && <p className="mt-0.5 text-sm text-slate-400">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Stat({ value, label, sub }) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900 px-4 py-3">
      <div className="text-2xl font-semibold tabular-nums text-slate-50">{value}</div>
      <div className="mt-0.5 text-sm text-slate-300">{label}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

/**
 * D — Model Performance panel. Route: /evaluation. Reads GET /eval/summary; falls back to mock JSON
 * and labels it "Mock data" so placeholder numbers can never be mistaken for results.
 */
export default function ModelPerformance({ summary: summaryProp, endpoint = '/eval/summary' }) {
  const { data, source } = useFetchWithFallback(endpoint, mockSummary, { skip: Boolean(summaryProp) });
  const s = summaryProp ?? data;
  const isMock = !summaryProp && source === 'mock';

  if (!s) return <div className="p-6 text-slate-400">Loading evaluation results…</div>;
  const hl = s.headline ?? {};
  const ablation = s.ablation ?? [];
  const best = Math.max(...ablation.map((a) => a.accuracy), 0);
  const composition = (s.composition ?? []).map((c) => ({ ...c, name: labelOf(c.label) }));
  const loo = (s.leave_one_out ?? []).map((l) => ({ ...l, name: labelOf(l.held_out) }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 text-slate-100">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">How well the diagnosis model works</h2>
          <p className="mt-1 text-slate-300">All metrics on held-out data not seen during training.</p>
        </div>
        {isMock && (
          <span className="rounded-md bg-amber-500/15 px-3 py-1.5 text-sm text-amber-300">
            Mock data: connect GET {endpoint || '/eval/summary'} to show real results
          </span>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat value={hl.dataset_size?.toLocaleString() ?? '–'} label="Labelled examples"
          sub={hl.real_rows ? `${hl.synthetic_rows?.toLocaleString()} synthetic, ${hl.real_rows?.toLocaleString()} real`
            : hl.hand_authored_rows ? `${hl.synthetic_rows?.toLocaleString()} synthetic + ${hl.hand_authored_rows} hand-written test cases`
            : undefined} />
        <Stat value={hl.unseen_template_accuracy != null ? pct(hl.unseen_template_accuracy, 1) : '–'} label="Accuracy on unseen templates" />
        {hl.real_trace_accuracy != null || hl.test_trace_accuracy == null ? (
          <Stat value={hl.real_trace_accuracy != null ? pct(hl.real_trace_accuracy, 1) : '–'} label="Accuracy on real student work" />
        ) : (
          <Stat value={pct(hl.test_trace_accuracy, 1)} label="Accuracy on hand-written test cases"
            sub={`${hl.hand_authored_rows ?? ''} cases, not real student work`} />
        )}
        <Stat value={hl.error_step_accuracy != null ? pct(hl.error_step_accuracy, 1) : '–'} label="Finds the wrong step" />
        <Stat value={hl.unknown_rate != null ? pct(hl.unknown_rate, 1) : '–'} label="Answered “unknown”" sub="instead of guessing" />
      </div>

      {s.labels && s.confusion_matrix && (
        <Panel title="Which misconception the model picked, against the true one"
          note="Green diagonal = correct. Red cells = the model confused two labels; darker means more often.">
          <ConfusionMatrix labels={s.labels} matrix={s.confusion_matrix} />
        </Panel>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {ablation.length > 0 && (
          <Panel title="Why combine rules, a model and an LLM?" note="Accuracy of each part alone versus the full system.">
            <div style={{ height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={ablation} margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="system" {...axis} interval={0} />
                  <YAxis domain={[0, 1]} tickFormatter={(v) => pct(v)} {...axis} />
                  <Tooltip {...tip} formatter={(v) => [pct(v, 1), 'Accuracy']} />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                    {ablation.map((a) => <Cell key={a.system} fill={a.accuracy === best ? '#22c55e' : '#475569'} />)}
                    <LabelList dataKey="accuracy" position="top" formatter={(v) => pct(v, 1)} fill="#e2e8f0" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}

        {loo.length > 0 && (
          <Panel title="When the model meets a misconception it never saw"
            note="Each one was left out of training. Bars show how often it was correctly sent to “unknown” instead of a wrong label.">
            <div style={{ height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={loo} layout="vertical" margin={{ top: 0, right: 44, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => pct(v)} {...axis} />
                  <YAxis type="category" dataKey="name" width={150} {...axis} />
                  <Tooltip {...tip} formatter={(v) => [pct(v, 1), 'Routed to unknown']} />
                  <Bar dataKey="routed_to_unknown" fill="#a855f7" radius={[0, 6, 6, 0]}>
                    <LabelList dataKey="routed_to_unknown" position="right" formatter={(v) => pct(v)} fill="#0f172a" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}
      </div>

      {composition.length > 0 && (
        <Panel title="What the dataset contains" note="Examples per label, split into generated (synthetic) and collected from real students.">
          <div style={{ height: Math.max(240, composition.length * 34) }}>
            <ResponsiveContainer>
              <BarChart data={composition} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" horizontal={false} />
                <XAxis type="number" {...axis} />
                <YAxis type="category" dataKey="name" width={150} {...axis} />
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: 13 }} />
                <Bar dataKey="synthetic" name="Synthetic" stackId="a" fill="#3b82f6" />
                <Bar dataKey="real" name="Real student work" stackId="a" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}

      <p className="border-t border-slate-800 pt-3 text-sm text-slate-400">All metrics on held-out data not seen during training.</p>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { VisualProof, VISUAL_PROOFS } from '../components/animations';
import { MisconceptionGraph } from '../components/graph';
import KnowledgeTimeline from '../components/timeline/KnowledgeTimeline';
import ModelPerformance from '../components/eval/ModelPerformance';
import DiagnosisConfidenceBars from '../components/diagnosis/DiagnosisConfidenceBars';
import MultimodalFusionCard from '../components/fusion/MultimodalFusionCard';
import { MISCONCEPTIONS, labelOf } from '../theme/nodeStates';
import mockHistory from '../mocks/history.json';
import mockDiagnosis from '../mocks/diagnosis.json';
import mockAttempt from '../mocks/fusionAttempt.json';

const TABS = [
  ['proofs', 'Visual proofs'], ['graph', 'Misconception graph'], ['timeline', 'Timeline (W6)'],
  ['eval', 'Model performance'], ['bars', 'Confidence bars'], ['fusion', 'Fusion card (W4)'],
];

// Demo script: two active at once → retry → hero failure → recurrence
const SCRIPT = [
  ['PARTIAL_DISTRIBUTION', 'diagnosed'],
  ['TRANSPOSITION', 'diagnosed'],
  ['PARTIAL_DISTRIBUTION', 'retry_passed'],
  ['TRANSPOSITION', 'retry_passed'],
  ['TRANSPOSITION', 'transfer_passed'],
  ['PARTIAL_DISTRIBUTION', 'transfer_failed'],
  ['UNLIKE_TERMS', 'diagnosed'],
  ['UNLIKE_TERMS', 'retry_passed'],
  ['UNLIKE_TERMS', 'diagnosed'],
];
const EVENTS = [
  ['diagnosed', 'Diagnosed'], ['retry_passed', 'Retry passed'],
  ['transfer_passed', 'Transfer passed'], ['transfer_failed', 'Transfer failed'],
];

function GraphLab() {
  const [events, setEvents] = useState({});
  const [pick, setPick] = useState('PARTIAL_DISTRIBUTION');
  const [running, setRunning] = useState(false);
  const step = useRef(0);

  const push = (id, stage) => setEvents((ev) => ({ ...ev, [id]: [...(ev[id] ?? []), { stage }] }));
  const profile = useMemo(() => ({ misconceptions: Object.fromEntries(Object.entries(events).map(([k, v]) => [k, { events: v }])) }), [events]);

  useEffect(() => {
    if (!running) return undefined;
    if (step.current >= SCRIPT.length) { setRunning(false); return undefined; }
    const t = setTimeout(() => { push(...SCRIPT[step.current]); step.current += 1; setEvents((e) => ({ ...e })); }, step.current === 0 ? 300 : 1700);
    return () => clearTimeout(t);
  }, [running, events]);

  const reset = () => { setRunning(false); step.current = 0; setEvents({}); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => { reset(); setTimeout(() => setRunning(true), 0); }}
          className="rounded-md bg-sky-500 px-3 py-1.5 text-sm font-medium text-slate-950 hover:bg-sky-400">Play demo script</button>
        <button onClick={reset} className="rounded-md bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700">Reset</button>
        <span className="mx-2 h-5 w-px bg-slate-700" />
        <label className="text-sm text-slate-400" htmlFor="mpick">Send event for</label>
        <select id="mpick" value={pick} onChange={(e) => setPick(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm">
          {Object.keys(MISCONCEPTIONS).map((id) => <option key={id} value={id}>{labelOf(id)}</option>)}
        </select>
        {EVENTS.map(([k, l]) => (
          <button key={k} onClick={() => push(pick, k)} className="rounded-md border border-slate-700 px-2.5 py-1.5 text-sm hover:bg-slate-800">{l}</button>
        ))}
      </div>
      <MisconceptionGraph profile={profile} height={430} />
      <details className="text-sm text-slate-400">
        <summary className="cursor-pointer">Profile passed to the graph</summary>
        <pre className="mt-2 overflow-x-auto rounded-md bg-slate-900 p-3 text-xs">{JSON.stringify(profile, null, 2)}</pre>
      </details>
    </div>
  );
}

function ProofLab() {
  const [id, setId] = useState('PARTIAL_DISTRIBUTION');
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose a visual proof">
        {Object.keys(VISUAL_PROOFS).map((k) => (
          <button key={k} role="tab" aria-selected={id === k} onClick={() => setId(k)}
            className={`rounded-full px-3 py-1.5 text-sm ${id === k ? 'bg-slate-100 text-slate-900' : 'border border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
            {labelOf(k)}
          </button>
        ))}
      </div>
      <div className="max-w-2xl">
        <VisualProof misconceptionId={id} />
      </div>
    </div>
  );
}

export default function Member3Preview() {
  const [tab, setTab] = useState('proofs');
  return (
    <div className="min-h-full bg-white text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="mb-5">
          <h1 className="text-xl font-semibold">Re:Learn · visuals and graph engine</h1>
          <p className="mt-1 text-sm text-slate-400">Standalone preview of Member 3's components with mock data.</p>
        </header>
        <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-800" role="tablist">
          {TABS.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm ${tab === k ? 'border-sky-400 text-slate-50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              {l}
            </button>
          ))}
        </nav>
        {tab === 'proofs' && <ProofLab />}
        {tab === 'graph' && <GraphLab />}
        {tab === 'timeline' && <KnowledgeTimeline history={mockHistory} />}
        {tab === 'eval' && <ModelPerformance endpoint={null} />}
        {tab === 'bars' && (
          <div className="max-w-xl space-y-4">
            <DiagnosisConfidenceBars diagnosis={mockDiagnosis} />
            <p className="text-sm text-slate-400">With no <code>candidates</code> field the component renders nothing:</p>
            <div className="rounded-md border border-dashed border-slate-700 p-3 text-sm text-slate-500">
              <DiagnosisConfidenceBars diagnosis={{ misconception_id: 'PARTIAL_DISTRIBUTION' }} />(empty)
            </div>
          </div>
        )}
        {tab === 'fusion' && <MultimodalFusionCard attempt={mockAttempt} diagnosis={mockDiagnosis} />}
      </div>
    </div>
  );
}

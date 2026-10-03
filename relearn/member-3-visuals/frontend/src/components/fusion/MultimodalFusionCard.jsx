import { allows } from '../../lib/features';
import { labelOf, MISCONCEPTIONS } from '../../theme/nodeStates';
import DiagnosisConfidenceBars from '../diagnosis/DiagnosisConfidenceBars';

/**
 * W4 — Multimodal Fusion Card (stretch). Every pane is optional: missing data hides its pane.
 * A pane is hidden if its data is missing or its flag (W1 photo, W2 quote, W3 telemetry) is false.
 */
export default function MultimodalFusionCard({ attempt = {}, diagnosis = {} }) {
  const { question, student_id, steps = [], photo_url, thinking_quote, telemetry } = attempt;
  const errorStep = diagnosis.error_step;
  const root = diagnosis.root_concept ?? MISCONCEPTIONS[diagnosis.misconception_id]?.roots?.[0];
  const showPhoto = Boolean(photo_url) && allows('W1');
  const showQuote = Boolean(thinking_quote) && allows('W2');
  const showTelemetry = telemetry?.confidence != null && allows('W3');

  return (
    <article className="w-full rounded-xl border border-slate-700/70 bg-slate-900 text-slate-100">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800 px-4 py-3">
        <h3 className="font-semibold" style={{ fontFamily: "'Cambria Math', Cambria, Georgia, serif" }}>{question}</h3>
        {student_id && <span className="text-xs text-slate-400">Student {student_id}</span>}
      </header>
      <div className="grid gap-4 p-4 md:grid-cols-2">
        <div className="space-y-3">
          <ol className="space-y-1.5">
            {steps.map((s, i) => {
              const bad = errorStep === i + 1;
              return (
                <li key={i} className={`flex gap-3 rounded-md px-2 py-1 ${bad ? 'bg-orange-500/15 ring-1 ring-orange-500/60' : ''}`}>
                  <span className="w-5 text-right text-xs text-slate-500 tabular-nums">{i + 1}</span>
                  <span style={{ fontFamily: "'Cambria Math', Cambria, Georgia, serif" }}>{s}</span>
                  {bad && <span className="ml-auto text-xs text-orange-300">error here</span>}
                </li>
              );
            })}
          </ol>
          {showPhoto && <img src={photo_url} alt="Student's handwritten working" className="max-h-40 rounded-md border border-slate-700 object-contain" />}
          {showQuote && (
            <blockquote className="border-l-2 border-slate-600 pl-3 text-sm italic text-slate-300">"{thinking_quote}"</blockquote>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-500/15 px-3 py-1 text-sm text-orange-300">{labelOf(diagnosis.misconception_id)}</span>
            {root && <span className="rounded-full border border-slate-600 px-3 py-1 text-sm text-slate-300">Root: {labelOf(root)}</span>}
            {showTelemetry && (
              <span className="rounded-full border border-sky-500/50 px-3 py-1 text-sm text-sky-300">
                Student confidence {Math.round(telemetry.confidence * 100)}%
              </span>
            )}
          </div>
          {diagnosis.evidence && <p className="text-sm leading-relaxed text-slate-300">{diagnosis.evidence}</p>}
          <DiagnosisConfidenceBars diagnosis={diagnosis} />
        </div>
      </div>
    </article>
  );
}

import { useState } from 'react';
import { labelOf } from '../../theme/nodeStates';

const SHORT = {
  PARTIAL_DISTRIBUTION: 'PD', SQUARE_OF_SUM: 'SQ', NEGATIVE_DISTRIBUTION: 'ND', TRANSPOSITION: 'TR',
  UNLIKE_TERMS: 'UT', NEG_TIMES_NEG: 'NN', ARITHMETIC_SLIP: 'SLIP', UNKNOWN: 'UNK',
};
const short = (id) => SHORT[id] ?? id.slice(0, 4);

/**
 * Row-normalised confusion matrix as a CSS grid heatmap.
 * Diagonal = green by recall; off-diagonal = red by share of the row.
 */
export default function ConfusionMatrix({ labels, matrix }) {
  const [hover, setHover] = useState(null);
  const n = labels.length;
  const rowSums = matrix.map((r) => r.reduce((a, b) => a + b, 0) || 1);

  const cellStyle = (i, j) => {
    const p = matrix[i][j] / rowSums[i];
    if (i === j) return { background: `rgba(34,197,94,${0.15 + 0.85 * p})`, color: '#000' };
    const a = Math.min(1, p * 4); // small confusions still visible
    return { background: a === 0 ? '#0f172a' : `rgba(239,68,68,${0.08 + 0.85 * a})`, color: '#000' };
  };

  const h = hover && {
    t: labels[hover.i], p: labels[hover.j], v: matrix[hover.i][hover.j],
    pct: ((matrix[hover.i][hover.j] / rowSums[hover.i]) * 100).toFixed(1),
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="inline-grid min-w-full gap-[3px] text-xs"
          style={{ gridTemplateColumns: `auto repeat(${n}, minmax(2.6rem, 1fr))` }}
          role="table" aria-label="Confusion matrix: rows are true labels, columns are predictions"
          onMouseLeave={() => setHover(null)}>
          <div className="self-end pb-1 pr-2 text-right text-[11px] text-slate-500">true ↓ / predicted →</div>
          {labels.map((l) => (
            <div key={`c-${l}`} className="pb-1 text-center font-medium text-slate-400" title={labelOf(l)} role="columnheader">{short(l)}</div>
          ))}
          {labels.map((rowLabel, i) => (
            <div key={`r-${rowLabel}`} className="contents" role="row">
              <div className="flex items-center justify-end whitespace-nowrap pr-2 text-slate-300" title={rowLabel} role="rowheader">
                {labelOf(rowLabel)}
              </div>
              {labels.map((colLabel, j) => (
                <button key={`${i}-${j}`} type="button" role="cell"
                  className={`flex h-10 items-center justify-center rounded tabular-nums transition-[outline] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${hover?.i === i && hover?.j === j ? 'outline outline-2 outline-slate-100' : ''}`}
                  style={cellStyle(i, j)}
                  onMouseEnter={() => setHover({ i, j })} onFocus={() => setHover({ i, j })}
                  aria-label={`True ${labelOf(rowLabel)}, predicted ${labelOf(colLabel)}: ${matrix[i][j]}`}>
                  {matrix[i][j] || ''}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-2 min-h-[1.5rem] text-sm text-slate-300" aria-live="polite">
        {h ? (
          <>True <b className="text-slate-100">{labelOf(h.t)}</b> predicted as <b className="text-slate-100">{labelOf(h.p)}</b>:{' '}
            {h.v} examples ({h.pct}% of that row){h.t === h.p ? ', correct' : ''}.</>
        ) : 'Hover or focus a cell to see counts.'}
      </p>
    </div>
  );
}

import React from 'react';
import ModelPerformance from '../visuals/components/eval/ModelPerformance';

/** Real evaluation results from GET /eval/summary (python -m backend.eval.run_eval). */
export default function EvaluationPage() {
  return (
    <div className="rounded-[24px] bg-slate-950 border border-slate-800 p-5 sm:p-8">
      <ModelPerformance endpoint="/eval/summary" />
    </div>
  );
}

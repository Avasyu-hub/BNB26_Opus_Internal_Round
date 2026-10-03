import React from 'react';
import ContentPanel from '../components/ContentPanel';

export default function EvaluationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy tracking-tight">
          Empirical Evaluation Results
        </h1>
        <p className="text-slate text-sm">
          Stage 1 Placeholder &mdash; Controlled evaluation metrics, pre/post gains, and Cohen's d effect sizes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ContentPanel>
          <div className="text-xs font-semibold text-slate uppercase tracking-wider mb-1">Pre-Test Avg</div>
          <div className="text-2xl font-extrabold font-heading text-slate">42.1%</div>
        </ContentPanel>
        <ContentPanel>
          <div className="text-xs font-semibold text-slate uppercase tracking-wider mb-1">Post-Test Avg</div>
          <div className="text-2xl font-extrabold font-heading text-ocean">84.6%</div>
        </ContentPanel>
        <ContentPanel>
          <div className="text-xs font-semibold text-slate uppercase tracking-wider mb-1">Average Gain</div>
          <div className="text-2xl font-extrabold font-heading text-leaf">+42.5%</div>
        </ContentPanel>
        <ContentPanel>
          <div className="text-xs font-semibold text-slate uppercase tracking-wider mb-1">Effect Size (d)</div>
          <div className="text-2xl font-extrabold font-heading text-teal">1.62</div>
        </ContentPanel>
      </div>

      <ContentPanel title="Misconception Resolution Rates (M1 - M6)">
        <div className="p-8 text-center bg-mist/50 rounded-xl border border-dashed border-panel-border">
          <span className="text-3xl mb-2 block">🔬</span>
          <p className="text-sm text-slate max-w-md mx-auto">
            Pre-test vs post-test misconception prevalence, transfer task verification, and ablation benchmark charts will be displayed here.
          </p>
        </div>
      </ContentPanel>
    </div>
  );
}

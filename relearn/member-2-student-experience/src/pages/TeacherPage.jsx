import React from 'react';
import ContentPanel from '../components/ContentPanel';

export default function TeacherPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy tracking-tight">
          Teacher Dashboard
        </h1>
        <p className="text-slate text-sm">
          Stage 1 Placeholder &mdash; Classroom aggregate analytics, misconception clusters, and alert feeds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ContentPanel title="Active Students" className="md:col-span-1">
          <div className="text-3xl font-extrabold font-heading text-ocean mb-1">28</div>
          <p className="text-xs text-slate">Students enrolled in Grade 8 Algebra</p>
        </ContentPanel>

        <ContentPanel title="Active Interventions" className="md:col-span-1">
          <div className="text-3xl font-extrabold font-heading text-teal mb-1">6</div>
          <p className="text-xs text-slate">Students currently undergoing visual remediation</p>
        </ContentPanel>

        <ContentPanel title="Average Mastery" className="md:col-span-1">
          <div className="text-3xl font-extrabold font-heading text-leaf mb-1">78.4%</div>
          <p className="text-xs text-slate">Post-remediation accuracy across 6 misconceptions</p>
        </ContentPanel>
      </div>

      <ContentPanel title="Classroom Misconception Breakdown">
        <div className="p-8 text-center bg-mist/50 rounded-xl border border-dashed border-panel-border">
          <span className="text-3xl mb-2 block">📈</span>
          <p className="text-sm text-slate max-w-md mx-auto">
            Interactive chart of M1&ndash;M6 prevalence, real-time student alert stream, and exportable intervention reports will be mounted here.
          </p>
        </div>
      </ContentPanel>
    </div>
  );
}

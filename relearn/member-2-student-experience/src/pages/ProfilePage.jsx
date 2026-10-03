import React from 'react';
import ContentPanel from '../components/ContentPanel';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const { student } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy tracking-tight">
          My Progress & Mastery
        </h1>
        <p className="text-slate text-sm">
          Stage 1 Placeholder &mdash; Student misconception history and mastery progression.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ContentPanel title="Student Profile" className="md:col-span-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-sky flex items-center justify-center text-3xl">
              {student.avatar || '👨‍🎓'}
            </div>
            <div>
              <h3 className="font-heading font-bold text-navy text-lg">{student.name}</h3>
              <p className="text-xs text-slate">{student.grade} &bull; ID: {student.id}</p>
            </div>
          </div>
          <div className="bg-mist p-3 rounded-xl border border-panel-border text-xs text-slate space-y-1">
            <div className="flex justify-between">
              <span>Remediation Status:</span>
              <span className="font-semibold text-leaf">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Transfer Accuracy:</span>
              <span className="font-semibold text-ocean">100%</span>
            </div>
          </div>
        </ContentPanel>

        <ContentPanel title="Misconception Remediation History" className="md:col-span-2">
          <div className="p-8 text-center bg-mist/50 rounded-xl border border-dashed border-panel-border">
            <span className="text-3xl mb-2 block">📊</span>
            <p className="text-sm text-slate max-w-md mx-auto">
              Historical diagnosis records, visual interactive remediation replays, and transfer task evaluations will appear here.
            </p>
          </div>
        </ContentPanel>
      </div>
    </div>
  );
}

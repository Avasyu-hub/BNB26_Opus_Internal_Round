import React from 'react';
import ContentPanel from '../components/ContentPanel';
import LearnerGraph from '../components/progress/LearnerGraph';
import { useApp } from '../context/AppContext';
import { getStudentId } from '../api';

export default function ProfilePage() {
  const { student } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy tracking-tight">
          My Progress & Mastery
        </h1>
        <p className="text-slate text-sm">
          Every misconception Re:Learn has found in your work, and how far you are in fixing it.
        </p>
      </div>

      <ContentPanel title="Student Profile">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky flex items-center justify-center text-3xl">
            {student.avatar || '👨‍🎓'}
          </div>
          <div>
            <h3 className="font-heading font-bold text-navy text-lg">{student.name}</h3>
            <p className="text-xs text-slate">{student.grade} &bull; ID: {getStudentId()}</p>
          </div>
        </div>
      </ContentPanel>

      <LearnerGraph height={460} />

      <p className="text-xs text-slate">
        Orange: found in your work &middot; Blue: fixed in algebra &middot; Green: verified in a new subject &middot;
        Red ring: still shows up in a new subject &middot; Purple: came back after being fixed &middot; Amber: flagged for your teacher
      </p>
    </div>
  );
}

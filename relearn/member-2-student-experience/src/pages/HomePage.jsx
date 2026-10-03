import React from 'react';
import { Link } from 'react-router-dom';
import ContentPanel from '../components/ContentPanel';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy tracking-tight">
          Practice & Remediation
        </h1>
        <p className="text-slate text-sm sm:text-base">
          Welcome to RE:Learn. Select an algebraic problem to begin step-by-step reasoning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ContentPanel
          title="Equation Practice"
          subtitle="Stage 1 Placeholder"
          hover={true}
        >
          <p className="text-sm text-slate mb-4">
            Practice two-step and distributive linear equations with intelligent misconception diagnosis.
          </p>
          <Link
            to="/practice/q1"
            className="inline-flex items-center justify-center px-4 py-2 bg-ocean hover:bg-[#165bb3] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
          >
            Start Question 1 (3(x + 4) = 27) &rarr;
          </Link>
        </ContentPanel>

        <ContentPanel
          title="Student Progress"
          subtitle="Mastery & History"
          hover={true}
        >
          <p className="text-sm text-slate mb-4">
            Track diagnosed misconceptions, remediation progress, and transfer task mastery.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center px-4 py-2 bg-mist hover:bg-sky/50 text-navy text-sm font-semibold rounded-xl border border-panel-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
          >
            View Progress &rarr;
          </Link>
        </ContentPanel>

        <ContentPanel
          title="Teacher Analytics"
          subtitle="Classroom Overview"
          hover={true}
        >
          <p className="text-sm text-slate mb-4">
            Monitor real-time class misconception distribution, student alerts, and intervention pathways.
          </p>
          <Link
            to="/teacher"
            className="inline-flex items-center justify-center px-4 py-2 bg-mist hover:bg-sky/50 text-navy text-sm font-semibold rounded-xl border border-panel-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
          >
            Teacher Dashboard &rarr;
          </Link>
        </ContentPanel>
      </div>
    </div>
  );
}

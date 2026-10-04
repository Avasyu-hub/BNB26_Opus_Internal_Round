import React, { useEffect, useState } from 'react';
import TeacherDashboard from '../teacher/TeacherDashboard';
import { getClassSummary } from '../api';

/** Member 4's dashboard, fed by GET /class/summary (a simulated cohort, labelled as such). */
export default function TeacherPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getClassSummary().then(setSummary).catch((e) => setError(e.message || 'Could not load the class summary'));
  }, []);

  if (error) return <p className="text-sm text-[#E5484D]">{error}</p>;
  if (!summary) return <div className="h-64 animate-pulse rounded-[20px] bg-mist" />;
  return <TeacherDashboard summaryData={summary} />;
}

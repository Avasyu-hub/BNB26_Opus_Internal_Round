import React, { useEffect, useState } from 'react';
import MisconceptionGraph from '../../visuals/components/graph/MisconceptionGraph';
import { getProfile, getStudentId } from '../../api';

/**
 * Member 3's misconception graph for the current student, coloured from the
 * backend learner profile (GET /student/{id}/profile).
 * Change `refreshKey` to reload it, e.g. after a transfer result.
 */
export default function LearnerGraph({ refreshKey = 0, height = 420, title = 'Your misconception map' }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    getProfile(getStudentId())
      .then((p) => alive && setProfile(p))
      .catch((e) => alive && setError(e.message || 'Could not load your progress'));
    return () => { alive = false; };
  }, [refreshKey]);

  return (
    <div className="rounded-[20px] bg-white border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)] p-4 sm:p-5 space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-heading font-bold text-navy text-base sm:text-lg">{title}</h3>
        <span className="text-xs text-slate">Updates after every attempt</span>
      </div>
      {error && <p className="text-sm text-[#E5484D]">{error}</p>}
      {!error && !profile && <div className="h-40 animate-pulse rounded-xl bg-mist" />}
      {profile && <MisconceptionGraph profile={profile} height={height} />}
    </div>
  );
}

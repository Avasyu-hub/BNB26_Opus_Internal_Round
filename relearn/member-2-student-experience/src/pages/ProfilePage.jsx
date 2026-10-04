import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  PlusCircle,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import ContentPanel from '../components/ContentPanel';
import MathView from '../components/MathView';
import { useApp } from '../context/AppContext';
import { getHistory, MISCONCEPTIONS } from '../api';

export default function ProfilePage() {
  const { student } = useApp();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory(student.id)
      .then((data) => {
        setHistory(data || []);
      })
      .catch((err) => {
        console.error('Failed to load history:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [student.id]);

  const customAttemptsCount = history.filter((h) => h.isCustom || h.questionId === 'CUSTOM').length;
  const resolvedCount = history.filter((h) => h.isResolved || h.status === 'completed').length;

  return (
    <div className="space-y-8 font-body max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="space-y-2 text-left">
        <div className="inline-flex items-center gap-2 bg-sky/70 px-3.5 py-1 rounded-full text-ocean text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Student Analytics</span>
        </div>
        <h1 className="text-h1 sm:text-display-lg font-display text-navy tracking-tight">
          My Progress & Activity
        </h1>
        <p className="text-body text-slate max-w-2xl">
          Review your practice history, custom problems, and diagnosed misconception resolutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Student Profile Card & Summary Metrics */}
        <div className="md:col-span-1 space-y-6">
          <ContentPanel title="Student Profile">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-sky flex items-center justify-center text-3xl shadow-2xs">
                {student.avatar || '👨‍🎓'}
              </div>
              <div>
                <h3 className="font-heading font-bold text-navy text-lg">{student.name}</h3>
                <p className="text-xs text-slate">{student.grade} &bull; ID: {student.id}</p>
              </div>
            </div>

            <div className="bg-mist p-4 rounded-xl border border-panel-border text-xs text-slate space-y-2.5">
              <div className="flex justify-between items-center">
                <span>Total attempts logged:</span>
                <span className="font-bold text-navy text-sm">{history.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Custom problems solved:</span>
                <span className="font-bold text-ocean text-sm">{customAttemptsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Concepts resolved:</span>
                <span className="font-bold text-leaf text-sm">{resolvedCount}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#E3EEF7]">
                <span>Remediation Status:</span>
                <span className="font-semibold text-leaf bg-mint px-2 py-0.5 rounded-md">Active</span>
              </div>
            </div>

            {/* CTA to solve own problem */}
            <div className="mt-5 pt-4 border-t border-[#E3EEF7]">
              <Link
                to="/practice/custom"
                className="w-full h-10 rounded-xl bg-sky/70 hover:bg-sky text-ocean font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-sky"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Solve your own problem</span>
              </Link>
            </div>
          </ContentPanel>
        </div>

        {/* Right Column: History Feed */}
        <div className="md:col-span-2">
          <ContentPanel title="Practice & Attempt History">
            {loading ? (
              <div className="space-y-3 animate-pulse p-4">
                <div className="h-16 bg-mist rounded-xl w-full" />
                <div className="h-16 bg-mist rounded-xl w-full" />
                <div className="h-16 bg-mist rounded-xl w-full" />
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center bg-mist/50 rounded-xl border border-dashed border-panel-border space-y-3">
                <span className="text-3xl block">📊</span>
                <p className="text-sm text-slate max-w-md mx-auto">
                  No practice attempts logged yet. Try solving your own problem or pick a topic to start!
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link to="/practice/custom" className="btn-primary text-xs py-2 px-4">
                    Solve your own problem
                  </Link>
                  <Link to="/practice" className="btn-secondary text-xs py-2 px-4">
                    Practice topics
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#E3EEF7]">
                {history.map((item, idx) => {
                  const isCustom = item.isCustom || item.questionId === 'CUSTOM';
                  const isResolved = item.isResolved || item.status === 'completed';
                  const misId = item.diagnosedMisconceptions?.[0];
                  const misDetails = misId ? MISCONCEPTIONS[misId] : null;

                  return (
                    <div
                      key={item.attemptId || idx}
                      className="p-4 hover:bg-sky/15 transition-colors rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Badges & Problem Formula */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* "Your problem" Chip */}
                          {isCustom && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky text-ocean border border-sky/80 shadow-2xs">
                              <Sparkles className="w-3 h-3" strokeWidth={2.2} />
                              <span>Your problem</span>
                            </span>
                          )}

                          {/* Topic / Question ID Badge */}
                          <span className="text-[11px] font-semibold text-slate bg-mist px-2 py-0.5 rounded-md border border-[#E3EEF7]">
                            {isCustom ? 'Custom' : item.questionId || 'Question'}
                          </span>

                          {/* Date & Time */}
                          {item.timestamp && (
                            <span className="text-[11px] text-slate/70 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.timestamp).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>

                        {/* Equation / Problem LaTeX */}
                        <div className="text-base sm:text-lg font-bold text-navy">
                          <MathView math={item.question || item.steps?.[0]?.rawInput || '2(x + 3) = 14'} />
                        </div>

                        {/* Misconception diagnosed tag if any */}
                        {misDetails && !isResolved && (
                          <p className="text-xs text-[#E5484D] font-medium flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Diagnosed: {misDetails.name}</span>
                          </p>
                        )}
                      </div>

                      {/* Right: Status Pill & Step Count */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-mint text-leaf border border-leaf/30 shadow-2xs">
                            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                            <span>Resolved ✓</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDE7E8] text-[#E5484D] border border-[#E5484D]/30 shadow-2xs">
                            <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                            <span>Needs work</span>
                          </span>
                        )}

                        <span className="text-[11px] text-slate/80 font-medium">
                          {item.steps?.length || 1} {item.steps?.length === 1 ? 'step' : 'steps'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ContentPanel>
        </div>
      </div>
    </div>
  );
}

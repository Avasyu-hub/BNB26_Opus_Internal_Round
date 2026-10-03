import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import FLAGS from '../../config/flags';

export default function TeacherPreview() {
  if (!FLAGS.W7) return null;

  const columns = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
  const students = [
    { name: 'Aarav S.', status: ['resolved', 'resolved', 'none', 'active', 'none', 'none'] },
    { name: 'Ananya D.', status: ['none', 'active', 'none', 'none', 'resolved', 'none'] },
    { name: 'Diya K.', status: ['resolved', 'resolved', 'resolved', 'none', 'none', 'active'] },
    { name: 'Ishaan M.', status: ['active', 'none', 'resolved', 'none', 'active', 'none'] },
    { name: 'Meera P.', status: ['none', 'resolved', 'none', 'resolved', 'none', 'none'] },
    { name: 'Rohan G.', status: ['active', 'active', 'none', 'none', 'none', 'resolved'] },
    { name: 'Siddharth R.', status: ['resolved', 'none', 'active', 'none', 'resolved', 'none'] },
    { name: 'Tanvi B.', status: ['none', 'resolved', 'none', 'active', 'none', 'none'] },
  ];

  const getCellBadge = (status) => {
    if (status === 'resolved') {
      return (
        <span className="w-6 h-6 rounded-lg bg-[#DDF5E9] text-[#22B573] flex items-center justify-center text-xs font-bold mx-auto shadow-2xs" title="Resolved">
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
        </span>
      );
    }
    if (status === 'active') {
      return (
        <span className="w-6 h-6 rounded-lg bg-[#FFF3B0] text-[#0F2A44] flex items-center justify-center text-xs font-bold mx-auto shadow-2xs border border-[#FFF3B0]" title="Needs attention">
          <AlertTriangle className="w-3.5 h-3.5 text-[#E5484D]" strokeWidth={2} />
        </span>
      );
    }
    return <span className="w-1.5 h-1.5 rounded-full bg-slate/25 block mx-auto" />;
  };

  return (
    <section className="py-16 sm:py-24 bg-white" aria-labelledby="teacher-section-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-ocean bg-sky/70 px-3.5 py-1 rounded-full inline-block shadow-2xs">
              For Teachers & Educators
            </span>
            <h2
              id="teacher-section-heading"
              className="text-h2 sm:text-display-lg font-display text-navy tracking-tight"
            >
              Understand your entire classroom in one view
            </h2>
            <p className="text-body text-slate leading-relaxed">
              See which mistakes your whole class is making, who shares the same one, and who fixed something in algebra but still gets it wrong in physics.
            </p>
            <div className="pt-3">
              <Link
                to="/teacher"
                className="btn-secondary"
              >
                <span>Open the teacher view</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            </div>
          </div>

          {/* Right Heatmap Static Preview */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[22px] border border-[#E3EEF7] shadow-[0_15px_35px_-10px_rgba(30,111,217,0.18)] p-6 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#E3EEF7] gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky flex items-center justify-center text-ocean shadow-2xs">
                    <Users className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-navy uppercase tracking-wider block">
                      Classroom Misconception Matrix
                    </span>
                    <span className="text-[11px] text-slate">Grade 8 &bull; 28 Active Students</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate font-medium bg-mist px-3 py-1.5 rounded-xl border border-[#E3EEF7]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-[#DDF5E9] text-[#22B573] flex items-center justify-center font-bold text-[10px]">✓</span> Resolved
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-[#FFF3B0] text-[#E5484D] flex items-center justify-center font-bold text-[10px]">!</span> Active
                  </span>
                </div>
              </div>

              {/* Table Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-small border-collapse">
                  <thead>
                    <tr className="border-b border-[#E3EEF7] text-slate">
                      <th className="py-2.5 px-3 font-semibold">Student</th>
                      {columns.map((col) => (
                        <th key={col} className="py-2.5 px-3 text-center font-bold text-navy font-display">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3EEF7]/70 font-body">
                    {students.map((student) => (
                      <tr key={student.name} className="hover:bg-sky/20 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-navy whitespace-nowrap">
                          {student.name}
                        </td>
                        {student.status.map((st, idx) => (
                          <td key={idx} className="py-2.5 px-3 text-center">
                            {getCellBadge(st)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

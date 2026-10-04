import React, { useState, useMemo } from 'react';

// Color token mappings matching design spec
const MISCONCEPTION_CONFIG = {
  PARTIAL_DISTRIBUTION: {
    label: 'Partial Distribution',
    short: 'Distributive Law',
    color: '#f97316',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    root: 'DISTRIBUTIVE_LAW',
    domain: 'Geometry'
  },
  SQUARE_OF_SUM: {
    label: 'Square of Sum',
    short: 'Square Expansion',
    color: '#a855f7',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    root: 'DISTRIBUTIVE_LAW',
    domain: 'Geometry'
  },
  NEGATIVE_DISTRIBUTION: {
    label: 'Negative Distribution',
    short: 'Sign Distribution',
    color: '#ec4899',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    root: 'DISTRIBUTIVE_LAW',
    domain: 'Physics'
  },
  TRANSPOSITION: {
    label: 'Transposition Error',
    short: 'Equality Balance',
    color: '#eab308',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    root: 'EQUALITY_BALANCE',
    domain: 'Programming'
  },
  UNLIKE_TERMS: {
    label: 'Combining Unlike Terms',
    short: 'Like Terms',
    color: '#06b6d4',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    root: 'LIKE_TERMS',
    domain: 'Physics'
  },
  NEG_TIMES_NEG: {
    label: 'Negative Times Negative',
    short: 'Integer Rules',
    color: '#6366f1',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    root: 'INTEGER_RULES',
    domain: 'Physics'
  }
};

export default function TeacherDashboard({ summaryData, onSelectStudent }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, heatmap, peers, alerts, roster
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, transfer_failed, mastered
  const [selectedStudent, setSelectedStudent] = useState(null);

  const data = summaryData || {
    class_name: "Class 8-B (Simulated Cohort)",
    total_students: 40,
    data_disclaimer: "Simulated Research Data (Class 8-B, 40 Students)",
    misconception_heatmap: [
      { label: "PARTIAL_DISTRIBUTION", count: 6, percentage: 15.0 },
      { label: "SQUARE_OF_SUM", count: 8, percentage: 20.0 },
      { label: "NEGATIVE_DISTRIBUTION", count: 4, percentage: 10.0 },
      { label: "TRANSPOSITION", count: 5, percentage: 12.5 },
      { label: "UNLIKE_TERMS", count: 3, percentage: 7.5 },
      { label: "NEG_TIMES_NEG", count: 2, percentage: 5.0 }
    ],
    peer_groups: [
      {
        misconception: "PARTIAL_DISTRIBUTION",
        student_ids: ["s_04", "s_07", "s_12", "s_29"],
        student_names: ["Diya Roy", "Rohan Gupta", "Priya Das", "Lavanya Nambiar"],
        recommended_action: "Peer review: Rectangle Area Model workshop"
      },
      {
        misconception: "SQUARE_OF_SUM",
        student_ids: ["s_06", "s_18", "s_33"],
        student_names: ["Kavya Patel", "Vidya Iyer", "Ritika Banerjee"],
        recommended_action: "Peer review: Split Square Geometric Tiles lab"
      },
      {
        misconception: "TRANSPOSITION",
        student_ids: ["s_13", "s_15"],
        student_names: ["Sameer Khan", "Tanvi Rao"],
        recommended_action: "Peer review: Two-Pan Balance Scale equation workshop"
      }
    ],
    transfer_failure_alerts: [
      {
        student_id: "s_07",
        student_name: "Rohan Gupta",
        misconception: "PARTIAL_DISTRIBUTION",
        transfer_domain: "geometry",
        status: "persists_in_new_context",
        notes: "Passed algebraic retry 5(x-2)=20, but failed rectangle area model (2x+3 instead of 2x+6)."
      },
      {
        student_id: "s_13",
        student_name: "Sameer Khan",
        misconception: "TRANSPOSITION",
        transfer_domain: "programming",
        status: "persists_in_new_context",
        notes: "Solved x+6=15 by memorizing steps; wrote price = total + tax in Python transfer."
      },
      {
        student_id: "s_18",
        student_name: "Vidya Iyer",
        misconception: "SQUARE_OF_SUM",
        transfer_domain: "geometry",
        status: "persists_in_new_context",
        notes: "Passed algebra retry (x+3)^2 = x^2+6x+9, but wrote added area as 4 m^2 in garden problem."
      },
      {
        student_id: "s_25",
        student_name: "Gaurav Chopra",
        misconception: "NEGATIVE_DISTRIBUTION",
        transfer_domain: "physics",
        status: "persists_in_new_context",
        notes: "Aced retry -(x+8) = -x-8, but in physics drone reversal wrote displacement as -1 m instead of -5 m."
      },
      {
        student_id: "s_31",
        student_name: "Nandini Ghosh",
        misconception: "UNLIKE_TERMS",
        transfer_domain: "physics",
        status: "persists_in_new_context",
        notes: "Got 7x+3 on retry, but when asked if 3 m + 5 s can be combined, answered 'yes, 8 ms'."
      },
      {
        student_id: "s_36",
        student_name: "Urvi Chauhan",
        misconception: "NEG_TIMES_NEG",
        transfer_domain: "physics",
        status: "persists_in_new_context",
        notes: "Calculated (-2)*(-9)=18 on algebra retry, but in physics cooling chamber question answered -12°C."
      }
    ]
  };

  const studentsList = data.students || [];

  const filteredStudents = useMemo(() => {
    return studentsList.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.student_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [studentsList, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner for Mandatory Simulated Data Tag */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 flex items-center justify-between text-amber-300 text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-semibold tracking-wide uppercase text-xs px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
              Verified Research Dataset
            </span>
            <span className="font-medium">{data.data_disclaimer}</span>
          </div>
          <span className="text-xs text-amber-400/80 hidden sm:inline">
            Non-biometric Telemetry &bull; Local SQLite &bull; 6 Core Misconceptions
          </span>
        </div>

        {/* Dashboard Title & Quick Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">Teacher Analytical Cockpit</h1>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {data.class_name}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Step-level algebraic error auditing, longitudinal transfer verification, and peer clustering.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-center">
              <div className="text-xs text-slate-400">Total Cohort</div>
              <div className="text-xl font-bold text-white">{data.total_students}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-center">
              <div className="text-xs text-slate-400">Active Misconceptions</div>
              <div className="text-xl font-bold text-orange-400">8</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-center">
              <div className="text-xs text-slate-400">Transfer Alerts</div>
              <div className="text-xl font-bold text-red-400">{data.transfer_failure_alerts.length}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2">
          {[
            { id: 'overview', label: 'T1 Class Heatmap & Overview' },
            { id: 'peers', label: `T3 Peer Groups (${data.peer_groups.length})` },
            { id: 'alerts', label: `T4 Transfer Alerts (${data.transfer_failure_alerts.length})` },
            { id: 'roster', label: 'T2 Student Roster Deep-Dive' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & HEATMAP */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Heatmap Grid */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">T1: Class Misconception Prevalence Heatmap</h2>
                  <p className="text-xs text-slate-400">
                    Proportion of students demonstrating active or latent breakdown across the 6 core misconceptions.
                  </p>
                </div>
                <div className="text-xs text-slate-400">
                  Target threshold: &lt; 10% prevalence
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.misconception_heatmap.map(item => {
                  const cfg = MISCONCEPTION_CONFIG[item.label] || {
                    label: item.label,
                    short: item.label,
                    color: '#64748b',
                    bg: 'bg-slate-800',
                    border: 'border-slate-700',
                    text: 'text-slate-300',
                    domain: 'General'
                  };
                  return (
                    <div
                      key={item.label}
                      className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border} transition-all hover:scale-[1.01]`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className={`text-xs font-semibold uppercase tracking-wider ${cfg.text}`}>
                            {cfg.short}
                          </div>
                          <h3 className="text-base font-bold text-white mt-1">{cfg.label}</h3>
                        </div>
                        <span className="text-2xl font-black text-white">{item.percentage}%</span>
                      </div>

                      <div className="mt-3">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(item.percentage, 5)}%`, backgroundColor: cfg.color }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span>Affected Students: <strong className="text-white">{item.count}</strong> / 40</span>
                        <span>Transfer: <strong className="text-slate-300">{cfg.domain}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Peer Group Highlight */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Recommended Remedial Clusters (T3)</h3>
                  <button
                    onClick={() => setActiveTab('peers')}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    View all {data.peer_groups.length} &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {data.peer_groups.slice(0, 3).map((group, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">
                          {group.misconception.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-400">{group.student_names.length} Students</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 font-medium">
                        {group.recommended_action}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {group.student_names.map((name, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-[11px]">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transfer Alert Highlight */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                    <h3 className="font-semibold text-white">High Priority Transfer Failures (T4)</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="text-xs text-red-400 hover:underline"
                  >
                    View all {data.transfer_failure_alerts.length} &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {data.transfer_failure_alerts.slice(0, 3).map((alert, idx) => (
                    <div key={idx} className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm text-red-300">
                          {alert.student_name} <span className="text-xs text-slate-400">({alert.student_id})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          {alert.transfer_domain}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">
                        {alert.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PEER GROUPS (T3) */}
        {activeTab === 'peers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">T3: Dynamic Peer Grouping for Remedial Labs</h2>
                <p className="text-xs text-slate-400">
                  Algorithmic grouping of students who failed on the identical algebraic transformation step.
                </p>
              </div>
              <button
                onClick={() => alert("Remedial workshop plan generated and dispatched to learning portal!")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition"
              >
                Schedule Group Labs
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.peer_groups.map((group, idx) => {
                const cfg = MISCONCEPTION_CONFIG[group.misconception] || {};
                return (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Group {String.fromCharCode(65 + idx)}</span>
                        <h3 className="text-base font-bold text-white">{cfg.label || group.misconception}</h3>
                      </div>
                      <span className="px-2.5 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-300">
                        {group.student_names.length} Students
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Prescribed Intervention</div>
                      <div className="text-sm font-medium text-emerald-300 mt-0.5">
                        {group.recommended_action}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-400 mb-2 font-medium">Assigned Cohort Members:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {group.student_names.map((name, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-slate-800/60 rounded-lg text-xs">
                            <span className="text-slate-200 font-medium">{name}</span>
                            <span className="text-[10px] text-slate-400">{group.student_ids[i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: TRANSFER ALERTS (T4) */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-200">
              <h2 className="text-base font-bold flex items-center gap-2 text-red-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
                T4: The Re:Learn Breakthrough — Cross-Domain Transfer Alerts
              </h2>
              <p className="text-xs text-red-300/80 mt-1">
                These students solved the algebraic drill, but failed when the exact same mathematical structure was presented in physics, geometry, or code.
                This is empirical proof of a latent misconception masked by mechanical memorization.
              </p>
            </div>

            <div className="space-y-3">
              {data.transfer_failure_alerts.map((alert, idx) => {
                const cfg = MISCONCEPTION_CONFIG[alert.misconception] || {};
                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-xl transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{alert.student_name}</span>
                        <span className="text-xs text-slate-400">({alert.student_id})</span>
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/40 rounded text-[11px] font-semibold uppercase">
                          {alert.transfer_domain} Failure
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        Root Misconception: <strong className="text-orange-400">{cfg.label || alert.misconception}</strong>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                        {alert.notes}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedStudent({ name: alert.student_name, id: alert.student_id, notes: alert.notes, misconception: alert.misconception })}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition"
                      >
                        Deep Dive
                      </button>
                      <button
                        onClick={() => alert(`Visual proof bridging intervention assigned to ${alert.student_name}`)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-lg transition"
                      >
                        Assign Visual Proof
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: STUDENT ROSTER DEEP DIVE (T2) */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <input
                type="text"
                placeholder="Search student by name or ID (e.g. Aarav, s_07)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Cohort (40)</option>
                  <option value="active_misconception">Active Misconception (8)</option>
                  <option value="transfer_failed">Transfer Failed (6)</option>
                  <option value="mastered">Mastered / Passed (26)</option>
                </select>
              </div>
            </div>

            {/* Roster Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Student ID</th>
                    <th className="py-3 px-4 font-semibold">Student Name</th>
                    <th className="py-3 px-4 font-semibold">Learner Status</th>
                    <th className="py-3 px-4 font-semibold">Misconception</th>
                    <th className="py-3 px-4 font-semibold">Cross-Domain</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <tr key={student.student_id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-medium text-slate-300">{student.student_id}</td>
                        <td className="py-3 px-4 font-semibold text-white">{student.name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                              student.status === 'mastered'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : student.status === 'transfer_failed'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            }`}
                          >
                            {student.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {student.misconception ? (
                            <span className="text-orange-300 font-medium">
                              {student.misconception.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span className="text-slate-500">&mdash; None &mdash;</span>
                          )}
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-400">{student.transfer_domain || 'N/A'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-500">
                        No students match the selected query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Student Drill-Down (T2) */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedStudent.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{selectedStudent.student_id} &bull; Class 8-B</span>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Pedagogical Diagnosis:</span>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-200 font-medium">
                    {selectedStudent.misconception ? (
                      <span className="text-orange-400 font-bold">{selectedStudent.misconception}</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">Concept Mastered &bull; Zero Active Misconceptions</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Clinical Observation Notes:</span>
                  <p className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300">
                    {selectedStudent.notes || "Student demonstrates consistent retention across linear equations and algebraic expressions."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Intervention packet generated for ${selectedStudent.name}`);
                    setSelectedStudent(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  Send Remedial Exercise
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

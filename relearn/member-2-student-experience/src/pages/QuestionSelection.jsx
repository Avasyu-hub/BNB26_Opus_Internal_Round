import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ChevronRight, 
  Sparkles, 
  AlertCircle, 
  Check, 
  CheckCheck, 
  CircleDot, 
  RefreshCw,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import MathView from '../components/MathView';
import { getQuestions, getHistory, TOPICS } from '../api';

export default function QuestionSelection() {
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTopicFilter = searchParams.get('topic') || 'all';

  const filterTabs = [
    { id: 'all', label: 'All Topics' },
    { id: 'brackets', label: 'Brackets' },
    { id: 'squaring-brackets', label: 'Squaring brackets' },
    { id: 'minus-signs-brackets', label: 'Minus signs and brackets' },
    { id: 'moving-terms', label: 'Moving terms across =' },
    { id: 'adding-terms', label: 'Adding terms' },
    { id: 'multiplying-negatives', label: 'Multiplying negatives' },
  ];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [questionsData, historyData] = await Promise.all([
        getQuestions(),
        getHistory('student_1'),
      ]);
      setQuestions(questionsData);
      setHistory(historyData);
    } catch (err) {
      setError(err.message || 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute topic progress & questions grouped by topic
  const { topicGroups, workedTopicsCount, totalTopicsCount, recommendedQuestion } = useMemo(() => {
    const totalCount = TOPICS.length;
    let workedCount = 0;

    const groups = TOPICS.map((topic) => {
      const topicQuestions = questions.filter(
        (q) => q.topicId === topic.id || q.targetMisconceptions?.includes(topic.misconceptionId)
      );

      const hasWorked = topicQuestions.some(
        (q) => q.status === 'Needs work' || q.status === 'Fixed in algebra' || q.status === 'Understood everywhere ✓'
      );
      if (hasWorked) workedCount++;

      return {
        ...topic,
        questions: topicQuestions,
      };
    });

    let recommended = questions.find((q) => q.status === 'Needs work');
    if (!recommended) {
      recommended = questions.find((q) => q.status === 'Not tried') || questions[0];
    }

    return {
      topicGroups: groups,
      workedTopicsCount: workedCount,
      totalTopicsCount: totalCount,
      recommendedQuestion: recommended,
    };
  }, [questions]);

  const displayedGroups = useMemo(() => {
    if (activeTopicFilter === 'all') return topicGroups;
    return topicGroups.filter(
      (g) => g.id === activeTopicFilter || g.misconceptionId === activeTopicFilter
    );
  }, [topicGroups, activeTopicFilter]);

  const handleTabClick = (tabId) => {
    if (tabId === 'all') {
      searchParams.delete('topic');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ topic: tabId });
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Needs work':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDE7E8] text-[#E5484D] border border-[#E5484D]/30 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Needs work</span>
          </span>
        );
      case 'Fixed in algebra':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky text-ocean border border-sky/80 shadow-2xs">
            <Check className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>Fixed in algebra</span>
          </span>
        );
      case 'Understood everywhere ✓':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-mint text-leaf border border-leaf/30 shadow-2xs">
            <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>Understood everywhere ✓</span>
          </span>
        );
      case 'Not tried':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-mist text-slate border border-[#E3EEF7]">
            <CircleDot className="w-3 h-3 text-slate/50" strokeWidth={2} />
            <span>Not tried</span>
          </span>
        );
    }
  };

  if (error) {
    return (
      <div className="py-12 text-center max-w-lg mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FDE7E8] text-[#E5484D] flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-7 h-7" strokeWidth={1.75} />
        </div>
        <h2 className="text-h2 font-display text-navy">Couldn't load problems</h2>
        <p className="text-body text-slate">
          Check that the server is running, then refresh.
        </p>
        <button
          type="button"
          onClick={loadData}
          className="btn-secondary mt-2 inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={1.75} />
          <span>Try again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-body">
      {/* 1. HEADER AREA */}
      <div className="space-y-2 text-left">
        <div className="inline-flex items-center gap-2 bg-sky/70 px-3.5 py-1 rounded-full text-ocean text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Practice Curriculum</span>
        </div>
        <h1 className="text-h1 sm:text-display-lg font-display text-navy tracking-tight">
          Choose a problem
        </h1>
        <p className="text-body text-slate max-w-2xl">
          Show your working line by line. We'll find where it goes wrong — and why.
        </p>
      </div>

      {/* 2. PROGRESS STRIP */}
      <div className="bg-white p-5 sm:p-6 rounded-[22px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.16)] space-y-3.5">
        <div className="flex items-center justify-between text-small">
          <span className="font-bold text-navy text-sm sm:text-base">
            You've worked on {workedTopicsCount} of {totalTopicsCount} topics
          </span>
          <span className="text-ocean font-bold bg-sky/70 px-2.5 py-0.5 rounded-full text-xs">
            {Math.round((workedTopicsCount / totalTopicsCount) * 100)}% complete
          </span>
        </div>
        <div className="w-full h-3 bg-mist rounded-full overflow-hidden border border-[#E3EEF7]">
          <div
            className="h-full bg-progress-gradient transition-all duration-500 rounded-full shadow-xs"
            style={{ width: `${(workedTopicsCount / totalTopicsCount) * 100}%` }}
          />
        </div>
      </div>

      {/* 3. SUGGESTED NEXT: RECOMMENDED FOR YOU */}
      {recommendedQuestion && !loading && (
        <div className="bg-soft-gradient p-6 sm:p-7 rounded-[22px] border border-[#E3EEF7] shadow-[0_15px_35px_-10px_rgba(30,111,217,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white text-ocean text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs border border-white/80">
                <Sparkles className="w-3.5 h-3.5 text-ocean" strokeWidth={2.2} />
                Recommended for you
              </span>
              <span className="text-small text-slate font-medium">
                in {recommendedQuestion.topicName}
              </span>
            </div>
            <div className="text-h3 sm:text-h2 font-bold text-navy pt-1">
              <MathView math={recommendedQuestion.latex} className="katex-large" />
            </div>
            <p className="text-small text-slate">
              {recommendedQuestion.title} &bull; <span className="font-semibold text-slate/90">{recommendedQuestion.difficulty}</span>
            </p>
          </div>

          <Link
            to={`/practice/${recommendedQuestion.id}`}
            className="btn-primary shrink-0 self-stretch sm:self-auto text-small sm:text-body shadow-lg hover:scale-102"
          >
            <span>Start problem</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
          </Link>
        </div>
      )}

      {/* 4. TOPIC FILTER TABS */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x" role="tablist">
        {filterTabs.map((tab) => {
          const isActive = activeTopicFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(tab.id)}
              className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-small font-semibold transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ocean/40 ${
                isActive
                  ? 'bg-soft-gradient text-navy shadow-xs border border-ocean/30 scale-102'
                  : 'bg-white text-slate hover:text-navy hover:bg-mist border border-[#E3EEF7]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 5. TOPIC QUESTION GROUPS */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-[22px] border border-[#E3EEF7] p-7 space-y-4 shadow-sm animate-pulse"
            >
              <div className="h-6 bg-slate/15 rounded-md w-1/4" />
              <div className="h-4 bg-slate/10 rounded-md w-1/2" />
              <div className="space-y-3 pt-2">
                <div className="h-14 bg-mist rounded-xl w-full" />
                <div className="h-14 bg-mist rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {displayedGroups.map((group) => {
            if (group.questions.length === 0) return null;

            return (
              <div
                key={group.id}
                className="bg-white rounded-[22px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.16)] p-6 sm:p-8 space-y-5 hover:shadow-[0_15px_35px_-10px_rgba(30,111,217,0.2)] transition-shadow duration-300"
              >
                {/* Topic Header & Typical Mistake */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-4 border-b border-[#E3EEF7] gap-2">
                  <div>
                    <h3 className="text-h3 font-body font-bold text-navy">
                      {group.name}
                    </h3>
                    <div className="text-small text-slate mt-1.5 flex items-center gap-2 flex-wrap">
                      <span>Typical mistake:</span>
                      <span className="font-semibold text-navy bg-mist px-3 py-0.5 rounded-lg border border-[#E3EEF7]">
                        <MathView math={group.typicalMistake} />
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate/80 bg-mist px-2.5 py-1 rounded-full border border-[#E3EEF7]">
                    {group.questions.length} {group.questions.length === 1 ? 'problem' : 'problems'}
                  </span>
                </div>

                {/* Question List Rows */}
                <div className="divide-y divide-[#E3EEF7]/70 font-body">
                  {group.questions.map((q) => (
                    <Link
                      key={q.id}
                      to={`/practice/${q.id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 -mx-2 rounded-xl hover:bg-sky/25 transition-all duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ocean/40 gap-3"
                    >
                      {/* Left: Problem Formula & Title */}
                      <div className="space-y-1">
                        <div className="text-h3 font-semibold text-navy group-hover:text-ocean transition-colors">
                          <MathView math={q.latex} className="katex-large" />
                        </div>
                        <p className="text-small text-slate">
                          {q.title} &bull; <span className="font-medium text-slate/80">{q.difficulty}</span>
                        </p>
                      </div>

                      {/* Right: Status Chip & Chevron */}
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {getStatusChip(q.status)}
                        <ChevronRight className="w-5 h-5 text-slate/40 group-hover:text-ocean group-hover:translate-x-1 transition-all" strokeWidth={2} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

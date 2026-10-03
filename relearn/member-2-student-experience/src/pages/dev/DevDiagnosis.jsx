import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DiagnosisSummary from '../../components/diagnosis/DiagnosisSummary';

export default function DevDiagnosis() {
  const [activeTab, setActiveTab] = useState('rule'); // 'rule' | 'llm' | 'unknown' | 'correct'

  const mockCases = {
    rule: {
      title: '1. Rule-Based Diagnosis',
      steps: ['2x + 3 = 14', '2x = 11', 'x = 5.5'],
      result: {
        isCorrect: false,
        source: 'rule',
        diagnosedMisconceptions: ['M2'],
        stepFeedback: [
          {
            stepIndex: 0,
            misconceptionId: 'M2',
            feedback: 'You multiplied 2 by x, but did not multiply 2 by 3.',
          },
        ],
      },
    },
    llm: {
      title: '2. LLM / AI-Inferred Diagnosis',
      steps: ['2x + 6 = 14', '2x = 20', 'x = 10'],
      result: {
        isCorrect: false,
        source: 'llm',
        confidence: 62,
        diagnosedMisconceptions: ['M1'],
        stepFeedback: [
          {
            stepIndex: 1,
            misconceptionId: 'M1',
            feedback: 'When moving +6 across the equals sign, invert the sign to -6.',
          },
        ],
      },
    },
    unknown: {
      title: '3. Unknown Reason / General Hint',
      steps: ['2x + 6 = 14', '3x = 14', 'x = 4.66'],
      result: {
        isCorrect: false,
        source: 'unknown',
        diagnosedMisconceptions: [],
        stepFeedback: [
          {
            stepIndex: 1,
            feedback: 'Check how the variable terms on the left side were transformed.',
          },
        ],
      },
    },
    correct: {
      title: '4. All Correct Verified Solution',
      steps: ['2x + 6 = 14', '2x = 8', 'x = 4'],
      result: {
        isCorrect: true,
        source: 'rule',
        diagnosedMisconceptions: [],
        stepFeedback: [],
      },
    },
  };

  const currentCase = mockCases[activeTab];

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E3EEF7] pb-4 gap-4">
        <div>
          <h1 className="text-h1 font-display text-navy">
            DiagnosisSummary Dev Preview
          </h1>
          <p className="text-body text-slate">
            Preview the 4 diagnosis states: Rule, LLM (62% sure), Unknown, and All-Correct.
          </p>
        </div>
        <Link to="/practice" className="btn-secondary self-start sm:self-auto">
          &larr; Back to Practice
        </Link>
      </div>

      {/* State Switcher Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(mockCases).map(([key, val]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-xl text-small font-medium transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ocean/40 ${
              activeTab === key
                ? 'bg-ocean text-white font-semibold shadow-xs'
                : 'bg-white text-slate hover:text-navy border border-[#E3EEF7]'
            }`}
          >
            {val.title}
          </button>
        ))}
      </div>

      {/* Rendered Diagnosis View */}
      <div className="pt-2">
        <DiagnosisSummary
          key={activeTab} // reset animation on tab change
          attemptResult={currentCase.result}
          steps={currentCase.steps}
          onEditWorking={() => alert('Clicked Edit my working')}
          onShowWhy={() => alert('Clicked Show me why')}
        />
      </div>
    </div>
  );
}

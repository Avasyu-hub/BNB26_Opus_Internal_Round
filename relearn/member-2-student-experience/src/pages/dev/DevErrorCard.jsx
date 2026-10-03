import React from 'react';
import { Link } from 'react-router-dom';
import ErrorStepCard from '../../components/diagnosis/ErrorStepCard';

export default function DevErrorCard() {
  return (
    <div className="space-y-12 pb-16 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-[#E3EEF7] pb-4">
        <div>
          <h1 className="text-h1 font-display text-navy">
            ErrorStepCard Dev Preview
          </h1>
          <p className="text-body text-slate">
            Visual verification for signature animated error-step localisation card cases.
          </p>
        </div>
        <Link to="/practice" className="btn-secondary">
          &larr; Back to Practice
        </Link>
      </div>

      {/* CASE 1: Error on Line 1 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-h3 font-display font-bold text-navy">
            Case 1: Error on Line 1 (Bracket distribution omission)
          </h3>
          <span className="text-xs bg-[#FDE7E8] text-[#E5484D] px-2.5 py-1 rounded-full font-semibold">
            error_step_index = 0
          </span>
        </div>
        <ErrorStepCard
          steps={['2x + 3 = 14', '2x = 11', 'x = 5.5']}
          error_step_index={0}
          evidence="Did not distribute multiplier 2 to 3"
          marginNote="2 × 3 is missing!"
          animate={true}
        />
      </div>

      {/* CASE 2: Error on Line 2 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-h3 font-display font-bold text-navy">
            Case 2: Error on Line 2 (Transposition sign change error)
          </h3>
          <span className="text-xs bg-[#FDE7E8] text-[#E5484D] px-2.5 py-1 rounded-full font-semibold">
            error_step_index = 1
          </span>
        </div>
        <ErrorStepCard
          steps={['2x + 6 = 14', '2x = 20', 'x = 10']}
          error_step_index={1}
          evidence="Added 6 instead of subtracting 6 from 14"
          marginNote="Sign flip error: 14 - 6"
          animate={true}
        />
      </div>

      {/* CASE 3: All Correct */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-h3 font-display font-bold text-navy">
            Case 3: All Correct
          </h3>
          <span className="text-xs bg-mint text-leaf px-2.5 py-1 rounded-full font-semibold">
            error_step_index = null
          </span>
        </div>
        <ErrorStepCard
          steps={['2x + 6 = 14', '2x = 8', 'x = 4']}
          error_step_index={null}
          evidence="Every line is mathematically correct"
          animate={true}
        />
      </div>
    </div>
  );
}

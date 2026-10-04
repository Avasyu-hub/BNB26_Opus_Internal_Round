import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  BrainCircuit, 
  HelpCircle,
  Network
} from 'lucide-react';
import ErrorStepCard from './ErrorStepCard';
import MathView from '../MathView';
import { MISCONCEPTIONS } from '../../api';
import DiagnosisConfidenceBars from '../../visuals/components/diagnosis/DiagnosisConfidenceBars';

export default function DiagnosisSummary({
  attemptResult,
  steps = [],
  onEditWorking,
  onShowWhy,
  photoThumbnail = null,     // W1 slot
  explanationText = null,    // W2 slot
  confidenceLabel = null,    // W3 slot
  misconceptionGraph = null, // Member 3 graph slot
}) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
  }, []);

  const isCorrect = attemptResult?.isCorrect ?? (steps.length > 0 && !attemptResult?.diagnosedMisconceptions?.length);
  const firstErrorFeedback = attemptResult?.stepFeedback?.[0];
  const misconceptionId = attemptResult?.diagnosedMisconceptions?.[0] || firstErrorFeedback?.misconceptionId || null;
  
  const misconception = misconceptionId ? MISCONCEPTIONS[misconceptionId] : null;

  const errorStepIndex = isCorrect 
    ? null 
    : (firstErrorFeedback?.stepIndex !== undefined ? firstErrorFeedback.stepIndex : null);

  const evidence = firstErrorFeedback?.feedback || attemptResult?.evidence || misconception?.description || 'Review this step calculation';
  const marginNote = 'Check this line!';
  const source = attemptResult?.source || 'rule'; // 'rule' | 'llm' | 'unknown'
  const confidence = attemptResult?.confidence ?? 0;

  const renderSourceChip = () => {
    if (source === 'rule') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-mint text-leaf border border-leaf/30 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.2} />
          <span>Found by checking your steps</span>
        </span>
      );
    }
    if (source === 'model') {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky text-ocean border border-sky shadow-2xs">
          <BrainCircuit className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Recognised by our trained model &middot; {confidence}% sure</span>
        </span>
      );
    }
    if (source === 'llm') {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky text-ocean border border-sky shadow-2xs">
          <BrainCircuit className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Best guess from AI &middot; {confidence}% sure</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-mist text-slate border border-[#E3EEF7]">
        <HelpCircle className="w-3.5 h-3.5" strokeWidth={2} />
        <span>We couldn't pin down the reason</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (7 / 12): ErrorStepCard */}
        <div className="lg:col-span-7">
          <ErrorStepCard
            steps={steps}
            error_step_index={errorStepIndex}
            evidence={evidence}
            marginNote={marginNote}
            animate={true}
          />
        </div>

        {/* RIGHT COLUMN (5 / 12): Diagnosis Panel */}
        <motion.div
          initial={
            !isReducedMotion
              ? { opacity: 0, x: 20 }
              : { opacity: 1, x: 0 }
          }
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: !isReducedMotion ? 1.15 : 0, // 200ms after ellipse animation finishes
            duration: 0.4,
            ease: 'easeOut',
          }}
          className="lg:col-span-5 bg-white rounded-[20px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)] p-6 sm:p-7 relative overflow-hidden font-body space-y-6"
        >
          {/* 4px Brand Gradient Bar Along Top Edge */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-gradient" />

          {/* Section Label */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-small font-bold text-slate uppercase tracking-wider">
              What we found
            </span>
            {renderSourceChip()}
          </div>

          {/* Diagnosis Headline */}
          {isCorrect ? (
            <div className="space-y-3">
              <h2 className="text-h2 font-display text-navy">
                Solution Verified
              </h2>
              <p className="text-body text-slate leading-relaxed">
                All steps follow algebraic laws accurately. Ready to test your understanding on transfer applications?
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-h2 font-display text-navy leading-snug">
                {misconception?.name || 'Algebraic Misconception Detected'}
              </h2>
              <p className="text-body text-slate leading-relaxed">
                {evidence}
              </p>
            </div>
          )}

          {/* Root Concept Row */}
          {!isCorrect && (
            <div className="bg-mist p-3.5 rounded-xl border border-[#E3EEF7] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky/80 text-ocean flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="text-small">
                <span className="text-slate block font-medium">Where it comes from:</span>
                <span className="font-semibold text-navy">
                  {misconception?.category || 'Distribution & Inverse Operations'}
                </span>
              </div>
            </div>
          )}

          {/* Member 3: what else the trained model considered (live differentiation) */}
          {!isCorrect && attemptResult?.candidates?.length > 0 && (
            <DiagnosisConfidenceBars diagnosis={{ candidates: attemptResult.candidates }} showRawIds={false} />
          )}

          {/* Shell Slots (photo, explanation, confidence) */}
          {(photoThumbnail || explanationText || confidenceLabel) && (
            <div className="pt-2 border-t border-[#E3EEF7] space-y-2">
              <span className="text-xs font-semibold text-slate uppercase tracking-wider">
                Also from you
              </span>
              {photoThumbnail}
              {explanationText}
              {confidenceLabel}
            </div>
          )}

          {/* Misconception Graph Slot / Placeholder */}
          <div className="pt-2">
            {misconceptionGraph ? (
              misconceptionGraph
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-[#E3EEF7] bg-mist/60 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-ocean text-small font-semibold">
                  <Network className="w-4 h-4" strokeWidth={1.75} />
                  <span>Concept Mastery Path</span>
                </div>
                <p className="text-xs text-slate">
                  Linear Equations &rarr; {misconception?.category || 'Distribution'} &rarr; Geometry Transfer
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#E3EEF7] flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onShowWhy}
              className="btn-primary w-full sm:flex-1 justify-center shadow-md"
            >
              <span>Show me why</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={onEditWorking}
              className="btn-secondary w-full sm:w-auto justify-center"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
              <span>Edit my working</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

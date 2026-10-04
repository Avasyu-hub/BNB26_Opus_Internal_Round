import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Trash2, 
  Calculator, 
  Loader2, 
  AlertCircle, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import MathView from '../MathView';
import { submitAttempt } from '../../api';

export default function StepInput({
  question,
  initialSteps = [''],
  onSubmitAttempt,
  submitFn = submitAttempt, // which endpoint to call (Retry passes submitRetry)
  photoInput = null,       // W1 slot
  explanationBox = null,   // W2 slot
  telemetryHooks = null,   // W3 slot
}) {
  const [steps, setSteps] = useState(
    initialSteps && initialSteps.length > 0 ? initialSteps : ['']
  );
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [showKeypad, setShowKeypad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rowErrors, setRowErrors] = useState({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount if available
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const normalizeStep = (text) => {
    if (!text) return '';
    return text
      .trim()
      .replace(/[\u2212\u2013\u2014]/g, '-') // Unicode minuses to standard -
      .replace(/[\u00D7\u2715]/g, '*')      // Multiplications to *
      .replace(/\u00F7/g, '/')              // Division ÷ to /
      .replace(/[\u00B2]/g, '^2')           // Squared symbol ² to ^2
      .replace(/[\u00B3]/g, '^3')           // Cubed symbol ³ to ^3
      .replace(/\s+/g, ' ');                // Collapse whitespace
  };

  const handleTextChange = (index, value) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);

    // Clear row error on type
    if (rowErrors[index]) {
      const newErrors = { ...rowErrors };
      delete newErrors[index];
      setRowErrors(newErrors);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const updated = [...steps];
      updated.splice(index + 1, 0, '');
      setSteps(updated);
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      }, 30);
    } else if (e.key === 'Backspace' && steps[index] === '' && steps.length > 1) {
      e.preventDefault();
      const updated = steps.filter((_, i) => i !== index);
      setSteps(updated);
      const prevIndex = Math.max(0, index - 1);
      setTimeout(() => {
        if (inputRefs.current[prevIndex]) {
          inputRefs.current[prevIndex].focus();
        }
      }, 30);
    } else if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowDown' && index < steps.length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const addRow = () => {
    setSteps([...steps, '']);
    setTimeout(() => {
      inputRefs.current[steps.length]?.focus();
    }, 30);
  };

  const removeRow = (index) => {
    if (steps.length <= 1) return;
    const updated = steps.filter((_, i) => i !== index);
    setSteps(updated);
  };

  const insertKey = (symbol) => {
    const targetInput = inputRefs.current[activeRowIndex];
    if (!targetInput) return;

    const start = targetInput.selectionStart || 0;
    const end = targetInput.selectionEnd || 0;
    const currentVal = steps[activeRowIndex] || '';

    const newVal = currentVal.substring(0, start) + symbol + currentVal.substring(end);
    handleTextChange(activeRowIndex, newVal);

    setTimeout(() => {
      targetInput.focus();
      targetInput.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 20);
  };

  const hasContent = steps.some((s) => s.trim().length > 0);

  const handleSubmit = async () => {
    if (!hasContent || isSubmitting) return;

    // Validate and normalize
    const normalized = steps.map(normalizeStep).filter((s) => s.length > 0);
    const errors = {};

    // Simple syntax balance check for raw brackets before sending
    normalized.forEach((step, idx) => {
      const openCount = (step.match(/\(/g) || []).length;
      const closeCount = (step.match(/\)/g) || []).length;
      if (openCount !== closeCount) {
        errors[idx] = "We couldn't read this line. Check the brackets and try again.";
      }
    });

    if (Object.keys(errors).length > 0) {
      setRowErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        question_id: question?.id || 'q1',
        question: question?.prompt,
        steps: normalized,
        input_mode: 'typed',
      };
      const result = await submitFn(payload);
      if (onSubmitAttempt) {
        onSubmitAttempt(result, normalized);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setSteps(['']);
    setRowErrors({});
    setShowClearConfirm(false);
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 30);
  };

  const keypadButtons = ['(', ')', '^', '²', '−', '=', 'x', '÷', '+', '*'];

  return (
    <div className="space-y-6">
      {/* Telemetry slot */}
      {telemetryHooks}

      {/* THE NOTEBOOK CONTAINER */}
      <div className="bg-white rounded-[20px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.18)] overflow-hidden relative">
        {/* Notebook Squared Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(to right, #E6F0F8 1px, transparent 1px), linear-gradient(to bottom, #E6F0F8 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        {/* Notebook Header */}
        <div className="relative z-10 px-6 sm:px-8 py-5 border-b border-[#E3EEF7] bg-white/80 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-h3 font-body font-bold text-navy flex items-center gap-2">
              <span>Your working</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ocean bg-sky/60 px-2.5 py-0.5 rounded-full">
                Step-by-step
              </span>
            </h3>
            <p className="text-small text-slate mt-0.5">
              One step per line. Press <kbd className="px-1.5 py-0.5 bg-mist border border-[#E3EEF7] rounded text-xs font-mono font-semibold text-navy">Enter</kbd> for a new line.
            </p>
          </div>

          {/* Desktop Toggle for Keypad */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKeypad(!showKeypad)}
              className={`px-3 py-1.5 rounded-xl text-small font-medium border transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ocean/40 ${
                showKeypad
                  ? 'bg-ocean text-white border-ocean'
                  : 'bg-white text-slate hover:text-navy border-[#E3EEF7] hover:bg-mist'
              }`}
            >
              <Calculator className="w-4 h-4" strokeWidth={1.75} />
              <span>Maths keys</span>
            </button>
          </div>
        </div>

        {/* Notebook Body with Left Margin Line */}
        <div className="relative z-10 p-4 sm:p-6 space-y-3">
          {/* Optional Photo Input Slot */}
          {photoInput}

          {/* Lines Container */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-ocean/35 space-y-3 ml-2 sm:ml-4">
            {steps.map((stepText, index) => {
              const hasRowError = Boolean(rowErrors[index]);

              return (
                <div key={index} className="space-y-1">
                  <div
                    className={`group relative flex flex-col md:flex-row md:items-center justify-between p-2.5 sm:p-3 rounded-xl transition-all duration-150 border ${
                      hasRowError
                        ? 'border-[#E5484D] bg-[#FDE7E8]/30'
                        : activeRowIndex === index
                        ? 'border-ocean/40 bg-white shadow-xs'
                        : 'border-transparent hover:border-[#E3EEF7] hover:bg-white/70'
                    }`}
                  >
                    {/* Left: Line Number & Input */}
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-small font-mono font-semibold text-slate/70 select-none w-5 text-right">
                        {index + 1}.
                      </span>

                      <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        value={stepText}
                        disabled={isSubmitting}
                        onChange={(e) => handleTextChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onFocus={() => setActiveRowIndex(index)}
                        placeholder={index === 0 ? "Type line 1 (e.g. 2x + 6 = 14)" : "Type next line..."}
                        className="w-full text-[1.15rem] leading-relaxed font-body text-navy bg-transparent outline-none border-none p-0 focus:ring-0 placeholder:text-slate/40"
                        aria-label={`Step ${index + 1}`}
                      />
                    </div>

                    {/* Right: Live KaTeX Preview & Remove Button */}
                    <div className="flex items-center justify-between md:justify-end gap-3 mt-2 md:mt-0 pl-8 md:pl-0">
                      {/* KaTeX Live Preview */}
                      <div className="text-right">
                        {stepText.trim().length > 0 ? (
                          <div className="font-semibold text-navy bg-mist/90 px-3 py-1 rounded-lg border border-[#E3EEF7]/80 inline-block">
                            <MathView math={normalizeStep(stepText)} />
                          </div>
                        ) : (
                          <span className="text-xs text-slate/50 italic select-none">
                            keep typing…
                          </span>
                        )}
                      </div>

                      {/* Remove Row Button */}
                      {steps.length > 1 && !isSubmitting && (
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="text-slate/40 hover:text-[#E5484D] p-1.5 rounded-lg hover:bg-mist transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                          title="Remove line"
                          aria-label={`Remove step ${index + 1}`}
                        >
                          <X className="w-4 h-4" strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Row Error Message */}
                  {hasRowError && (
                    <div className="flex items-center gap-1.5 text-xs text-[#E5484D] pl-8 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                      <span>{rowErrors[index]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add a line button */}
          <div className="pl-6 sm:pl-8 ml-2 sm:ml-4 pt-2">
            <button
              type="button"
              onClick={addRow}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 text-small font-semibold text-ocean hover:text-navy px-3 py-1.5 rounded-xl hover:bg-sky/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Add a line</span>
            </button>
          </div>

          {/* Optional Explanation Box Slot */}
          {explanationBox}
        </div>

        {/* MATHS KEYPAD (Mobile default or Desktop toggled) */}
        <div className={`p-4 bg-mist/90 border-t border-[#E3EEF7] relative z-10 ${showKeypad ? 'block' : 'block md:hidden'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate uppercase tracking-wider">
              Maths Keypad (Inserts at cursor)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {keypadButtons.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => insertKey(key)}
                className="w-10 h-10 rounded-xl bg-white border border-[#E3EEF7] shadow-xs text-navy font-semibold text-base hover:bg-sky/40 active:scale-95 transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* NOTEBOOK FOOTER BAR */}
        <div className="relative z-10 px-6 sm:px-8 py-4 border-t border-[#E3EEF7] bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Clear button with confirm */}
          <div>
            {showClearConfirm ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-small text-slate font-medium">Clear all lines?</span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1 rounded-lg bg-[#E5484D] text-white text-xs font-semibold hover:bg-[#c93b40] transition-colors"
                >
                  Yes, clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2.5 py-1 rounded-lg bg-mist text-slate text-xs font-medium hover:text-navy transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                disabled={!hasContent || isSubmitting}
                className="inline-flex items-center gap-1.5 text-small text-slate/70 hover:text-[#E5484D] disabled:opacity-40 disabled:hover:text-slate/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Right: Check my working primary button */}
          <div className="relative group self-stretch sm:self-auto">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasContent || isSubmitting}
              className="btn-primary w-full sm:w-auto min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking each step…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" strokeWidth={2} />
                  <span>Check my working</span>
                </>
              )}
            </button>

            {/* Tooltip when disabled */}
            {!hasContent && (
              <div className="hidden group-hover:block absolute bottom-full mb-2 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 px-3 py-1.5 bg-navy text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none animate-fade-in z-20">
                Type at least one line of working to check
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

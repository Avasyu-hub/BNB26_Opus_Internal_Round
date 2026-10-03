import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const PracticeFlowContext = createContext();

export function PracticeFlowProvider({ children, initialQuestion = null }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial stage from URL or default to 'input'
  const urlStage = searchParams.get('stage') || 'input';
  const urlAttempt = parseInt(searchParams.get('attempt') || '1', 10);

  const [stage, setStageState] = useState(urlStage);
  const [attemptNumber, setAttemptNumber] = useState(urlAttempt);
  const [retryCount, setRetryCount] = useState(0);

  const [question, setQuestion] = useState(initialQuestion);
  const [studentSteps, setStudentSteps] = useState(['']);
  const [attemptResult, setAttemptResult] = useState(null);

  const [retryQuestion, setRetryQuestion] = useState(null);
  const [retrySteps, setRetrySteps] = useState(['']);
  const [retryResult, setRetryResult] = useState(null);

  // Sync state changes with URL query parameters
  const updateStage = (newStage, newAttempt = attemptNumber) => {
    setStageState(newStage);
    setAttemptNumber(newAttempt);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('stage', newStage);
    if (newAttempt > 1) {
      newParams.set('attempt', String(newAttempt));
    } else {
      newParams.delete('attempt');
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleAttemptSubmitted = (result, steps) => {
    setAttemptResult(result);
    setStudentSteps(steps);
    updateStage('diagnosed', 1);
  };

  const goToIntervention = (attempt = 1) => {
    updateStage('intervention', attempt);
  };

  const goToRetry = () => {
    updateStage('retry', attemptNumber);
  };

  const handleRetrySubmitted = (result, steps) => {
    setRetryResult(result);
    setRetrySteps(steps);
    
    if (result.isCorrect) {
      // Pass
      setRetryCount(prev => prev + 1);
    } else {
      // Fail
      const nextCount = retryCount + 1;
      setRetryCount(nextCount);
    }
  };

  const goToTransfer = () => {
    updateStage('transfer');
  };

  const resetToInput = (prefillSteps = null) => {
    if (prefillSteps) {
      setStudentSteps(prefillSteps);
    }
    updateStage('input', 1);
  };

  const resetFlow = () => {
    setStudentSteps(['']);
    setAttemptResult(null);
    setRetrySteps(['']);
    setRetryResult(null);
    setRetryCount(0);
    updateStage('input', 1);
  };

  return (
    <PracticeFlowContext.Provider
      value={{
        stage,
        attemptNumber,
        retryCount,
        question,
        setQuestion,
        studentSteps,
        setStudentSteps,
        attemptResult,
        setAttemptResult,
        retryQuestion,
        setRetryQuestion,
        retrySteps,
        setRetrySteps,
        retryResult,
        setRetryResult,
        updateStage,
        handleAttemptSubmitted,
        goToIntervention,
        goToRetry,
        handleRetrySubmitted,
        goToTransfer,
        resetToInput,
        resetFlow,
      }}
    >
      {children}
    </PracticeFlowContext.Provider>
  );
}

export function usePracticeFlow() {
  const context = useContext(PracticeFlowContext);
  if (!context) {
    throw new Error('usePracticeFlow must be used within PracticeFlowProvider');
  }
  return context;
}

import { useState, useEffect, useCallback, MutableRefObject } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { FormBlock } from '@/types/block-types';
import type { QAPair } from '@/types/supabase-types';

export type AnalyticsSubmitHandler = (data: { block_id: string; block_type: string }) => void;
export type AnalyticsErrorHandler = (error: unknown, data: { block_id: string; block_type: string; response_id?: string }) => void;
export type AnalyticsCompletionHandler = (data: { response_id?: string }) => Promise<void>;

interface UseFormSubmissionProps {
  formId: string;
  storageKey: string;
  onSubmitSuccessRef: MutableRefObject<AnalyticsSubmitHandler>;
  onSubmitErrorRef: MutableRefObject<AnalyticsErrorHandler>;
  onFormCompleteRef: MutableRefObject<AnalyticsCompletionHandler>;
  saveCurrentAnswerRef: MutableRefObject<(blockId: string, answer: string | number | string[] | QAPair[]) => void>;
  goToNext: () => void;
  isLastQuestion: boolean;
}

interface FormSubmissionState {
  responseId: string | null;
  submitting: boolean;
  submitError: string | null;
  completed: boolean;
  submitAnswer: (block: FormBlock, answer: string | number | string[] | QAPair[]) => Promise<void>;
}

export const useFormSubmission = ({
  formId,
  storageKey,
  onSubmitSuccessRef,
  onSubmitErrorRef,
  onFormCompleteRef,
  saveCurrentAnswerRef,
  goToNext,
  isLastQuestion,
}: UseFormSubmissionProps): FormSubmissionState => {
  const [responseId, setResponseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);

  // Initialize responseId from localStorage or create a new one
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    let currentSessionId: string | null = null;

    if (savedData) {
      try {
        const { sessionId } = JSON.parse(savedData);
        if (sessionId) {
          currentSessionId = sessionId;
        }
      } catch (error) {
        console.error("Error parsing saved session data from localStorage", error);
        localStorage.removeItem(storageKey); // Clear corrupted data
      }
    }

    if (!currentSessionId) {
      currentSessionId = uuidv4();
      // Immediately save the new sessionId with initial state
      localStorage.setItem(storageKey, JSON.stringify({ sessionId: currentSessionId, currentIndex: 0, answers: {} }));
    }
    setResponseId(currentSessionId);
  }, [storageKey]);

  const submitAnswer = useCallback(async (block: FormBlock, answer: string | number | string[] | QAPair[]) => {
    if (!responseId) {
      console.error('No responseId available for submission');
      setSubmitError('Session ID is missing. Cannot submit.');
      return;
    }
    if (!block) {
        console.error('Current block is undefined during submission');
        setSubmitError('Cannot submit answer for an undefined block.');
        return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        blockId: block.id,
        answer: answer,
        isCompletion: isLastQuestion,
      };

      console.log('[useFormSubmission] Submitting payload:', payload);

      const res = await fetch(`/api/forms/${formId}/responses?responseId=${responseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit answer');
      }

      const data = await res.json();
      console.log('[useFormSubmission] Submission response:', data);

      const submissionData = { block_id: block.id, block_type: block.type };

      // Track successful submission
      onSubmitSuccessRef.current(submissionData);

      // Save answer locally via the answers hook
      saveCurrentAnswerRef.current(block.id, answer);

      if (isLastQuestion) {
        console.log("[SubmitAnswer] Last question, marking form complete");
        // Mark form as complete in local storage or state
        localStorage.setItem(`${storageKey}-completed`, 'true');
        setCompleted(true);
        // Use the specific form completion tracker via ref
        await onFormCompleteRef.current({ response_id: responseId });
      } else {
        console.log("[SubmitAnswer] Not last question, moving next");
        goToNext();
      }

    } catch (error: unknown) {
      console.error("Error in submitAnswer:", error);
      const errorMessage = "Failed to submit answer. Please try again.";
      setSubmitError(errorMessage);
      // Use the specific error tracker
      const errorToReport = error instanceof Error ? error.message : String(error);
      onSubmitErrorRef.current(errorToReport, { block_id: block.id, block_type: block.type, response_id: responseId });
    } finally {
      setSubmitting(false);
    }
  }, [
    responseId, 
    formId, 
    isLastQuestion, 
    onSubmitSuccessRef, 
    onSubmitErrorRef, 
    onFormCompleteRef, 
    saveCurrentAnswerRef, 
    goToNext,
    storageKey
  ]);

  return {
    responseId,
    submitting,
    submitError,
    completed,
    submitAnswer,
  };
};

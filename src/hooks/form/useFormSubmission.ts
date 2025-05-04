import { useState, useEffect, useCallback, MutableRefObject } from 'react';
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

  // Initialize responseId - either from localStorage or create a new session on the server
  useEffect(() => {
    const initializeFormResponse = async () => {
      // First check localStorage for an existing session
      const savedData = localStorage.getItem(storageKey);
      let existingSessionId: string | null = null;

      if (savedData) {
        try {
          const { sessionId } = JSON.parse(savedData);
          if (sessionId) {
            existingSessionId = sessionId;
            setResponseId(existingSessionId);
            return; // Use existing session ID
          }
        } catch (error) {
          console.error("Error parsing saved session data from localStorage", error);
          localStorage.removeItem(storageKey); // Clear corrupted data
        }
      }

      // If no existing session, initialize a new one with the server
      try {
        console.log('Initializing new form response session with server');
        const response = await fetch(`/api/forms/${formId}/sessions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            // Add public access header
            'x-flowform-public-access': 'true'
          },
          body: JSON.stringify({
            metadata: {
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to initialize session: ${response.status}`);
        }

        const data = await response.json();
        const newSessionId = data.sessionId || data.responseId;

        if (!newSessionId) {
          throw new Error('No session ID returned from server');
        }

        // Save the server-generated session ID
        localStorage.setItem(storageKey, JSON.stringify({
          sessionId: newSessionId,
          currentIndex: 0,
          answers: {}
        }));

        setResponseId(newSessionId);
      } catch (error) {
        console.error('Failed to initialize form response:', error);
        setSubmitError('Could not initialize form. Please try refreshing the page.');
      }
    };

    initializeFormResponse();
  }, [storageKey, formId]);

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
      // Determine the block type (static or dynamic) based on block properties
      // AI conversation is dynamic, everything else is static
      const blockType = block.blockTypeId === 'ai_conversation' ? 'dynamic' : 'static';
      
      // Construct payload in the format expected by the API
      const requestBody = {
        responseId: responseId,
        blockId: block.id,
        blockType: blockType,
        answer: answer,
        isCompletion: isLastQuestion,
        currentQuestion: blockType === 'dynamic' ? block.title : undefined
      };

      console.log('[useFormSubmission] Submitting payload:', requestBody);

      // Use the correct endpoint and HTTP method that matches the API
      const res = await fetch(`/api/forms/${formId}/sessions`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          // Add public access header for form viewer to trigger RLS bypass
          'x-flowform-public-access': 'true'
        },
        body: JSON.stringify(requestBody),
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

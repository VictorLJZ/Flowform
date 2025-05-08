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
  trackBlockSubmission: (block: FormBlock) => Promise<void>;
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

  // Helper function to track block submission
  const trackBlockSubmission = useCallback(async (block: FormBlock) => {
    try {
      if (!onSubmitSuccessRef.current) {
        console.warn('⚠️ [useFormSubmission] onSubmitSuccessRef.current not available');
        return;
      }

      // Create tracking metadata
      const submitMetadata = {
        block_id: block.id,
        block_type: block.blockTypeId,
        response_id: responseId,
        form_id: formId,
        event_type: 'block_submission',
        is_last_block: isLastQuestion
      };

      console.log('🌟 [useFormSubmission] Tracking block submission:', submitMetadata);
      
      // Call the onSubmitSuccessRef directly with the metadata
      // The page.tsx will handle passing this to the correct analytics function
      onSubmitSuccessRef.current(submitMetadata);
      
    } catch (error) {
      // Never fail the submission due to tracking failure
      console.error('💥 [useFormSubmission] Error tracking block submission:', error);
    }
  }, [formId, isLastQuestion, onSubmitSuccessRef, responseId]);

  const submitAnswer = useCallback(async (block: FormBlock, answer: string | number | string[] | QAPair[]) => {
    // DEBUG LOGGING: Track the answer at the start of submission
    console.log('[DEBUG][useFormSubmission] Starting submission for block:', {
      blockId: block.id,
      blockType: block.type,
      blockTypeId: block.blockTypeId,
      answerType: typeof answer,
      isArray: Array.isArray(answer),
      answerSize: typeof answer === 'string' ? answer.length : (Array.isArray(answer) ? answer.length : 'N/A'),
      answerPreview: JSON.stringify(answer).substring(0, 50) + '...'
    });
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

    // Helper function to check if the answer is empty
    const isEmptyAnswer = (ans: any): boolean => {
      if (ans === undefined || ans === null) return true;
      if (typeof ans === 'string') return ans.trim() === '';
      if (Array.isArray(ans)) return ans.length === 0;
      return false;
    };

    // For non-required blocks with empty answers, just move to the next section
    if (!block.required && isEmptyAnswer(answer)) {
      console.log(`Non-required block ${block.id} has empty answer, skipping submission and moving to next section`);
      
      // Save empty answer locally via the answers hook
      saveCurrentAnswerRef.current(block.id, answer);
      
      if (isLastQuestion) {
        console.log("[SubmitAnswer] Last question (empty), marking form complete");
        localStorage.setItem(`${storageKey}-completed`, 'true');
        setCompleted(true);
        
        try {
          await onFormCompleteRef.current({});
          console.log('[TRACKING DEBUG] onFormCompleteRef.current completed successfully');
        } catch (error) {
          console.error('[TRACKING DEBUG] Error in onFormCompleteRef.current:', error);
        }
      } else {
        // Move to next section
        console.log("[SubmitAnswer] Non-required empty answer, moving next");
        goToNext();
      }
      
      // Skip the actual submission to the server
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    
    // Track block submission before doing the actual submission
    await trackBlockSubmission(block);

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

      // No need to create a separate submissionData object here since we're using trackBlockSubmission
      // which will create the proper metadata with all required fields
      
      // Track block submission before doing anything else
      await trackBlockSubmission(block);

      // Save answer locally via the answers hook
      saveCurrentAnswerRef.current(block.id, answer);

      // Check if this was an AI conversation that should auto-advance
      // Only proceed to next slide if:
      //   1. It's not an AI block (normal form fields always advance) OR 
      //   2. It's an AI block AND dynamicComplete is true AND there's no next question
      const isAIBlock = block.blockTypeId === 'ai_conversation';
      const hasNextQuestion = !!data.nextQuestion;
      const shouldAdvance = !isAIBlock || (data.dynamicComplete === true && !hasNextQuestion);
      
      console.log('[FormSubmission] Checking if we should advance:', {
        isAIBlock,
        hasNextQuestion,
        dynamicComplete: data.dynamicComplete ? true : false,
        shouldAdvance,
        isLastQuestion,
        blockId: block.id,
        blockType: block.blockTypeId
      });

      if (isLastQuestion) {
        console.log("[SubmitAnswer] Last question, marking form complete");
        // Mark form as complete in local storage or state
        localStorage.setItem(`${storageKey}-completed`, 'true');
        setCompleted(true);
        
        // DEBUGGING: Log what parameters we're sending to the completion tracker
        console.log('[TRACKING DEBUG] useFormSubmission calling onFormCompleteRef with:', {
          responseId,
          formId,
          has_ref: !!onFormCompleteRef.current,
          payload: {} // No longer passing response_id in metadata
        });
        
        // Use the specific form completion tracker via ref
        // We no longer need to pass response_id here as it's already passed as a parameter to the hook
        try {
          await onFormCompleteRef.current({}); // Pass empty object instead of duplicating response_id
          console.log('[TRACKING DEBUG] onFormCompleteRef.current completed successfully');
        } catch (error) {
          console.error('[TRACKING DEBUG] Error in onFormCompleteRef.current:', error);
        }
      } else if (shouldAdvance) {
        // For AI blocks, only move to next form section when we get the dynamicComplete flag
        console.log("[SubmitAnswer] Not last question, moving next");
        goToNext();
      } else {
        // For AI blocks that need to continue conversation, do not advance
        console.log("[SubmitAnswer] AI conversation continuing - not advancing to next section");
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
    onSubmitErrorRef, 
    onFormCompleteRef, 
    saveCurrentAnswerRef, 
    goToNext,
    storageKey,
    trackBlockSubmission
  ]);

  return {
    responseId,
    submitting,
    submitError,
    completed,
    submitAnswer,
    trackBlockSubmission,
  };
};
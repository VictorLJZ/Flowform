import { useState, useEffect, useCallback, MutableRefObject } from 'react';
import type { FormBlock } from '@/types/block-types';
import type { QAPair } from '@/types/supabase-types';

export type AnalyticsSubmitHandler = (data: { block_id: string; block_type: string }) => void;
export type AnalyticsErrorHandler = (error: unknown, data: { block_id: string; block_type: string; response_id?: string }) => void;
export type AnalyticsCompletionHandler = (data: { response_id?: string }) => Promise<void>;

export interface FormSubmissionOptions {
  formId: string;
  storageKey: string;
  onSubmitSuccessRef: React.MutableRefObject<AnalyticsSubmitHandler>;
  onSubmitErrorRef: React.MutableRefObject<AnalyticsErrorHandler>;
  onFormCompleteRef: React.MutableRefObject<AnalyticsCompletionHandler>;
  saveCurrentAnswerRef: React.MutableRefObject<(blockId: string, answer: any) => void>;
  goToNext: (block: FormBlock, answer: any) => boolean;
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
}: FormSubmissionOptions): FormSubmissionState => {
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
    if (!responseId) {
      console.error('Cannot complete form: responseId is not set');
      return;
    }
    
    try {
      // Mark the response as completed
      const response = await fetch(`/api/responses/${responseId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add public access header for form viewer
          'x-flowform-public-access': 'true'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to complete form';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Server returned non-JSON response:', errorText);
        }
        throw new Error(errorMessage);
      }
      
      // Update local storage
      try {
        localStorage.setItem(`${storageKey}-completed`, 'true');
      } catch (e) {
        console.error('Failed to save completion status to localStorage:', e);
        // Continue anyway since we have the completed state in memory
      }
      
      setCompleted(true);
      
      // Call analytics completion callback
      try {
        if (onFormCompleteRef.current) {
          await onFormCompleteRef.current({ 
            response_id: responseId 
          });
        }
      } catch (callbackError) {
        console.error('Error calling completion callback:', callbackError);
        // Continue execution - analytics error shouldn't stop form completion
      }
    } catch (error) {
      console.error('Error completing form:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to complete form');
    }
  }, [responseId, storageKey, onFormCompleteRef]);

  // Initialize the response on mount
  useEffect(() => {
    initializeResponse();
  }, [initializeResponse]);

  // Submit an answer to a question
  const submitAnswer = useCallback(async (
    block: FormBlock, 
    answer: string | number | string[] | QAPair[]
  ) => {
    if (!responseId) {
      console.error('Cannot submit answer: responseId is not set');
      setSubmitError('Cannot submit answer: session not initialized');
      return;
    }

    if (submitting) {
      console.log('Already submitting an answer, ignoring this call');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    
    // Track block submission before doing the actual submission
    await trackBlockSubmission(block);

    try {
      // Save the current answer to local storage
      if (saveCurrentAnswerRef.current) {
        try {
          saveCurrentAnswerRef.current(block.id, answer);
        } catch (error) {
          console.error('Error saving current answer:', error);
          // Continue anyway, as this is just for local persistence
        }
      }

      console.log(`Submitting answer for block ${block.id}:`, answer);

      // Create a request to save the answer
      const answerData = {
        response_id: responseId,
        block_id: block.id,
        value: answer
      };

      // Try up to 3 times with exponential backoff
      let attemptCount = 0;
      let savedSuccessfully = false;
      let lastError: any = null;
      
      while (attemptCount < 3 && !savedSuccessfully) {
        try {
          attemptCount++;
          console.log(`Answer submission attempt ${attemptCount}`);
          
          // Send the answer to the API
          const response = await fetch('/api/responses/answers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Add public access header for form viewer
              'x-flowform-public-access': 'true'
            },
            body: JSON.stringify(answerData),
          });
    
          // Log the actual HTTP status for debugging
          console.log(`Answer submission response status: ${response.status} ${response.statusText}`);
    
          // Get response text first 
          const responseText = await response.text();
          console.log('Response text:', responseText);
    
          // Try to parse as JSON if possible
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch (e) {
            console.error('Failed to parse response as JSON:', e);
            // Continue with responseText as fallback
          }
    
          if (!response.ok) {
            let errorMessage = 'Failed to submit answer';
            
            if (responseData && responseData.error) {
              errorMessage = responseData.error;
              console.error('API Error details:', responseData);
              
              // Special handling for constraint violation errors which might indicate a duplicate answer
              if (responseData.code === '23505' || responseData.message?.includes('duplicate key value')) {
                console.log('Duplicate answer detected, treating as success');
                savedSuccessfully = true;
                break;
              }
              
              // If it's an RLS error, we might need different handling
              if (responseData.code === '42501') {
                console.error('RLS policy violation - form may not be published or user lacks permissions');
                throw new Error('Permission denied: Could not save answer due to security policy');
              }
            }
            
            lastError = new Error(errorMessage);
            
            // For server errors, wait before retrying
            if (response.status >= 500) {
              const delay = Math.pow(2, attemptCount) * 500; // Exponential backoff
              console.log(`Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              // Client errors (4xx) are not likely to be resolved by retrying
              throw lastError;
            }
          } else {
            // Successfully submitted
            console.log('Answer submitted successfully:', responseData);
            savedSuccessfully = true;
          }
        } catch (retryError) {
          console.error(`Error in submission attempt ${attemptCount}:`, retryError);
          lastError = retryError;
          
          // For network errors, wait before retrying
          if (retryError instanceof TypeError && retryError.message.includes('fetch')) {
            const delay = Math.pow(2, attemptCount) * 500; // Exponential backoff
            console.log(`Network error, waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // Other errors may not be resolved by retrying
            break;
          }
        }
      }
      
      // If we failed after all attempts, throw the last error
      if (!savedSuccessfully) {
        throw lastError || new Error('Failed to submit answer after multiple attempts');
      }

      const data = await res.json();
      console.log('[useFormSubmission] Submission response:', data);

      // No need to create a separate submissionData object here since we're using trackBlockSubmission
      // which will create the proper metadata with all required fields
      
      // Track block submission before doing anything else
      await trackBlockSubmission(block);

      // Save answer locally via the answers hook
      saveCurrentAnswerRef.current(block.id, answer);

      // On last question, mark form as completed
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
      } else {
        // Navigate to the next question based on workflow connections
        const moved = goToNext(block, answer);
        console.log(`Navigation result: ${moved ? 'moved to next block' : 'failed to find next block'}`);
        
        if (!moved) {
          console.warn('No valid next block found in the workflow');
          // If no valid next block was found, we might want to take some fallback action
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      // Call analytics error callback
      try {
        if (onSubmitErrorRef.current) {
          onSubmitErrorRef.current(error, {
            block_id: block.id,
            block_type: block.blockTypeId,
            response_id: responseId
          });
        }
      } catch (callbackError) {
        console.error('Error calling analytics error callback:', callbackError);
      }
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

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

  // Create the answer response if it doesn't exist
  const initializeResponse = useCallback(async () => {
    if (responseId) return; // Already initialized
    
    try {
      // Check if we have a saved response ID in local storage
      let savedResponseId = null;
      try {
        savedResponseId = localStorage.getItem(`${storageKey}-responseId`);
        if (savedResponseId) {
          setResponseId(savedResponseId);
          return;
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        // Continue execution to create a new response
      }
      
      // Generate a random visitor ID to use as respondent_id
      // This could be replaced with a user ID if the user is logged in
      const visitorId = crypto.randomUUID();
      
      // Create a new response
      const response = await fetch(`/api/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add public access header for form viewer
          'x-flowform-public-access': 'true'
        },
        body: JSON.stringify({
          form_id: formId,
          respondent_id: visitorId,
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
          }
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create response';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If it's not valid JSON, use the text directly for debugging
          console.error('Server returned non-JSON response:', errorText);
        }
        throw new Error(errorMessage);
      }
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Invalid JSON in response:', responseText);
        throw new Error('Server returned invalid JSON');
      }
      
      const newResponseId = data.response_id;
      if (!newResponseId) {
        throw new Error('No response ID returned from server');
      }
      
      // Save the response ID to local storage
      try {
        localStorage.setItem(`${storageKey}-responseId`, newResponseId);
        // Also save respondent_id for future reference
        if (data.respondent_id) {
          localStorage.setItem(`${storageKey}-respondentId`, data.respondent_id);
        }
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
        // Continue anyway since we have the responseId in memory
      }
      
      setResponseId(newResponseId);
      
    } catch (error) {
      console.error('Error initializing response:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to initialize session');
    }
  }, [responseId, formId, storageKey]);

  // Complete the form and set completed status
  const completeForm = useCallback(async () => {
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

      // Call analytics callback
      try {
        if (onSubmitSuccessRef.current) {
          onSubmitSuccessRef.current({
            block_id: block.id,
            block_type: block.blockTypeId
          });
        }
      } catch (error) {
        console.error('Error calling analytics success callback:', error);
        // Continue execution - analytics error shouldn't stop form progression
      }

      // On last question, mark form as completed
      if (isLastQuestion) {
        await completeForm();
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
  }, [responseId, submitting, isLastQuestion, goToNext, completeForm]);

  return {
    responseId,
    submitting,
    submitError,
    completed,
    submitAnswer,
  };
};

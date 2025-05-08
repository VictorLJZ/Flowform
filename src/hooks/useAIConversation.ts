import { useEffect, useMemo, useState, useRef } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { SaveDynamicResponseInput, DynamicResponseData } from '@/types/form-service-types'
import { QAPair } from '@/types/supabase-types'

const CONVERSATION_KEY_PREFIX = 'conversation'

// Extended interfaces to support our builder mode and additional properties
interface ExtendedSaveDynamicResponseInput extends SaveDynamicResponseInput {
  isComplete?: boolean;
  questionIndex?: number; // Added to support truncating the conversation at a specific index
  maxQuestions?: number; // Added to support custom max questions limit
}

interface ExtendedDynamicResponseData extends DynamicResponseData {
  maxQuestions?: number;
}

// SWR fetcher functions
export const fetchers = {
  // Fetch conversation for a response/block
  getConversation: async (
    responseId: string, 
    blockId: string, 
  ): Promise<ExtendedDynamicResponseData> => {
    try {
      const url = `/api/conversation?responseId=${responseId}&blockId=${blockId}&mode=${'viewer'}`
      console.log('Fetching conversation from:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch conversation: ${response.status}`);
      }
      
      const data = await response.json();
      
      // MODIFIED: Only override isComplete if just starting - avoid interfering with existing conversations
      if (data && data.conversationJustStarted) {
        console.log('Setting isComplete to false for new conversation');
        data.isComplete = false;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getConversation:', error)
      throw error
    }
  },
  
  // Submit a new answer and get updated conversation
  saveAnswer: async (input: ExtendedSaveDynamicResponseInput): Promise<ExtendedDynamicResponseData> => {
    try {
      console.log('Saving answer with input:', {
        responseId: input.responseId,
        blockId: input.blockId,
        formId: input.formId,
        questionIndex: input.questionIndex,
        isStarterQuestion: input.isStarterQuestion
      });
      
      const response = await fetch(`/api/conversation/answer`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-flowform-mode': 'viewer' 
        },
        body: JSON.stringify(input)
      });
      
      // Enhanced error handling
      if (!response.ok) {
        let errorMessage = `Failed to update response: ${response.status}`;
        try {
          // Try to get detailed error from response
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          // Ignore JSON parsing errors in error response
          console.warn('Could not parse error response:', jsonError);
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse successful response
      const responseData = await response.json();
      
      // Log the raw response for debugging
      console.log(`API response:`, responseData);
      
      // Check if the response has the expected structure
      if (!responseData) {
        throw new Error('Empty response received');
      }
      
      // The server returns data in a structure like { success: true, data: { conversation, nextQuestion, etc } }
      // We need to unwrap this to get the actual data
      let resultData;
      if (responseData.success === true && responseData.data) {
        // Extract from success wrapper
        resultData = responseData.data;
      } else if (responseData.success === false) {
        // Error case
        throw new Error(responseData.error || 'API returned error');
      } else {
        // Response is already the data without wrapper
        resultData = responseData;
      }
      
      // Debug log the processed data
      console.log(`Processed response data:`, resultData);
      
      // Ensure the response has the required fields
      if (!resultData.conversation) {
        console.error('Invalid response data:', resultData);
        throw new Error('Missing conversation data in response');
      }
      
      return resultData as ExtendedDynamicResponseData;
    } catch (error) {
      console.error('Error in saveAnswer:', error);
      throw error;
    }
  }
}

/**
 * Safe AI Conversation Hook
 * 
 * This wrapper hook prevents API calls in builder mode by providing a null key to SWR
 * Only performs real API calls in viewer mode
 */
export function useAIConversation(
  responseId: string, 
  blockId: string, 
  formId: string, 
  isBuilder: boolean,
  maxQuestions?: number
) {
  const { mutate } = useSWRConfig();
  const conversationKey = isBuilder ? null : `${CONVERSATION_KEY_PREFIX}:${responseId}:${blockId}`;
  
  // MODIFIED: Use ref instead of state to track revalidation to avoid render cycles
  const hasRevalidatedRef = useRef(false);
  // ADDED: Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // ADDED: Track if initial data has been loaded
  const initialLoadDoneRef = useRef(false);
  
  // Fetch conversation data (only in viewer mode)
  const { data, error, isLoading, isValidating } = useSWR(
    conversationKey,
    responseId && blockId && !isBuilder ? () => fetchers.getConversation(responseId, blockId) : null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      dedupingInterval: 5000, // Increased to prevent rapid repeated requests
      errorRetryCount: 2,
      // ADDED: Proper retry delay for better error recovery
      errorRetryInterval: 3000,
      // ADDED: Keep previous data on error to maintain UI
      keepPreviousData: true
    }
  );
  
  // Get the effective max questions value - use provided value, then from API, then default to 5
  const effectiveMaxQuestions = maxQuestions !== undefined
    ? maxQuestions  // Use any provided value, including 0 (unlimited)
    : (data?.maxQuestions || 5);
  
  // Set mounted ref on initial render and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Safe submit function that works in both modes
  const submitAnswer = async (question: string, answer: string, questionIndex?: number, isStarterQuestion = false) => {
    if (isBuilder) {
      console.log('Builder mode submit:', { question, answer, questionIndex, isStarterQuestion });
      return Promise.resolve(undefined);
    }
    
    try {
      // Create the input data for the answer submission
      const input: ExtendedSaveDynamicResponseInput = {
        responseId,
        blockId,
        formId,
        question, 
        answer,
        isStarterQuestion,
        isComplete: data?.isComplete,
        questionIndex, // Add the question index to support truncating the conversation
        maxQuestions: effectiveMaxQuestions // Pass the effective max questions to API
      };
      
      // Prepare the optimistic data
      let optimisticConversation;
      let optimisticNextQuestion = data?.nextQuestion;
      
      if (data && questionIndex !== undefined && questionIndex < data.conversation.length) {
        // If we're answering a question that's not the last one,
        // truncate the conversation and force regeneration of subsequent questions
        if (typeof questionIndex === 'number' && questionIndex < data.conversation.length - 1) {
          console.log(`Truncating conversation at index ${questionIndex}`);
          console.log('Previous conversation state:', {
            length: data.conversation.length,
            current: data.conversation.map(item => item.question.substring(0, 20) + '...').join(' -> ')
          });
          
          // Always set isComplete to false when truncating to force regeneration
          input.isComplete = false;
          
          // Make sure questionIndex is explicitly set to trigger truncation logic
          input.questionIndex = questionIndex;
          
          // Create optimistic UI update with the truncated conversation
          optimisticConversation = [
            ...data.conversation.slice(0, questionIndex),
            { question, answer, timestamp: new Date().toISOString(), is_starter: isStarterQuestion }
          ];
        }
        // When truncating, we should clear the nextQuestion since it will be regenerated
        optimisticNextQuestion = undefined;
      } else if (data) {
        // Normal case - append to the conversation
        optimisticConversation = [
          ...data.conversation,
          { question, answer, timestamp: new Date().toISOString(), is_starter: isStarterQuestion }
        ];
      }
      
      // Call the API and update the SWR cache with result
      const result = await mutate(
        conversationKey,
        fetchers.saveAnswer(input),
        {
          optimisticData: data && optimisticConversation ? {
            ...data,
            conversation: optimisticConversation,
            nextQuestion: optimisticNextQuestion
          } : undefined,
          rollbackOnError: true,
          populateCache: true,
          revalidate: false // MODIFIED: Don't revalidate immediately after mutation to avoid race conditions
        }
      );
      
      // ADDED: Schedule a revalidation after a short delay to ensure we get fresh data
      setTimeout(() => {
        if (isMountedRef.current) {
          mutate(conversationKey);
        }
      }, 500);
      
      return result;
    } catch (error) {
      console.error('Error in submitAnswer:', error);
      throw error;
    }
  };
  
  // Add a derived state property that combines the conversation and nextQuestion
  // This helps ensure we maintain consistent UI state even during loading states
  const derivedState = useMemo(() => {
    return {
      conversation: data?.conversation || [],
      nextQuestion: data?.nextQuestion || '',
      isComplete: data?.isComplete || false,
      maxQuestions: effectiveMaxQuestions, // Use the effective max questions value
      isLoading: isBuilder ? false : isLoading,
      isSubmitting: isBuilder ? false : isValidating,
      error: isBuilder ? null : (error ? (error instanceof Error ? error.message : String(error)) : null)
    };
  }, [data, isBuilder, isLoading, isValidating, error, effectiveMaxQuestions]);
  
  // Debug log for max questions value
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('AI Conversation Max Questions:', {
        provided: maxQuestions,
        fromAPI: data?.maxQuestions,
        effective: effectiveMaxQuestions
      });
    }
  }, [maxQuestions, data?.maxQuestions, effectiveMaxQuestions]);
  
  // MODIFIED: Simplified state updates to prevent endless revalidation
  useEffect(() => {
    if (isBuilder || !data || !isMountedRef.current) return;
    
    // Mark initial load as done
    initialLoadDoneRef.current = true;
    
    console.log('Conversation state updated:', {
      conversationLength: data.conversation?.length,
      hasNextQuestion: !!data.nextQuestion,
      nextQuestion: data.nextQuestion ? data.nextQuestion.substring(0, 30) + (data.nextQuestion.length > 30 ? '...' : '') : '',
      isComplete: data.isComplete
    });

    // MODIFIED: Only trigger revalidation if ALL these conditions are met:
    // 1. No next question 
    // 2. Not marked as complete
    // 3. Conversation has at least one exchange
    // 4. Haven't revalidated yet
    // 5. The component is still mounted
    if (!data.nextQuestion && 
        !data.isComplete && 
        data.conversation?.length > 0 && 
        !hasRevalidatedRef.current && 
        isMountedRef.current) {
      
      console.log('No next question available - triggering one-time revalidation');
      
      // Mark as revalidated to prevent loops
      hasRevalidatedRef.current = true;
      
      // Use a longer delay to avoid race conditions
      setTimeout(() => {
        if (isMountedRef.current) {
          mutate(conversationKey);
        }
      }, 2000);
    }
  }, [data, isBuilder, mutate, conversationKey]);
  
  return {
    ...derivedState,
    submitAnswer
  };
}

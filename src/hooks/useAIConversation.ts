import { useEffect, useMemo, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { SaveDynamicResponseInput, DynamicResponseData } from '@/types/form-service-types'

const CONVERSATION_KEY_PREFIX = 'conversation'

// Extended interfaces to support our builder mode and additional properties
interface ExtendedSaveDynamicResponseInput extends SaveDynamicResponseInput {
  isComplete?: boolean;
  questionIndex?: number; // Added to support truncating the conversation at a specific index
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
      
      // Override isComplete to ensure we always show the conversation first
      if (data && (data.conversationJustStarted || !data.nextQuestion)) {
        console.log('Overriding isComplete to false to prevent automatic form advancement');
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
      console.log('Saving answer with input:', input)
      
      const response = await fetch(`/api/conversation/answer`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-flowform-mode': 'viewer' 
        },
        body: JSON.stringify(input)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save answer: ${response.status}`);
      }
      
      return response.json()
    } catch (error) {
      console.error('Error in saveAnswer:', error)
      throw error
    }
  }
}

/**
 * Safe AI Conversation Hook
 * 
 * This wrapper hook prevents API calls in builder mode by providing a null key to SWR
 * Only performs real API calls in viewer mode
 */
export function useAIConversation(responseId: string, blockId: string, formId: string, isBuilder: boolean) {
  const { mutate } = useSWRConfig();
  const conversationKey = isBuilder ? null : `${CONVERSATION_KEY_PREFIX}:${responseId}:${blockId}`;
  
  // Track if we've already triggered a revalidation to prevent loops
  const [hasRevalidated, setHasRevalidated] = useState(false);
  
  // Fetch conversation data (only in viewer mode)
  const { data, error, isLoading, isValidating } = useSWR(
    conversationKey,
    responseId && blockId && !isBuilder ? () => fetchers.getConversation(responseId, blockId) : null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 5000,
      errorRetryCount: 2
    }
  );
  
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
        questionIndex // Add the question index to support truncating the conversation
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
          revalidate: true // Force revalidation to get the updated nextQuestion
        }
      );
      
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
      maxQuestions: data?.maxQuestions || 5,
      isLoading: isBuilder ? false : isLoading,
      isSubmitting: isBuilder ? false : isValidating,
      error: isBuilder ? null : (error ? (error instanceof Error ? error.message : String(error)) : null)
    };
  }, [data, isBuilder, isLoading, isValidating, error]);
  
  // Explicitly log state changes to help debug UI issues
  useEffect(() => {
    if (!isBuilder && data) {
      console.log('Conversation state updated:', {
        conversationLength: data.conversation?.length,
        hasNextQuestion: !!data.nextQuestion,
        nextQuestion: data.nextQuestion ? data.nextQuestion.substring(0, 30) + (data.nextQuestion.length > 30 ? '...' : '') : '',
        isComplete: data.isComplete
      });
      
      // CRITICAL: Only force a re-validation if we've never had a nextQuestion yet
      // This prevents overriding a valid question that just appeared
      if (!data.nextQuestion && !data.isComplete && data.conversation?.length > 0 && !hasRevalidated) {
        console.log('Initial load with no next question - triggering one-time revalidation');
        
        // Use a small delay to avoid infinite loops
        const refreshTimer = setTimeout(() => {
          // Trigger a refresh of the data without any optimistic update
          mutate(conversationKey, undefined, { revalidate: true });
          
          // Set a flag to prevent repeated revalidations that could override a good question
          setHasRevalidated(true);
        }, 1500);
        
        return () => clearTimeout(refreshTimer);
      }
    }
  }, [data, isBuilder, mutate, conversationKey, hasRevalidated]);
  
  return {
    ...derivedState,
    submitAnswer
  };
}

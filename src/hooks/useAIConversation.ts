import useSWR, { useSWRConfig } from 'swr'
import { SaveDynamicResponseInput, DynamicResponseData } from '@/types/form-service-types'

const CONVERSATION_KEY_PREFIX = 'conversation'

// Extended interfaces to support our builder mode and additional properties
interface ExtendedSaveDynamicResponseInput extends SaveDynamicResponseInput {
  isComplete?: boolean;
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
      
      return response.json()
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
  const submitAnswer = async (question: string, answer: string, isStarterQuestion = false) => {
    if (isBuilder) {
      console.log('Builder mode submit:', { question, answer, isStarterQuestion });
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
        isComplete: data?.isComplete
      };
      
      // Call the API and update the SWR cache with result
      const result = await mutate(
        conversationKey,
        fetchers.saveAnswer(input),
        {
          optimisticData: data ? {
            ...data,
            conversation: [
              ...data.conversation,
              { question, answer, timestamp: new Date().toISOString(), is_starter: isStarterQuestion }
            ]
          } : undefined,
          rollbackOnError: true,
          populateCache: true,
          revalidate: false
        }
      );
      
      return result;
    } catch (error) {
      console.error('Error in submitAnswer:', error);
      throw error;
    }
  };
  
  return {
    conversation: data?.conversation || [],
    nextQuestion: data?.nextQuestion || '',
    isComplete: data?.isComplete || false,
    maxQuestions: data?.maxQuestions || 5,
    isLoading: isBuilder ? false : isLoading,
    isSubmitting: isBuilder ? false : isValidating,
    error: isBuilder ? null : (error ? (error instanceof Error ? error.message : String(error)) : null),
    submitAnswer
  };
}

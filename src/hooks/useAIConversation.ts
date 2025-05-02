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
 * Custom hook for AI conversation management
 * Uses SWR to handle data fetching, caching, and revalidation
 */
export function useAIConversation(
  responseId: string, 
  blockId: string, 
  formId: string, 
) {
  const { mutate } = useSWRConfig()
  const conversationKey = `${CONVERSATION_KEY_PREFIX}:${responseId}:${blockId}`
  
  // Fetch the conversation data
  const { data, error, isLoading, isValidating } = useSWR(
    conversationKey,
    () => fetchers.getConversation(responseId, blockId),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 5000,
      errorRetryCount: 2
    }
  )
  
  // Submit an answer and update the conversation
  const submitAnswer = async (question: string, answer: string, isStarterQuestion = false) => {
    try {
      // Create the input data for the answer submission
      const input: ExtendedSaveDynamicResponseInput = {
        responseId,
        blockId,
        formId,
        question, 
        answer,
        isStarterQuestion,
        // Pass current completion status if available
        isComplete: data?.isComplete
      }
      
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
      )
      
      return result
    } catch (error) {
      console.error('Error in submitAnswer:', error)
      throw error
    }
  }
  
  return {
    conversation: data?.conversation || [],
    nextQuestion: data?.nextQuestion,
    isComplete: data?.isComplete || false,
    maxQuestions: data?.maxQuestions || 5,
    isLoading,
    isSubmitting: isValidating,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    submitAnswer
  }
}

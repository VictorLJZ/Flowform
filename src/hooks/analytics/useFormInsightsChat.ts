import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { 
  ChatMessage, 
  ChatRequest, 
  ChatResponse, 
  MessagesResponse, 
  ErrorResponse
} from '@/types/chat-types';
import { useChatSessionsStore } from '@/stores/chatSessionsStore';

// Types for the hook return value
interface UseFormInsightsChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sessionId: string | null;
  sendMessage: (message: string) => Promise<void>;
}

/**
 * Hook for managing form insights chat with Supabase integration
 * 
 * @param formId The form ID
 * @returns Chat state and functions
 */
export function useFormInsightsChat(formId: string): UseFormInsightsChatReturn {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the session store for managing sessions
  const { 
    currentSessionId, 
    setCurrentSession, 
    fetchSessions,
    updateSessionMetadata
  } = useChatSessionsStore();
  
  // Load sessions and set current session on mount
  useEffect(() => {
    if (formId) {
      fetchSessions(formId);
    }
  }, [formId, fetchSessions]);
  
  // Fetch messages if we have a session ID
  const { 
    data: messagesData, 
    error: messagesError, 
    isLoading,
    mutate: revalidateMessages
  } = useSWR<MessagesResponse>(
    currentSessionId ? `/api/analytics/chat?sessionId=${currentSessionId}` : null,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
      return response.json();
    }
  );
  
  // Extract messages from data
  const messages = messagesData?.messages || [];
  
  // Function to send a message
  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!formId || !message.trim()) {
      return;
    }
    
    setIsSending(true);
    setError(null);
    
    try {
      const requestData: ChatRequest = {
        formId,
        query: message,
        // Only include sessionId if it's not null
        ...(currentSessionId && { sessionId: currentSessionId })
      };
      
      const response = await fetch('/api/analytics/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const responseData = await response.json() as ChatResponse;
      
      // Update session ID if this is a new conversation
      if (!currentSessionId) {
        setCurrentSession(responseData.sessionId);
      }
      
      // Update session metadata with last message
      if (responseData.sessionId) {
        updateSessionMetadata(responseData.sessionId, { last_message: message });
      }
      
      // Revalidate messages to show the new ones
      revalidateMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSending(false);
    }
  }, [formId, currentSessionId, setCurrentSession, updateSessionMetadata, revalidateMessages]);
  
  // Set error from SWR if present
  useEffect(() => {
    if (messagesError) {
      setError(messagesError.message);
    }
  }, [messagesError]);
  
  return {
    messages,
    isLoading,
    isSending,
    error,
    sessionId: currentSessionId,
    sendMessage
  };
} 
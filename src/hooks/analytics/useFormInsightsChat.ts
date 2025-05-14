import { useState, useCallback, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { 
  UiChatMessage, 
  RagStatus, 
  ApiChatRequest, 
  ApiChatResponseData, 
  ApiMessagesResponse, 
  ApiChatMessage 
} from '@/types/conversation';
import { ApiErrorResponse } from '@/types/workspace';
import { useChatSessionsStore } from '@/stores/chatSessionsStore';
import { v4 as uuidv4 } from 'uuid';

// Types for the hook return value
interface UseFormInsightsChatReturn {
  messages: UiChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sessionId: string | null;
  ragStatus: RagStatus | null;
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
  const [lastResponseId, setLastResponseId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<UiChatMessage[]>([]);
  const [ragStatus, setRagStatus] = useState<RagStatus | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  
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
  
  // Clean up any existing event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);
  
  // Fetch messages if we have a session ID
  const { 
    data: messagesData, 
    error: messagesError, 
    isLoading,
    mutate: revalidateMessages
  } = useSWR<ApiMessagesResponse>(
    currentSessionId ? `/api/analytics/chat?sessionId=${currentSessionId}` : null,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
      return response.json();
    }
  );
  
  // Clear local messages when session changes
  useEffect(() => {
    setLocalMessages([]);
  }, [currentSessionId]);
  
  // Combine server messages with optimistic local messages
  // Converting API messages to UI format inline
  const messages = messagesData?.messages ? 
    [...messagesData.messages.map((m: ApiChatMessage) => ({
      id: m.id,
      sessionId: currentSessionId || '',
      role: m.role as 'user' | 'assistant' | 'developer',
      content: m.content,
      createdAt: m.createdAt || new Date().toISOString(),
      formattedTime: new Date(m.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: m.role === 'user',
      formattedRole: m.role === 'user' ? 'You' : m.role === 'assistant' ? 'Assistant' : 'System'
    })), ...localMessages.filter((m: UiChatMessage) => 
      !messagesData.messages.some((sm: ApiChatMessage) => sm.content === m.content && sm.role === m.role)
    )] : 
    localMessages;
  
  // Event handler for EventSource messages
  const handleEventSourceMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'rag_status') {
        // Log the status for debugging
        console.log("Received RAG status update:", data.status);
        
        // Always update state to ensure UI reflects the latest status
        setRagStatus(data.status);
        
        // If the status is 'complete', we can close the EventSource
        if (data.status.stage === 'complete') {
          console.log("RAG status complete, closing EventSource");
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
        }
      } else if (data.type === 'rag_error') {
        console.error('RAG error:', data.error);
        
        // Close on error
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error parsing event data:', error);
    }
  }, []);
  
  // Setup event source for streaming RAG status
  const setupEventSource = useCallback((query: string, forceRag: boolean = false) => {
    // Close any existing event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Check if EventSource is supported by the browser
    if (typeof EventSource === 'undefined') {
      console.log("EventSource not supported in this browser, skipping streaming updates");
      return null;
    }
    
    // Create URL with proper encoding
    const url = new URL('/api/analytics/chat/stream', window.location.origin);
    url.searchParams.append('formId', formId);
    url.searchParams.append('query', query);
    if (currentSessionId) {
      url.searchParams.append('sessionId', currentSessionId);
    }
    if (forceRag) {
      url.searchParams.append('forceRag', 'true');
    }
    
    try {
      // Create and configure the event source
      const eventSource = new EventSource(url.toString());
      console.log("EventSource created for query:", query);
      
      let hasReceivedMessage = false;
      
      // Set a connection timeout - if we don't get a message in 5 seconds, consider it failed
      const connectionTimeout = setTimeout(() => {
        if (!hasReceivedMessage && eventSourceRef.current) {
          console.log("EventSource connection timeout - no messages received");
          eventSource.close();
          eventSourceRef.current = null;
          
          // Don't show error to user - chat will still work, just without streaming
          // setError('Failed to connect to status stream. Your message will still be processed.');
        }
      }, 5000);
      
      // Use the separate event handler function
      eventSource.onmessage = (event) => {
        // Clear timeout since we received a message
        clearTimeout(connectionTimeout);
        
        hasReceivedMessage = true;
        handleEventSourceMessage(event);
      };
      
      eventSource.onopen = () => {
        console.log("EventSource connection opened");
      };
      
      eventSource.onerror = (error) => {
        // Clear timeout since we got an error
        clearTimeout(connectionTimeout);
        
        console.error('EventSource error:', error);
        
        // Only set error if we never received a message (connection failed)
        // but don't show to user since chat will still work without streaming
        if (!hasReceivedMessage) {
          console.log("EventSource connection failed - chat will continue without streaming");
          // setError('Failed to connect to status stream. Your message will still be processed.');
        }
        
        // Always close on error
        eventSource.close();
        eventSourceRef.current = null;
      };
      
      // Store the event source ref for cleanup
      eventSourceRef.current = eventSource;
      
      // Return the event source for later use
      return eventSource;
    } catch (error) {
      console.error('Error setting up EventSource:', error);
      // Don't show errors to the user - silently fallback to non-streaming mode
      return null;
    }
  }, [formId, currentSessionId, handleEventSourceMessage]);
  
  // Function to send a message
  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!formId || !message.trim()) {
      return;
    }
    
    setIsSending(true);
    setError(null);
    setRagStatus(null);
    
    // Optimistically add user message to local state
    const localMessageId = uuidv4();
    const newUserMessage: UiChatMessage = {
      id: localMessageId,
      sessionId: currentSessionId || '',
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
      // Adding required UI properties
      formattedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true,
      formattedRole: 'You'
    };
    
    setLocalMessages(prev => [...prev, newUserMessage]);
    
    // Start the EventSource connection BEFORE the main API call
    // It will show status updates while the main request is processing
    // If it fails, the chat will still work without streaming
    try {
      // No need to store the return value if we're not using it
      setupEventSource(message);
    } catch (e) {
      console.error("Failed to setup EventSource, continuing without streaming:", e);
      // Chat will continue normally without streaming
    }
    
    try {
      const requestData: ApiChatRequest = {
        formId,
        query: message,
        // Only include sessionId if it's not null
        ...(currentSessionId && { sessionId: currentSessionId }),
        // Include previous response ID for conversation continuity
        ...(lastResponseId && { previousResponseId: lastResponseId })
      };
      
      // Regular API call for the actual response
      const response = await fetch('/api/analytics/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const responseData = await response.json() as ApiChatResponseData;
      
      // If response indicates RAG wasn't used, clear any RAG status immediately
      if (!responseData.usedRAG) {
        setRagStatus(null);
        
        // Close the EventSource since it's not needed
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      } else {
        // For RAG responses, keep the EventSource open to show full status progress
        // Set a timeout to eventually close it if it doesn't close itself
        setTimeout(() => {
          if (eventSourceRef.current) {
            console.log("Closing EventSource after timeout");
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
        }, 8000); // 8 seconds is usually enough for all status updates
      }
      
      // Update session ID if this is a new conversation
      if (!currentSessionId) {
        setCurrentSession(responseData.sessionId);
      }
      
      // Store last response ID for conversation continuity
      if (responseData.responseId) {
        setLastResponseId(responseData.responseId);
      }
      
      // Update session metadata with last message
      if (responseData.sessionId) {
        updateSessionMetadata(responseData.sessionId, { lastMessage: message });
      }
      
      // Remove local messages that should be replaced by server data
      setLocalMessages(prev => prev.filter(m => m.id !== localMessageId));
      
      // Revalidate messages to show the new ones
      revalidateMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Clean up event source on error
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    } finally {
      setIsSending(false);
    }
  }, [formId, currentSessionId, setCurrentSession, updateSessionMetadata, revalidateMessages, lastResponseId, setupEventSource]);
  
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
    ragStatus,
    sendMessage
  };
} 
/**
 * API to UI Conversation Transformations
 * 
 * This file provides utility functions for transforming conversation-related types
 * from API layer to UI layer:
 * - Adds UI-specific computed properties for display
 * - Formats dates and values for presentation
 */

import { 
  ApiChatSession, 
  ApiChatMessage, 
  ApiConversationEmbedding
} from '@/types/conversation/ApiConversation';

import { 
  UiChatSession, 
  UiChatMessage, 
  UiConversationEmbedding
} from '@/types/conversation/UiConversation';

/**
 * Convert an API chat session to UI format with display properties
 * 
 * @param apiChatSession - API chat session object
 * @param messageCount - Optional count of messages in the session
 * @param isActive - Whether this is the currently active session
 * @returns UI-formatted chat session object with display enhancements
 */
export function apiToUiChatSession(
  apiChatSession: ApiChatSession, 
  messageCount?: number,
  isActive: boolean = false
): UiChatSession {
  // Format dates for display
  const createdDate = new Date(apiChatSession.createdAt);
  const formattedCreatedAt = createdDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  let formattedUpdatedAt;
  if (apiChatSession.updatedAt) {
    const updatedDate = new Date(apiChatSession.updatedAt);
    formattedUpdatedAt = updatedDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Create a display title (if original title is undefined, use placeholder)
  const displayTitle = apiChatSession.title || 
    `Conversation ${formattedCreatedAt}`;
  
  return {
    ...apiChatSession,
    displayTitle,
    formattedCreatedAt,
    formattedUpdatedAt,
    messageCount,
    isActive
  };
}

/**
 * Convert multiple API chat sessions to UI format
 * 
 * @param apiChatSessions - Array of API chat session objects
 * @param activeSessionId - ID of the currently active session, if any
 * @param messageCounts - Optional map of session IDs to message counts
 * @returns Array of UI-formatted chat session objects
 */
export function apiToUiChatSessions(
  apiChatSessions: ApiChatSession[],
  activeSessionId?: string,
  messageCounts?: Record<string, number>
): UiChatSession[] {
  return apiChatSessions.map(session => apiToUiChatSession(
    session,
    messageCounts?.[session.id],
    session.id === activeSessionId
  ));
}

/**
 * Convert an API chat message to UI format with display properties
 * 
 * @param apiChatMessage - API chat message object
 * @param isLoading - Whether this message is still being processed
 * @returns UI-formatted chat message object with display enhancements
 */
export function apiToUiChatMessage(
  apiChatMessage: ApiChatMessage, 
  isLoading: boolean = false
): UiChatMessage {
  // Format time for display
  const messageDate = new Date(apiChatMessage.createdAt);
  const formattedTime = messageDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Check if this message is from the current user
  const isCurrentUser = apiChatMessage.role === 'user';
  
  // Format role names to be more user-friendly
  const roleFormatMap = {
    'user': 'You',
    'assistant': 'Assistant',
    'developer': 'System'
  };
  
  const formattedRole = roleFormatMap[apiChatMessage.role];
  
  return {
    ...apiChatMessage,
    formattedTime,
    isCurrentUser,
    isLoading,
    formattedRole
  };
}

/**
 * Convert multiple API chat messages to UI format
 * 
 * @param apiChatMessages - Array of API chat message objects
 * @returns Array of UI-formatted chat message objects
 */
export function apiToUiChatMessages(apiChatMessages: ApiChatMessage[]): UiChatMessage[] {
  return apiChatMessages.map(message => apiToUiChatMessage(message));
}

/**
 * Convert an API conversation embedding to UI format with display properties
 * 
 * @param apiEmbedding - API conversation embedding object
 * @param similarityScore - Optional similarity score for search results
 * @returns UI-formatted conversation embedding object with display enhancements
 */
export function apiToUiConversationEmbedding(
  apiEmbedding: ApiConversationEmbedding,
  similarityScore?: number
): UiConversationEmbedding {
  // Create truncated text preview (limit to 100 characters)
  const maxPreviewLength = 100;
  const truncatedText = apiEmbedding.conversationText.length > maxPreviewLength
    ? `${apiEmbedding.conversationText.substring(0, maxPreviewLength)}...`
    : apiEmbedding.conversationText;
  
  // Format creation date for display
  const createdDate = new Date(apiEmbedding.createdAt);
  const formattedCreatedAt = createdDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  return {
    ...apiEmbedding,
    truncatedText,
    formattedCreatedAt,
    similarityScore
  };
}

/**
 * Convert multiple API conversation embeddings to UI format
 * 
 * @param apiEmbeddings - Array of API conversation embedding objects
 * @param similarityScores - Optional map of embedding IDs to similarity scores
 * @returns Array of UI-formatted conversation embedding objects
 */
export function apiToUiConversationEmbeddings(
  apiEmbeddings: ApiConversationEmbedding[],
  similarityScores?: Record<string, number>
): UiConversationEmbedding[] {
  return apiEmbeddings.map(embedding => apiToUiConversationEmbedding(
    embedding,
    similarityScores?.[embedding.id]
  ));
}

/**
 * API to DB Conversation Transformations
 * 
 * This file provides utility functions for transforming conversation-related types
 * from API layer to Database layer for write operations:
 * - Converts camelCase API fields to snake_case DB fields
 * - Converts undefined values to null for optional fields
 */

import { 
  DbChatSession, 
  DbChatMessage, 
  DbConversationEmbedding
} from '@/types/conversation/DbConversation';

import { 
  ApiChatSessionInput,
  ApiChatSessionUpdateInput,
  ApiChatMessageInput,
  ApiConversationEmbeddingInput
} from '@/types/conversation/ApiConversation';

/**
 * Convert an API chat session input to database format for creation
 * 
 * @param apiInput - API chat session input object
 * @returns Database-formatted chat session object (without id and timestamps)
 */
export function apiToDbChatSession(apiInput: ApiChatSessionInput): Omit<DbChatSession, 'id' | 'created_at' | 'updated_at'> {
  return {
    form_id: apiInput.formId,
    user_id: apiInput.userId,
    title: apiInput.title === undefined ? null : apiInput.title,
    last_message: null,
    last_response_id: null
  };
}

/**
 * Convert an API chat session update input to database format for updating
 * 
 * @param apiInput - API chat session update input object
 * @returns Database-formatted partial chat session object for update operations
 */
export function apiToDbChatSessionUpdate(apiInput: ApiChatSessionUpdateInput): Partial<Omit<DbChatSession, 'id' | 'created_at'>> {
  const updates: Partial<Omit<DbChatSession, 'id' | 'created_at'>> = {
    updated_at: new Date().toISOString()
  };
  
  if (apiInput.title !== undefined) {
    updates.title = apiInput.title === undefined ? null : apiInput.title;
  }
  
  if (apiInput.lastMessage !== undefined) {
    updates.last_message = apiInput.lastMessage === undefined ? null : apiInput.lastMessage;
  }
  
  if (apiInput.lastResponseId !== undefined) {
    updates.last_response_id = apiInput.lastResponseId === undefined ? null : apiInput.lastResponseId;
  }
  
  return updates;
}

/**
 * Convert an API chat message input to database format for creation
 * 
 * @param apiInput - API chat message input object
 * @returns Database-formatted chat message object (without id and timestamp)
 */
export function apiToDbChatMessage(apiInput: ApiChatMessageInput): Omit<DbChatMessage, 'id' | 'created_at'> {
  return {
    session_id: apiInput.sessionId,
    role: apiInput.role,
    content: apiInput.content
  };
}

/**
 * Convert an API conversation embedding input to database format for creation
 * 
 * @param apiInput - API conversation embedding input object
 * @returns Database-formatted conversation embedding object (without id and timestamp)
 */
export function apiToDbConversationEmbedding(apiInput: ApiConversationEmbeddingInput): Omit<DbConversationEmbedding, 'id' | 'created_at'> {
  return {
    form_id: apiInput.formId,
    block_id: apiInput.blockId,
    response_id: apiInput.responseId,
    conversation_text: apiInput.conversationText,
    embedding: apiInput.embedding === undefined ? null : apiInput.embedding
  };
}

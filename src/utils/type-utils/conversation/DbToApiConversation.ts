/**
 * Database to API Conversation Transformations
 * 
 * This file provides utility functions for transforming conversation-related types
 * from Database (Db) layer to API layer:
 * - Converts snake_case DB fields to camelCase API fields
 * - Converts null values to undefined for optional fields
 */

import { 
  DbChatSession, 
  DbChatMessage, 
  DbConversationEmbedding
} from '@/types/conversation/DbConversation';

import { 
  ApiChatSession, 
  ApiChatMessage, 
  ApiConversationEmbedding
} from '@/types/conversation/ApiConversation';

/**
 * Convert a database chat session to API format
 * 
 * @param dbChatSession - Database chat session object
 * @returns API-formatted chat session object
 */
export function dbToApiChatSession(dbChatSession: DbChatSession): ApiChatSession {
  return {
    id: dbChatSession.id,
    formId: dbChatSession.form_id,
    userId: dbChatSession.user_id,
    createdAt: dbChatSession.created_at,
    updatedAt: dbChatSession.updated_at === null ? undefined : dbChatSession.updated_at,
    title: dbChatSession.title === null ? undefined : dbChatSession.title,
    lastMessage: dbChatSession.last_message === null ? undefined : dbChatSession.last_message,
    lastResponseId: dbChatSession.last_response_id === null ? undefined : dbChatSession.last_response_id
  };
}

/**
 * Convert multiple database chat sessions to API format
 * 
 * @param dbChatSessions - Array of database chat session objects
 * @returns Array of API-formatted chat session objects
 */
export function dbToApiChatSessions(dbChatSessions: DbChatSession[]): ApiChatSession[] {
  return dbChatSessions.map(dbToApiChatSession);
}

/**
 * Convert a database chat message to API format
 * 
 * @param dbChatMessage - Database chat message object
 * @returns API-formatted chat message object
 */
export function dbToApiChatMessage(dbChatMessage: DbChatMessage): ApiChatMessage {
  return {
    id: dbChatMessage.id,
    sessionId: dbChatMessage.session_id,
    role: dbChatMessage.role as 'user' | 'assistant' | 'developer',
    content: dbChatMessage.content,
    createdAt: dbChatMessage.created_at
  };
}

/**
 * Convert multiple database chat messages to API format
 * 
 * @param dbChatMessages - Array of database chat message objects
 * @returns Array of API-formatted chat message objects
 */
export function dbToApiChatMessages(dbChatMessages: DbChatMessage[]): ApiChatMessage[] {
  return dbChatMessages.map(dbToApiChatMessage);
}

/**
 * Convert a database conversation embedding to API format
 * 
 * @param dbEmbedding - Database conversation embedding object
 * @returns API-formatted conversation embedding object
 */
export function dbToApiConversationEmbedding(dbEmbedding: DbConversationEmbedding): ApiConversationEmbedding {
  return {
    id: dbEmbedding.id,
    formId: dbEmbedding.form_id,
    blockId: dbEmbedding.block_id,
    responseId: dbEmbedding.response_id,
    conversationText: dbEmbedding.conversation_text,
    embedding: dbEmbedding.embedding === null ? undefined : dbEmbedding.embedding,
    createdAt: dbEmbedding.created_at
  };
}

/**
 * Convert multiple database conversation embeddings to API format
 * 
 * @param dbEmbeddings - Array of database conversation embedding objects
 * @returns Array of API-formatted conversation embedding objects
 */
export function dbToApiConversationEmbeddings(dbEmbeddings: DbConversationEmbedding[]): ApiConversationEmbedding[] {
  return dbEmbeddings.map(dbToApiConversationEmbedding);
}

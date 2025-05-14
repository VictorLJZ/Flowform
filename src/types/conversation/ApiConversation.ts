/**
 * API-level conversation types
 * 
 * These types represent conversation data as it's used in API requests and responses.
 * They use camelCase naming and may include additional API-specific properties.
 */

import { PostgrestError } from '@supabase/supabase-js';

/**
 * API-formatted chat session
 */
export interface ApiChatSession {
  id: string;
  formId: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  title?: string;
  lastMessage?: string;
  lastResponseId?: string;
}

/**
 * Input type for creating a new chat session
 */
export interface ApiChatSessionInput {
  formId: string;
  userId: string;
  title?: string;
}

/**
 * Input type for updating an existing chat session
 */
export interface ApiChatSessionUpdateInput {
  title?: string;
  lastMessage?: string;
  lastResponseId?: string;
}

/**
 * API-formatted chat message
 */
export interface ApiChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'developer';
  content: string;
  createdAt: string;
}

/**
 * Input type for creating a new chat message
 */
export interface ApiChatMessageInput {
  sessionId: string;
  role: 'user' | 'assistant' | 'developer';
  content: string;
}

/**
 * API-formatted conversation embedding
 */
export interface ApiConversationEmbedding {
  id: string;
  formId: string;
  blockId: string;
  responseId: string;
  conversationText: string;
  embedding?: number[]; // Vector representation
  createdAt: string;
}

/**
 * Input type for creating a new conversation embedding
 */
export interface ApiConversationEmbeddingInput {
  formId: string;
  blockId: string;
  responseId: string;
  conversationText: string;
  embedding?: number[];
}

/**
 * API response type for chat-related operations
 */
export type ApiChatResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

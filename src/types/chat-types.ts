/**
 * Chat message interface
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

/**
 * Chat session interface
 */
export interface ChatSession {
  id: string;
  form_id: string;
  user_id: string;
  created_at: string;
  title?: string; // Optional title for the session
  last_message?: string; // Last message in the conversation
  updated_at?: string; // When the session was last updated
}

/**
 * Session info for managing multiple chat sessions
 */
export interface SessionInfo {
  id: string;
  title: string; // Display title (defaults to date if not set)
  created_at: string;
  updated_at?: string; // When the session was last updated
  last_message?: string; // Optional preview of last message
}

/**
 * Chat API request interface for sending a message
 */
export interface ChatRequest {
  formId: string;
  query: string;
  sessionId?: string;
  previous_response_id?: string; // OpenAI response ID for conversation continuity
}

/**
 * Chat API response interface
 */
export interface ChatResponse {
  sessionId: string;
  response: string;
  response_id?: string; // OpenAI response ID for state management
  usedRAG?: boolean; // Flag indicating whether RAG was used for this response
}

/**
 * Messages API response interface
 */
export interface MessagesResponse {
  messages: ChatMessage[];
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  error: string;
}

/**
 * Processing status for embeddings
 */
export interface EmbeddingProcessingStatus {
  success: boolean;
  processed: number;
  skipped: number;
  errors: number;
}

/**
 * RAG processing status for streaming updates
 */
export interface RagStatus {
  stage: 'searching' | 'processing' | 'complete';
  query?: string;
  resultsCount?: number;
  timestamp: number;
} 
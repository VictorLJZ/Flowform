/**
 * Database-level conversation types
 * 
 * These types represent conversation data as it exists in the database.
 * They use snake_case naming to match the database schema.
 */

/**
 * Database chat sessions table schema
 */
export interface DbChatSession {
  id: string;
  form_id: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  title: string | null;
  last_message: string | null;
  last_response_id: string | null;
}

/**
 * Database chat messages table schema
 */
export interface DbChatMessage {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
}

/**
 * Database conversation embeddings table schema
 */
export interface DbConversationEmbedding {
  id: string;
  form_id: string;
  block_id: string;
  response_id: string;
  conversation_text: string;
  embedding: number[] | null; // Vector representation
  created_at: string;
}

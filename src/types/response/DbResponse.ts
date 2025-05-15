/**
 * Database-level response types
 * 
 * These types directly reflect the database schema for response-related tables.
 * They use snake_case naming to match database column names.
 * 
 * Use these types for:
 * - Database queries and mutations
 * - Direct interaction with Supabase
 * - Backend services that work with raw database data
 */

/**
 * Response status type
 */
export type DbResponseStatus = 'in_progress' | 'completed' | 'abandoned';

/**
 * Database form_responses table schema
 */
export interface DbFormResponse {
  id: string; // UUID
  form_id: string; // UUID, references forms.id
  form_version_id: string | null; // UUID, references form_versions.id 
  respondent_id: string; // Text identifier for the respondent
  status: DbResponseStatus;
  started_at: string; // Timestamp with time zone
  completed_at: string | null; // Timestamp with time zone
  metadata: Record<string, unknown> | null; // JSONB
}

/**
 * Database static_block_answers table schema
 */
export interface DbStaticBlockAnswer {
  id: string; // UUID
  response_id: string; // UUID, references form_responses.id
  block_id: string; // UUID, references form_blocks.id
  type: "answer", content: string | null; // Text content of the answer
  answered_at: string; // Timestamp with time zone
}

/**
 * Database dynamic_block_responses table schema
 */
export interface DbDynamicBlockResponse {
  id: string; // UUID
  response_id: string; // UUID, references form_responses.id
  block_id: string; // UUID, references form_blocks.id
  started_at: string; // Timestamp with time zone
  updated_at: string | null; // Timestamp with time zone
  completed_at: string | null; // Timestamp with time zone
  conversation: DbQAPair[]; // Array of question-answer pairs
  next_type: "question", content: string | null; // Text, next AI-generated question
}

/**
 * Type for question-answer pair in dynamic block responses
 * Note: This is different from the Chat with Data feature - this is specifically for form responses
 */
export interface DbQAPair {
  type: 'question' | 'answer';
  content: string;
  timestamp: string; // ISO date string
  is_starter: boolean; // Whether this is a starter question/answer from the form configuration
}

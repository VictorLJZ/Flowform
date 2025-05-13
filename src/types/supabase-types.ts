// FlowForm-neo Supabase Database Types
// Defines TypeScript interfaces for all database tables

import type { BlockType } from './block-types';
import type { SaveDynamicResponseInput } from './form-service-types';
import { DbForm } from './form';
import { DbQAPair } from './response';

/**
 * Database Tables - Workspace Management
 * Note: Workspace-related types have been moved to src/types/workspace/*
 */


/**
 * Database Tables - Form Management
 * Note: The Form interface has been moved to src/types/form/DbForm.ts
 */

// BlockType definition moved to block-types.ts
export type StaticBlockSubtype = 
  'short_text' | 
  'long_text' | 
  'email' | 
  'date' | 
  'multiple_choice' | 
  'checkbox_group' | 
  'dropdown' | 
  'number' | 
  'scale' | 
  'yes_no';

export interface FormBlock {
  id: string; // UUID
  form_id: string; // UUID, references forms.form_id
  type: BlockType;
  subtype: StaticBlockSubtype | 'dynamic';
  title: string;
  description: string | null;
  required: boolean;
  order_index: number;
  settings: Record<string, unknown> | null; // JSONB
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface DynamicBlockConfig {
  block_id: string; // UUID, references form_blocks.id
  starter_question: string;
  temperature: number; // Float
  max_questions: number;
  ai_instructions: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface BlockOption {
  id: string; // UUID
  block_id: string; // UUID, references form_blocks.id
  value: string;
  label: string;
  order_index: number;
  created_at: string; // ISO date string
}

/**
 * Database Table - Workflow Edges
 * Represents a connection between two blocks in a form workflow
 */
export interface WorkflowEdge {
  id: string; // UUID
  form_id: string; // UUID, references forms.form_id
  source_block_id: string; // UUID, references form_blocks.id
  default_target_id: string | null; // UUID, references form_blocks.id
  
  // New fields for enhanced condition system
  condition_type: 'always' | 'conditional' | 'fallback'; // Type of condition
  
  rules?: string; // New field for storing complex rules as JSON string
  order_index: number;
  is_explicit: boolean; // Added is_explicit field to match database schema
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface FormResponse {
  id: string; // UUID
  form_id: string; // UUID, references forms.form_id
  respondent_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string; // ISO date string
  completed_at: string | null; // ISO date string
  metadata: Record<string, unknown> | null; // JSONB
}

/**
 * @deprecated Use the new type system instead:
 * - DbStaticBlockAnswer: Database layer (/types/response/DbResponse.ts)
 * - ApiStaticBlockAnswer: API layer (/types/response/ApiResponse.ts)
 * - UiStaticBlockAnswer: UI layer (/types/response/UiResponse.ts)
 * Import these types from '@/types/response' instead
 */
export interface StaticBlockAnswer {
  id: string; // UUID
  response_id: string; // UUID, references form_responses.id
  block_id: string; // UUID, references form_blocks.id
  answer: string | null;
  answered_at: string; // ISO date string
}

/**
 * @deprecated Use the new type system instead:
 * - DbQAPair: Database layer (/types/response/DbResponse.ts)
 * - ApiQAPair: API layer (/types/response/ApiResponse.ts)
 * - UiQAPair: UI layer (/types/response/UiResponse.ts)
 * Import these types from '@/types/response' instead
 */
export interface QAPair {
  question: string;
  answer: string;
  timestamp: string; // ISO date string
  is_starter: boolean;
}

/**
 * @deprecated Use the new type system instead:
 * - DbDynamicBlockResponse: Database layer (/types/response/DbResponse.ts)
 * - ApiDynamicBlockResponse: API layer (/types/response/ApiResponse.ts)
 * - UiDynamicBlockResponse: UI layer (/types/response/UiResponse.ts)
 * Import these types from '@/types/response' instead
 */
export interface DynamicBlockResponse {
  id: string; // UUID
  response_id: string; // UUID, references form_responses.id
  block_id: string; // UUID, references form_blocks.id
  conversation: DbQAPair[]; // JSONB array
  next_question?: string; // Added field for the next question
  started_at: string; // ISO date string
  completed_at: string | null; // ISO date string
  updated_at?: string; // ISO date string
}

/**
 * Database Tables - Analytics
 */

export interface FormView {
  id: string; // UUID
  form_id: string; // UUID, references forms.form_id
  visitor_id: string;
  source: string | null;
  device_type: string | null;
  browser: string | null;
  timestamp: string; // ISO date string
  is_unique: boolean;
}

export interface FormMetrics {
  form_id: string; // UUID, references forms.form_id
  total_views: number;
  unique_views: number;
  total_starts: number;
  total_completions: number;
  completion_rate: number; // Float
  average_completion_time_seconds: number | null;
  bounce_rate: number; // Float
  last_updated: string; // ISO date string
}

export interface BlockMetrics {
  id: string; // UUID
  block_id: string; // UUID, references form_blocks.id
  form_id: string; // UUID, references forms.form_id
  views: number;
  skips: number;
  average_time_seconds: number | null;
  drop_off_count: number;
  drop_off_rate: number; // Float
  last_updated: string; // ISO date string
}

export interface FormInteraction {
  id: string; // UUID
  response_id: string | null; // UUID, references form_responses.id
  block_id: string | null; // UUID, references form_blocks.id
  interaction_type: 'view' | 'focus' | 'blur' | 'change' | 'submit' | 'error';
  timestamp: string; // ISO date string
  duration_ms: number | null;
  metadata: Record<string, unknown> | null; // JSONB
}

export interface DynamicBlockAnalytics {
  id: string; // UUID
  dynamic_response_id: string; // UUID, references dynamic_block_responses.id
  block_id: string; // UUID, references form_blocks.id
  question_index: number;
  question_text: string;
  time_to_answer_seconds: number | null;
  answer_length: number | null;
  sentiment_score: number | null; // Float
  topics: { topic: string; confidence: number; relevance?: number }[] | null; // JSONB
}

// Type for joining tables and getting complete form data
export interface CompleteForm extends DbForm {
  blocks: (FormBlock & {
    dynamic_config?: DynamicBlockConfig;
    options?: BlockOption[];
  })[];
  // Workflow connections for the form
  workflow_edges?: WorkflowEdge[];
  // For versioned forms, the ID of the form version
  version_id?: string;
  // For versioned forms, the version number
  version_number?: number;
}

// Type for joining tables and getting complete response data
// Note: This is being replaced by the new type system, use ApiFormResponse and related types instead
export interface CompleteResponse {
  // Use ApiFormResponse properties instead
  id: string;
  formId: string;
  formVersionId?: string;
  respondentId: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
  
  // Related data
  static_answers: import('./response').ApiStaticBlockAnswer[];
  dynamic_responses: import('./response').ApiDynamicBlockResponse[];
  form: DbForm;
}

// Selection record types for session API routes
export type StaticAnswerRecord = {
  block_id: string;
  answer: string | null;
}

/**
 * @deprecated Use the new type system instead:
 * - Import DbQAPair from '@/types/response' and use:
 * { block_id: string; conversation: DbQAPair[] }
 */
export type DynamicResponseRecord = {
  block_id: string;
  conversation: DbQAPair[];
}

// FormRecord has been removed - use Form + DynamicBlockConfig combination instead

export interface ExtendedSaveDynamicResponseInput extends SaveDynamicResponseInput {
  isComplete?: boolean;
  questionIndex?: number; // Added to support truncating the conversation at a specific index
  maxQuestions?: number; // Added to support custom max questions limit
}

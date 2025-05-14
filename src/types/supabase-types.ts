// FlowForm-neo Supabase Database Types
// Defines TypeScript interfaces for all database tables

// Import from form-service-types
import type { SaveDynamicResponseInput } from './form-service-types';
import { DbForm } from './form';
import { DbQAPair } from './response';

/**
 * Database Tables - Workspace Management
 * Note: Workspace-related types have been moved to src/types/workspace/*
 */


/**
 * Database Tables - Form Management
 * Note: This file is being migrated to the new three-layer type system
 * Most types defined here have been moved to their respective files in:
 * - src/types/block/DbBlock.ts - Database layer block types
 * - src/types/block/ApiBlock.ts - API layer block types
 * - src/types/block/UiBlock.ts - UI layer block types
 * - src/types/form/DbForm.ts - Database layer form types
 */

/**
 * @deprecated - Import DbStaticBlockSubtype from @/types/block/DbBlock instead
 */
import { DbStaticBlockSubtype } from '@/types/block/DbBlock';
export type StaticBlockSubtype = DbStaticBlockSubtype;

/**
 * @deprecated - Import DbBlock from @/types/block/DbBlock instead
 */
import { DbBlock, DbBlockType } from '@/types/block/DbBlock';
// Re-export with legacy type for backward compatibility
export interface FormBlock extends Omit<DbBlock, 'type' | 'subtype'> {
  type: DbBlockType; // Use DbBlockType from our new type system
  subtype: StaticBlockSubtype | 'dynamic'; // Use legacy subtype for compatibility
}

/**
 * @deprecated - Import DbDynamicBlockConfig from @/types/block/DbBlock instead
 */
import { DbDynamicBlockConfig } from '@/types/block/DbBlock';
export type { DbDynamicBlockConfig as DynamicBlockConfig };

/**
 * @deprecated - Import DbBlockOption from @/types/block/DbBlock instead
 */
import { DbBlockOption } from '@/types/block/DbBlock';
export type { DbBlockOption as BlockOption };

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

// These types have been migrated to the new type system
// FormResponse -> DbFormResponse, ApiFormResponse, UiFormResponse
// StaticBlockAnswer -> DbStaticBlockAnswer, ApiStaticBlockAnswer, UiStaticBlockAnswer
// QAPair -> DbQAPair, ApiQAPair
// DynamicBlockResponse -> DbDynamicBlockResponse, ApiDynamicBlockResponse, UiDynamicBlockResponse

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
export type FormWithBlocks = DbForm & {
  blocks?: FormBlock[] | null;
  workflow_edges?: WorkflowEdge[] | null;
  dynamic_configs?: DbDynamicBlockConfig[] | null;
  block_options?: DbBlockOption[] | null;
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

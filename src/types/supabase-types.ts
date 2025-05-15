// FlowForm-neo Supabase Database Types
// Defines TypeScript interfaces for all database tables

// Import from form-service-types
import type { SaveDynamicResponseInput } from './form-service-types';
import { DbForm } from './form';
import { DbQAPair } from './response';


// These block-related types have been fully migrated to the new type system
// Import from '@/types/block' directly instead
import { DbBlock, DbBlockOption, DbDynamicBlockConfig } from '@/types/block/DbBlock'

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

/**
 * Database Tables - Analytics
 */

// FormMetrics has been migrated to the new three-layer type system
// See src/types/analytics/DbFormMetrics.ts, ApiFormMetrics.ts, and UiFormMetrics.ts

// BlockMetrics has been migrated to the new three-layer type system
// See src/types/analytics/DbBlockMetrics.ts, ApiBlockMetrics.ts, and UiBlockMetrics.ts

// FormInteraction has been migrated to the new three-layer type system
// See src/types/analytics/DbFormMetrics.ts (DbFormInteraction), ApiFormMetrics.ts (ApiFormInteraction), and UiFormMetrics.ts (UiFormInteraction)

// DynamicBlockAnalytics has been migrated to the new three-layer type system
// See src/types/analytics/DbDynamicBlockAnalytics.ts, ApiDynamicBlockAnalytics.ts, and UiDynamicBlockAnalytics.ts

// Type for joining tables and getting complete form data
export type FormWithBlocks = DbForm & {
  blocks?: DbBlock[] | null;
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
  type: "answer", content: string | null;
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

// FlowForm-neo Supabase Database Types
// Defines TypeScript interfaces for all database tables

/**
 * Database Tables - Workspace Management
 */

export interface Profile {
  id: string; // UUID, references auth.users.id
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface Workspace {
  id: string; // UUID
  name: string;
  description: string | null;
  created_at: string; // ISO date string
  created_by: string; // UUID, references auth.users.id
  updated_at: string; // ISO date string
  logo_url: string | null;
  settings: Record<string, any> | null; // JSONB
}

export interface WorkspaceInvitation {
  id: string; // UUID
  workspace_id: string; // UUID, references workspaces.id
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invited_by: string; // UUID, references auth.users.id
  invited_at: string; // ISO date string
  expires_at: string; // ISO date string
  token: string;
}

export interface WorkspaceMember {
  workspace_id: string; // UUID, references workspaces.id
  user_id: string; // UUID, references auth.users.id
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joined_at: string; // ISO date string
}

/**
 * Database Tables - Form Management
 */

export interface Form {
  form_id: string; // UUID
  workspace_id: string; // UUID, references workspaces.id
  title: string;
  description: string | null;
  slug: string | null;
  status: 'draft' | 'published' | 'archived';
  theme: Record<string, any> | null; // JSONB
  settings: Record<string, any> | null; // JSONB
  created_at: string; // ISO date string
  created_by: string; // UUID, references auth.users.id
  updated_at: string; // ISO date string
  published_at: string | null; // ISO date string
}

export type BlockType = 'static' | 'dynamic' | 'layout' | 'integration';
export type StaticBlockSubtype = 
  'text_short' | 
  'text_long' | 
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
  settings: Record<string, any> | null; // JSONB
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

export interface FormResponse {
  id: string; // UUID
  form_id: string; // UUID, references forms.form_id
  respondent_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string; // ISO date string
  completed_at: string | null; // ISO date string
  metadata: Record<string, any> | null; // JSONB
}

export interface StaticBlockAnswer {
  id: string; // UUID
  response_id: string; // UUID, references form_responses.id
  block_id: string; // UUID, references form_blocks.id
  answer: string | null;
  answered_at: string; // ISO date string
}

export interface QAPair {
  question: string;
  answer: string;
  timestamp: string; // ISO date string
  is_starter: boolean;
}

export interface DynamicBlockResponse {
  id: string; // UUID
  response_id: string; // UUID, references form_responses.id
  block_id: string; // UUID, references form_blocks.id
  conversation: QAPair[]; // JSONB array
  started_at: string; // ISO date string
  completed_at: string | null; // ISO date string
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
  metadata: Record<string, any> | null; // JSONB
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
  topics: Record<string, any>[] | null; // JSONB
}

// Type for joining tables and getting complete form data
export interface CompleteForm extends Form {
  blocks: (FormBlock & {
    dynamic_config?: DynamicBlockConfig;
    options?: BlockOption[];
  })[];
}

// Type for joining tables and getting complete response data
export interface CompleteResponse extends FormResponse {
  static_answers: StaticBlockAnswer[];
  dynamic_responses: DynamicBlockResponse[];
  form: Form;
}

/**
 * Legacy Form Type (used in existing components)
 * This matches the form structure expected by components like FormSessionPage
 */
export interface FormRecord {
  id: string; // Legacy ID field (maps to form_id in new schema)
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  workspace_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  max_questions: number; // Maximum questions for dynamic conversations
  starter_question: string; // Initial question to ask
  temperature: number; // AI temperature setting
  ai_instructions?: string; // Instructions for the AI
}

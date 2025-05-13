import { FormBlock, DynamicBlockConfig, QAPair } from './supabase-types';
import { DbForm, ApiForm } from './form';
import { Connection } from './workflow-types';

/**
 * Form Service Types
 * 
 * This file centralizes all input/output types used by form-related service functions.
 * Types are organized by the service they relate to for easy navigation.
 */

// -----------------------------------------------------
// Common Types
// -----------------------------------------------------

/**
 * Standard service response structure with success/error pattern
 */
export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// -----------------------------------------------------
// Form Block Service Types
// -----------------------------------------------------

/**
 * Input for creating a form block
 */
export type FormBlockInput = Pick<FormBlock, 
  'form_id' | 
  'type' | 
  'subtype' | 
  'title' | 
  'description' | 
  'required' | 
  'order_index' | 
  'settings'
>;

/**
 * Input for creating a dynamic block configuration
 */
export type DynamicConfigInput = Pick<DynamicBlockConfig,
  'starter_question' |
  'temperature' |
  'max_questions' |
  'ai_instructions'
>;

/**
 * Response from creating a form block
 */
export type FormBlockCreationResult = FormBlock & { 
  dynamic_config?: DynamicBlockConfig 
};

/**
 * Input for updating a form block
 */
export type FormBlockUpdateInput = Partial<FormBlockInput> & {
  id: string;
};

// -----------------------------------------------------
// Dynamic Block Response Types
// -----------------------------------------------------

/**
 * Input for saving a dynamic block response
 */
export interface SaveDynamicResponseInput {
  responseId: string;   // form_responses.id
  blockId: string;      // form_blocks.id
  formId: string;       // forms.form_id
  question: string;     // The current question
  answer: string;       // The user's answer
  isStarterQuestion?: boolean; // Whether this is the first question
  isComplete?: boolean; // Override completion status (for special cases)
  mode?: 'builder' | 'viewer'; // Application mode for context
  questionIndex?: number; // Index of the question being answered (for truncating the conversation)
}

/**
 * Result data for dynamic block responses
 */
export interface DynamicResponseData {
  conversation: QAPair[];
  nextQuestion?: string;
  isComplete: boolean;
}

/**
 * Complete result for saving a dynamic block response
 */
export type SaveDynamicResponseResult = ServiceResponse<DynamicResponseData>;

// -----------------------------------------------------
// Dynamic Block Configuration Types
// -----------------------------------------------------

/**
 * Input for saving dynamic block configuration
 */
export interface SaveDynamicConfigInput {
  blockId: string;
  starterQuestion: string;
  temperature: number;
  maxQuestions: number;
  aiInstructions?: string;
}

/**
 * Result for saving dynamic block configuration
 */
export type SaveDynamicConfigResult = ServiceResponse<DynamicBlockConfig>;

// -----------------------------------------------------
// Form Types
// -----------------------------------------------------

/**
 * Workflow settings structure for forms
 */
export interface WorkflowSettings {
  connections: Connection[];
  [key: string]: unknown;
}

/**
 * Form settings structure
 */
export interface FormSettings {
  workflow?: WorkflowSettings;
  [key: string]: unknown;
}

/**
 * Input for creating a new form
 * Uses DB format with snake_case fields
 */
export type FormInput = Pick<DbForm, 'workspace_id' | 'title' | 'description' | 'created_by' | 'status' | 'theme' | 'settings'>;

/**
 * Input for updating an existing form
 * Uses DB format with snake_case fields
 */
export type FormUpdateInput = Partial<Pick<DbForm, 
  'title' | 
  'description' | 
  'status' | 
  'theme' | 
  'settings' | 
  'published_at'
>>;

/**
 * Input for saving a form with its blocks
 */
export interface SaveFormInput {
  form_id: string;
  title: string;
  description?: string;
  workspace_id?: string;
  created_by?: string;
  status?: 'draft' | 'published' | 'archived';
  theme?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

/**
 * Output from saving a form with its blocks
 */
export interface SaveFormOutput {
  form: ApiForm;
  blocks: FormBlock[];
  success: boolean;
}

// -----------------------------------------------------
// Dynamic Block Question Types
// -----------------------------------------------------

/**
 * Result from getting a dynamic block question
 */
export interface GetQuestionResult extends ServiceResponse {
  data?: {
    question: string;
    blockId: string;
    temperature: number;
    maxQuestions: number;
    aiInstructions: string | null;
  };
}

// -----------------------------------------------------
// Form Context Types
// -----------------------------------------------------

/**
 * Static question context for AI
 */
export interface StaticQuestionContext {
  id: string;
  title: string;
  description: string | null;
  type: 'static';
  subtype: string;
}

/**
 * Dynamic question context for AI
 */
export interface DynamicQuestionContext {
  id: string;
  title: string;
  description: string | null;
  type: 'dynamic';
  starter_question: string;
}

/**
 * Form context information provided to AI
 */
export interface FormContextData {
  formId: string;
  formTitle: string;
  staticQuestions: StaticQuestionContext[];
  dynamicBlocks: DynamicQuestionContext[];
}

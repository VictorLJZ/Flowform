/**
 * API layer type definitions for form blocks
 * Used for data transfer between client and server
 * Uses camelCase naming convention
 */

/**
 * Type of block in the form builder/viewer
 */
export type ApiBlockType = 'static' | 'dynamic' | 'integration' | 'layout';

/**
 * Subtypes for static blocks
 */
export type ApiStaticBlockSubtype = 
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

/**
 * Subtypes for dynamic blocks
 */
export type ApiDynamicBlockSubtype = 'ai_conversation';

/**
 * Subtypes for integration blocks
 */
export type ApiIntegrationBlockSubtype = 'hubspot';

/**
 * Subtypes for layout blocks
 */
export type ApiLayoutBlockSubtype = 'page_break' | 'redirect';

/**
 * Combined union type of all block subtypes
 */
export type ApiBlockSubtype = 
  | ApiStaticBlockSubtype 
  | ApiDynamicBlockSubtype 
  | ApiIntegrationBlockSubtype 
  | ApiLayoutBlockSubtype;

/**
 * API representation of a form block
 */
export interface ApiBlock {
  id: string;
  formId: string;
  type: ApiBlockType;
  subtype: ApiBlockSubtype;
  title: string;
  description?: string | null;
  required: boolean;
  orderIndex: number;
  settings: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Type for block settings in API layer
 */
export interface ApiBlockSettings {
  [key: string]: unknown;
}

/**
 * API representation of a block option for choice-based blocks
 * Maps to DbBlockOption with camelCase property names
 */
export interface ApiBlockOption {
  id: string;
  blockId: string; // Converted from block_id
  value: string;
  label: string; // Same as label in DB
  orderIndex: number; // Converted from order_index
  createdAt: string; // Converted from created_at
}

/**
 * API configuration for dynamic blocks
 * Maps to DbDynamicBlockConfig with camelCase property names
 */
export interface ApiDynamicBlockConfig {
  blockId: string; // Converted from block_id
  starterQuestion: string; // Converted from starter_question
  temperature: number;
  maxQuestions: number; // Converted from max_questions
  aiInstructions: string | null; // Converted from ai_instructions
  createdAt: string; // Converted from created_at
  updatedAt: string; // Converted from updated_at
}

/**
 * Type for block choice options in settings JSON
 * Maps to DbBlockOptionSetting with camelCase property names
 */
export interface ApiBlockOptionSetting {
  id: string;
  text: string;
  value: string;
  isDefault?: boolean; // Converted from is_default
  orderIndex: number; // Converted from order_index
}

/**
 * Configuration for dynamic blocks in settings JSON
 * Maps to DbDynamicBlockConfigSetting with camelCase property names
 */
export interface ApiDynamicBlockConfigSetting {
  systemPrompt: string; // Converted from system_prompt
  model: string;
  temperature: number;
  maxTokens: number; // Converted from max_tokens
  starterQuestions: string[]; // Converted from starter_questions
  referenceMaterials?: string[]; // Converted from reference_materials
}
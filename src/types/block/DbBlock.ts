/**
 * Database layer type definitions for form blocks
 * Directly maps to the form_blocks table in the database
 * Uses snake_case naming to match database column names
 */

/**
 * Types of blocks in the database
 */
export type DbApiBlockType = 'static' | 'dynamic' | 'integration' | 'layout';

/**
 * Subtypes for static blocks in the database
 */
export type DbStaticBlockSubtype = 
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
 * Subtypes for dynamic blocks in the database
 */
export type DbDynamicBlockSubtype = 'ai_conversation';

/**
 * Subtypes for integration blocks in the database
 */
export type DbIntegrationBlockSubtype = 'hubspot';

/**
 * Subtypes for layout blocks in the database
 */
export type DbLayoutBlockSubtype = 'page_break' | 'redirect';

/**
 * Combined type of all block subtypes in the database
 */
export type DbBlockSubtype = 
  | DbStaticBlockSubtype 
  | DbDynamicBlockSubtype 
  | DbIntegrationBlockSubtype 
  | DbLayoutBlockSubtype;

/**
 * Database representation of a form block
 * Maps directly to the form_blocks table
 */
export interface DbBlock {
  id: string; // UUID, primary key
  form_id: string; // UUID, references forms.id
  type: DbApiBlockType; // 'static', 'dynamic', 'integration', 'layout'
  subtype: DbBlockSubtype; // Specific block type within the category
  title: string; // Display title
  description: string | null; // Optional description
  required: boolean; // Whether an answer is required
  order_index: number; // Position within the form
  settings: Record<string, unknown> | null; // JSONB column with block-specific settings
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

/**
 * Database representation of a dynamic block configuration
 * Maps directly to the dynamic_block_configs table in the database
 */
export interface DbDynamicBlockConfig {
  block_id: string; // UUID, references form_blocks.id
  starter_question: string;
  temperature: number; // Float
  max_questions: number;
  ai_instructions: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

/**
 * Database representation of a block option for choice-based blocks
 * Maps directly to the block_options table in the database
 */
export interface DbBlockOption {
  id: string; // UUID
  block_id: string; // UUID, references form_blocks.id
  value: string;
  label: string; // In the DB this is called label
  order_index: number;
  created_at: string; // ISO date string
}

/**
 * Type for block settings stored in the settings JSONB field
 * Different block types have different settings schemas
 */
export interface DbBlockSettings {
  [key: string]: unknown;
}

/**
 * Type for block choice options in multiple choice blocks
 * Typically stored in the settings.options field
 * This is NOT the DB table, but a structure within settings JSON
 */
export interface DbBlockOptionSetting {
  id: string;
  text: string;
  value: string;
  is_default?: boolean;
  order_index: number;
}

/**
 * Configuration for dynamic blocks like AI conversation
 * Typically stored in the settings.config field
 * This is NOT the DB table, but a structure within settings JSON
 */
export interface DbDynamicBlockConfigSetting {
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  starter_questions: string[];
  reference_materials?: string[];
}
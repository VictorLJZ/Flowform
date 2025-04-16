/**
 * PostgreSQL Utility Types
 * 
 * This file contains types related to PostgreSQL compatibility
 * and data transformation for database operations.
 */

import { BlockType, StaticBlockSubtype } from './supabase-types';

/**
 * Generic themes and settings interfaces to replace 'any' use
 */
export interface ThemeSettings {
  colorScheme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  borderRadius?: number;
  customCss?: string;
  [key: string]: unknown;
}

export interface FormSettings {
  allowAnonymousResponses?: boolean;
  collectEmailAddresses?: boolean;
  showProgressBar?: boolean;
  confirmationMessage?: string;
  redirectUrl?: string;
  closedMessage?: string;
  [key: string]: unknown;
}

/**
 * Form data that requires special PostgreSQL compatibility handling
 */
export interface PostgreSQLFormData {
  id?: string;
  title?: string;
  description?: string;
  workspace_id?: string;
  created_by?: string;
  status?: 'draft' | 'published' | 'archived';
  theme?: ThemeSettings;
  settings?: FormSettings;
  updated_at?: string;
  published_at?: string;
}

/**
 * Block-specific settings interface
 */
export interface BlockSettings {
  placeholder?: string;
  minValue?: number;
  maxValue?: number;
  defaultValue?: string | number | boolean;
  allowMultipleSelections?: boolean;
  includeOtherOption?: boolean;
  // For other block-specific settings
  [key: string]: unknown;
}

export interface PostgreSQLBlockData {
  id?: string;
  form_id?: string;
  type?: BlockType;
  subtype?: StaticBlockSubtype | 'dynamic';
  title?: string;
  description?: string | null;
  required?: boolean;
  order_index?: number;
  settings?: BlockSettings;
  dynamic_config?: {
    starter_question?: string;
    temperature?: number;
    max_questions?: number;
    ai_instructions?: string | null;
  };
}

/**
 * PostgreSQL error interface
 */
export interface PostgreSQLError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
  position?: number;
}

/**
 * PostgreSQL RPC function response type
 */
export interface PostgreSQLRPCResponse<T> {
  data: T | null;
  error: PostgreSQLError | null;
}

/**
 * Generic database entity with critical field handling
 */
export interface PostgreSQLEntity {
  id?: string;
  workspace_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

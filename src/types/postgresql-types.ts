/**
 * PostgreSQL Utility Types
 * 
 * This file contains types related to PostgreSQL compatibility
 * and data transformation for database operations.
 */

import { Form, BlockType, StaticBlockSubtype } from './supabase-types';

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
  theme?: Record<string, any>;
  settings?: Record<string, any>;
  updated_at?: string;
  published_at?: string;
}

/**
 * Block data that requires special PostgreSQL compatibility handling
 */
export interface PostgreSQLBlockData {
  id?: string;
  form_id?: string;
  type?: BlockType;
  subtype?: StaticBlockSubtype | 'dynamic';
  title?: string;
  description?: string | null;
  required?: boolean;
  order_index?: number;
  settings?: Record<string, any>;
  dynamic_config?: {
    starter_question?: string;
    temperature?: number;
    max_questions?: number;
    ai_instructions?: string | null;
  };
}

/**
 * PostgreSQL RPC function response type
 */
export interface PostgreSQLRPCResponse<T> {
  data: T | null;
  error: any;
}

/**
 * Generic database entity with critical field handling
 */
export interface PostgreSQLEntity {
  id?: string;
  workspace_id?: string;
  created_by?: string;
  title?: string;
  status?: string;
  [key: string]: any;
}

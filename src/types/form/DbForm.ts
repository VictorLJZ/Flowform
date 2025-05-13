/**
 * Database-level form types
 * 
 * These types directly reflect the database schema for the forms table.
 * They use snake_case naming to match database column names.
 * 
 * Use these types for:
 * - Database queries and mutations
 * - Direct interaction with Supabase
 * - Backend services that work with raw database data
 */

/**
 * Form status type
 */
export type DbFormStatus = 'draft' | 'published' | 'archived';

/**
 * Database forms table schema
 */
export interface DbForm {
  form_id: string; // UUID, primary key, auto-generated
  workspace_id: string; // UUID, references workspaces.id
  title: string;
  description: string | null;
  slug: string | null;
  status: DbFormStatus;
  theme: Record<string, unknown> | null; // JSONB
  settings: Record<string, unknown> | null; // JSONB
  created_at: string; // Timestamp with time zone
  created_by: string; // UUID, references auth.users.id
  updated_at: string; // Timestamp with time zone
  published_at: string | null; // Timestamp with time zone
}

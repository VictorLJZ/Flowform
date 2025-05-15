/**
 * Database layer type definitions for form block versions
 * Directly maps to the form_block_versions table in the database
 * Uses snake_case naming to match database column names
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DbBlockType, DbBlockSubtype } from './DbBlock';

/**
 * Database representation of a form block version
 * Maps directly to the form_block_versions table
 */
export interface DbBlockVersion {
  id: string; // UUID, primary key
  block_id: string; // UUID, references form_blocks.id
  form_version_id: string; // UUID, references form_versions.id
  title: string | null; // Display title
  description: string | null; // Optional description
  type: DbApiBlockType; // 'static', 'dynamic', 'integration', 'layout'
  subtype: DbBlockSubtype; // Specific block type within the category
  required: boolean | null; // Whether an answer is required
  order_index: number; // Position within the form version
  settings: Record<string, unknown> | null; // JSONB column with block-specific settings
  is_deleted: boolean | null; // Whether this block has been deleted in this version
  created_at: string | null; // ISO date string
}

/**
 * Simple representation of a block version for analytics and reporting
 * Often used when only basic metadata is needed
 */
export interface DbSimpleBlockVersion {
  id: string; // UUID of the block version
  block_id: string; // UUID of the original block
  title: string | null;
  type: DbApiBlockType;
  subtype: DbBlockSubtype;
}
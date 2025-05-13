/**
 * API to Database Form Transformations
 * 
 * This file provides utility functions for transforming form-related types
 * from API layer to Database (Db) layer:
 * - Converts camelCase API fields to snake_case DB fields
 * - Converts undefined values to null for optional fields
 * - Prepares data for database operations
 */

import { DbForm, DbFormStatus } from '@/types/form';
import { ApiFormInput, ApiFormUpdateInput, ApiFormStatus } from '@/types/form';

/**
 * Transform API form input to DB format for insertion
 * 
 * @param input - Form creation input
 * @returns Database-ready form object (without form_id and other auto-generated fields)
 */
export function formInputToDb(input: ApiFormInput): Omit<DbForm, 'form_id' | 'updated_at' | 'published_at'> {
  return {
    workspace_id: input.workspaceId,
    title: input.title,
    // Convert undefined to null for DB layer consistency
    description: input.description === undefined ? null : input.description,
    slug: input.slug === undefined ? null : input.slug,
    theme: input.theme === undefined ? null : input.theme,
    settings: input.settings === undefined ? null : input.settings,
    created_by: input.createdBy,
    created_at: new Date().toISOString(),
    status: 'draft' // Default status for new forms
  };
}

/**
 * Transform API form update input to DB format for updates
 * 
 * @param input - Form update input
 * @returns Partial database form object for update operations
 */
export function formUpdateInputToDb(input: ApiFormUpdateInput): Partial<DbForm> {
  const result: Partial<DbForm> = {};
  
  if (input.title !== undefined) result.title = input.title;
  if (input.description !== undefined) result.description = input.description === undefined ? null : input.description;
  if (input.slug !== undefined) result.slug = input.slug === undefined ? null : input.slug;
  if (input.status !== undefined) result.status = apiToDbFormStatus(input.status);
  if (input.theme !== undefined) result.theme = input.theme === undefined ? null : input.theme;
  if (input.settings !== undefined) result.settings = input.settings === undefined ? null : input.settings;
  if (input.publishedAt !== undefined) {
    result.published_at = input.publishedAt === undefined ? null : input.publishedAt;
    
    // If we're setting publishedAt and no explicit status change, update status to 'published'
    if (input.status === undefined && input.publishedAt !== null) {
      result.status = 'published';
    }
  }
  
  // Always update the updated_at timestamp
  result.updated_at = new Date().toISOString();
  
  return result;
}

/**
 * Transform API form status to DB format
 * 
 * @param status - API form status
 * @returns Database-formatted form status
 */
export function apiToDbFormStatus(status: ApiFormStatus): DbFormStatus {
  // Since ApiFormStatus is an alias for DbFormStatus, no transformation needed
  return status;
}

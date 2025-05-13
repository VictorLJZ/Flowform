/**
 * Database to API Form Transformations
 * 
 * This file provides utility functions for transforming form-related types
 * from Database (Db) layer to API layer:
 * - Converts snake_case DB fields to camelCase API fields
 * - Converts null values to undefined for optional fields
 */

import { DbForm, DbFormStatus } from '@/types/form';
import { ApiForm, ApiFormStatus } from '@/types/form';

/**
 * Transform a DB form object to API format
 * 
 * @param dbForm - Database form object
 * @returns API-formatted form object
 */
export function dbToApiForm(dbForm: DbForm): ApiForm {
  return {
    formId: dbForm.form_id,
    workspaceId: dbForm.workspace_id,
    title: dbForm.title,
    // Convert null to undefined for optional fields
    description: dbForm.description === null ? undefined : dbForm.description,
    slug: dbForm.slug === null ? undefined : dbForm.slug,
    status: dbForm.status,
    theme: dbForm.theme === null ? undefined : dbForm.theme,
    settings: dbForm.settings === null ? undefined : dbForm.settings,
    createdAt: dbForm.created_at,
    createdBy: dbForm.created_by,
    updatedAt: dbForm.updated_at,
    publishedAt: dbForm.published_at === null ? undefined : dbForm.published_at
  };
}

/**
 * Transform an array of DB forms to API format
 * 
 * @param dbForms - Array of database form objects
 * @returns Array of API-formatted form objects
 */
export function dbToApiForms(dbForms: DbForm[]): ApiForm[] {
  return dbForms.map(dbToApiForm);
}

/**
 * Transform DB form status to API format
 * 
 * @param status - DB form status
 * @returns API-formatted form status
 */
export function dbToApiFormStatus(status: DbFormStatus): ApiFormStatus {
  // Since ApiFormStatus is an alias for DbFormStatus, no transformation needed
  return status;
}

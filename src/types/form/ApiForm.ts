/**
 * API-level form types
 * 
 * These types represent the shape of form data as it flows through API requests and responses.
 * They use camelCase naming following JavaScript/TypeScript conventions.
 * 
 * Use these types for:
 * - API route handlers
 * - Request/response payloads
 * - Data transformation layer between database and UI
 */

import { DbFormStatus } from './DbForm';

/**
 * API form status type - reexporting from DB layer for consistency
 */
export type ApiFormStatus = DbFormStatus;

/**
 * Form object in API format with camelCase properties
 */
export interface ApiForm {
  formId: string;
  workspaceId: string;
  title: string;
  description?: string;
  slug?: string;
  status: ApiFormStatus;
  theme?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  publishedAt?: string;
}

/**
 * Input type for creating a new form (API layer with camelCase)
 */
export interface ApiFormInput {
  workspaceId: string;
  title: string;
  description?: string;
  slug?: string;
  theme?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  createdBy: string;
}

/**
 * Input type for updating an existing form (API layer with camelCase)
 */
export interface ApiFormUpdateInput {
  title?: string;
  description?: string;
  slug?: string;
  status?: ApiFormStatus;
  theme?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  publishedAt?: string;
}

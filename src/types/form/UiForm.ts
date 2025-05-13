/**
 * UI-level form types
 * 
 * These types represent form data as it's used in UI components.
 * They use camelCase naming and may include additional UI-specific properties.
 * 
 * Use these types for:
 * - React component props
 * - UI state management
 * - Display-specific data transformations
 * - Local UI-specific calculations and formatting
 */

import { ApiForm, ApiFormStatus } from './ApiForm';

/**
 * UI form type with enhanced display properties
 */
export interface UiForm extends ApiForm {
  // UI-specific computed properties
  formattedCreatedDate?: string; // Human-readable date
  formattedUpdatedDate?: string; // Human-readable date
  formattedPublishedDate?: string; // Human-readable date
  statusDisplay?: string; // Formatted status for display
  responseCount?: number; // Count of responses (if available)
  viewCount?: number; // Count of views (if available)
  isEditable?: boolean; // Whether current user can edit
  url?: string; // Public/shareable URL
  lastEdited?: string; // Human-readable "Last edited X time ago"
}

/**
 * UI form list item (condensed version for listings)
 */
export interface UiFormListItem {
  formId: string;
  title: string;
  description?: string;
  status: ApiFormStatus;
  createdAt: string;
  formattedCreatedDate?: string;
  responseCount?: number;
  viewCount?: number;
  statusDisplay?: string;
  workspaceId: string;
  lastEdited?: string;
}

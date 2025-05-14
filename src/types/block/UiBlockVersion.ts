/**
 * UI layer type definitions for form block versions
 * Extends API types with UI-specific properties
 * Used directly by React components
 */

import { ApiBlockVersion, ApiSimpleBlockVersion } from './ApiBlockVersion';

/**
 * UI representation of a form block version, extending the API representation
 * with additional UI-specific properties
 */
export interface UiBlockVersion extends ApiBlockVersion {
  // UI-specific properties
  formattedCreatedAt?: string;
  isDifferentFromPrevious?: boolean;
  changeDescription?: string;
  statusBadge?: 'new' | 'modified' | 'deleted' | 'unchanged';
}

/**
 * UI representation of a simple block version with display properties
 */
export interface UiSimpleBlockVersion extends ApiSimpleBlockVersion {
  displayType?: string; // Human-readable type (e.g., "Text Input" instead of "text_input")
  icon?: string;
  isCurrentlyActive?: boolean;
}
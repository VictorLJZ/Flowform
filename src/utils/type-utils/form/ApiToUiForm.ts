/**
 * API to UI Form Transformations
 * 
 * This file provides utility functions for transforming form-related types
 * from API layer to UI layer:
 * - Prepares data for display in UI components
 * - Adds UI-specific properties and formatting
 */

import { ApiForm, ApiFormStatus } from '@/types/form';
import { UiForm, UiFormListItem } from '@/types/form';

/**
 * Transform an API form to UI-specific format
 * 
 * @param form - API form object
 * @param options - Additional UI display options
 * @returns UI-formatted form with display properties
 */
export function apiToUiForm(
  form: ApiForm,
  options: {
    responseCount?: number;
    viewCount?: number;
    isEditable?: boolean;
  } = {}
): UiForm {
  return {
    ...form,
    // Format dates for display
    formattedCreatedDate: formatFormDate(form.createdAt),
    formattedUpdatedDate: formatFormDate(form.updatedAt),
    formattedPublishedDate: form.publishedAt ? formatFormDate(form.publishedAt) : undefined,
    
    // Add display-friendly status
    statusDisplay: getFormStatusDisplay(form.status),
    
    // Add metrics if provided
    responseCount: options.responseCount,
    viewCount: options.viewCount,
    
    // Add edit permission flag
    isEditable: options.isEditable ?? false,
    
    // Generate public URL
    url: form.slug ? `/f/${form.slug}` : `/form/${form.formId}`,
    
    // Format last edited time
    lastEdited: formatRelativeTime(form.updatedAt)
  };
}

/**
 * Transform an array of API forms to UI format
 * 
 * @param forms - Array of API form objects
 * @returns Array of UI-formatted forms
 */
export function apiToUiForms(forms: ApiForm[]): UiForm[] {
  return forms.map(form => apiToUiForm(form));
}

/**
 * Create a condensed form list item for UI display
 * 
 * @param form - API form object
 * @param options - Additional UI display options
 * @returns Condensed UI form list item
 */
export function apiToUiFormListItem(
  form: ApiForm,
  options: {
    responseCount?: number;
    viewCount?: number;
  } = {}
): UiFormListItem {
  return {
    formId: form.formId,
    title: form.title,
    description: form.description,
    status: form.status,
    createdAt: form.createdAt,
    formattedCreatedDate: formatFormDate(form.createdAt),
    responseCount: options.responseCount,
    viewCount: options.viewCount,
    statusDisplay: getFormStatusDisplay(form.status),
    workspaceId: form.workspaceId,
    lastEdited: formatRelativeTime(form.updatedAt)
  };
}

/**
 * Get a user-friendly status display string
 * 
 * @param status - Form status
 * @returns User-friendly status string
 */
export function getFormStatusDisplay(status: ApiFormStatus): string {
  const statusMap: Record<ApiFormStatus, string> = {
    'draft': 'Draft',
    'published': 'Published',
    'archived': 'Archived'
  };
  
  return statusMap[status] || status;
}

/**
 * Format a date for UI display
 * 
 * @param isoDate - ISO date string from the API
 * @returns Formatted date string for display
 */
export function formatFormDate(isoDate: string): string {
  const date = new Date(isoDate);
  
  // Format as Month Day, Year
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return formatter.format(date);
}

/**
 * Format a date as relative time for UI display
 * 
 * @param isoDate - ISO date string from the API
 * @returns Human-readable relative time
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  
  if (diffSeconds < 60) return 'just now';
  
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  // For older dates, return formatted date
  return formatFormDate(isoDate);
}

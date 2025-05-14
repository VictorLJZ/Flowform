/**
 * UI-level response types
 * 
 * These types represent response data as it's used in UI components.
 * They use camelCase naming and may include additional UI-specific properties.
 * 
 * Use these types for:
 * - React component props
 * - UI state management
 * - Display-specific data transformations
 * - Local UI-specific calculations and formatting
 */

import {
  ApiQAPair,
  ApiDynamicBlockResponse,
  ApiFormResponse,
  ApiResponseStatus,
  ApiStaticBlockAnswer
} from './ApiResponse';

/**
 * UI response status type with display-friendly status labels
 */
export interface UiResponseStatusInfo {
  status: ApiResponseStatus;
  label: string;
  color: string;
  icon?: string;
}

/**
 * UI form response with enhanced display properties
 */
export interface UiFormResponse extends ApiFormResponse {
  // UI-specific properties
  formattedStartDate?: string; // Human-readable date
  formattedCompletionDate?: string; // Human-readable date
  displayStatus?: UiResponseStatusInfo; // Status with display properties
  progress?: number; // Percentage of completion (0-100)
  displayDuration?: string; // Formatted time taken to complete
  isExpired?: boolean; // Calculated based on some expiry rules
}

/**
 * UI static block answer with enhanced display properties
 */
export interface UiStaticBlockAnswer extends ApiStaticBlockAnswer {
  // UI-specific properties
  formattedAnsweredDate?: string; // Human-readable date
  displayValue?: string; // Formatted answer value
  isValid?: boolean; // Validation state
  validationMessage?: string; // Error message if invalid
}

/**
 * UI dynamic block response with enhanced display properties
 */
export interface UiDynamicBlockResponse extends ApiDynamicBlockResponse {
  // UI-specific properties
  formattedStartDate?: string; // Human-readable date
  formattedCompletionDate?: string; // Human-readable date
  // Using ApiQAPair directly since we're removing UiQAPair
  conversation: ApiQAPair[];
  displayProgress?: string; // Text representation of progress
  remainingQuestions?: number; // Count of remaining questions
  isComplete?: boolean; // Whether the conversation is complete
}

// UiQAPair removed - using ApiQAPair directly for UI components

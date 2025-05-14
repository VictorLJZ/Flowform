/**
 * API to UI Response Transformations
 * 
 * This file provides utility functions for transforming response-related types
 * from API layer to UI layer:
 * - Maintains camelCase naming
 * - Adds UI-specific computed properties
 * - Formats dates and other display values
 */

import { formatFormDate } from '@/utils/type-utils/form/ApiToUiForm';

import { 
  ApiDynamicBlockResponse,
  ApiFormResponse,
  ApiResponseStatus,
  ApiStaticBlockAnswer
} from '@/types/response';

import { 
  UiDynamicBlockResponse,
  UiFormResponse,
  UiResponseStatusInfo,
  UiStaticBlockAnswer
} from '@/types/response';

/**
 * Get UI display info for a response status
 * 
 * @param status - API response status
 * @returns UI status display information
 */
export function getResponseStatusInfo(status: ApiResponseStatus): UiResponseStatusInfo {
  switch (status) {
    case 'in_progress':
      return {
        status,
        label: 'In Progress',
        color: 'amber',
        icon: 'clock'
      };
    case 'completed':
      return {
        status,
        label: 'Completed',
        color: 'green',
        icon: 'check-circle'
      };
    case 'abandoned':
      return {
        status,
        label: 'Abandoned',
        color: 'gray',
        icon: 'x-circle'
      };
    default:
      // Handle unknown status values more safely
      const statusStr = String(status);
      return {
        status: status as ApiResponseStatus,
        label: statusStr.charAt(0).toUpperCase() + statusStr.slice(1).replace(/_/g, ' '),
        color: 'gray'
      };
  }
}

/**
 * Calculate response progress percentage based on status and completion data
 * 
 * @param response - API form response
 * @returns Completion percentage (0-100)
 */
function calculateResponseProgress(response: ApiFormResponse): number {
  if (response.status === 'completed') {
    return 100;
  } else if (response.status === 'abandoned') {
    return 0;
  } else {
    // For in-progress responses, a more complex calculation would be needed here
    // This is a simplified example that could be enhanced with block completion data
    return 50;
  }
}

/**
 * Calculate if a response is expired based on start time and configured expiry
 * 
 * @param response - API form response
 * @param expiryHours - Hours after which a response is considered expired (default: 24)
 * @returns Whether the response is expired
 */
function isResponseExpired(response: ApiFormResponse, expiryHours = 24): boolean {
  if (response.status === 'completed') {
    return false;
  }
  
  const startDate = new Date(response.startedAt);
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours > expiryHours;
}

/**
 * Transform an API form response to UI format with enhanced display properties
 * 
 * @param apiResponse - API form response object
 * @returns UI-formatted form response object with display enhancements
 */
export function apiToUiFormResponse(apiResponse: ApiFormResponse): UiFormResponse {
  const startDate = new Date(apiResponse.startedAt);
  const completionDate = apiResponse.completedAt ? new Date(apiResponse.completedAt) : undefined;
  
  // Calculate duration if we have both dates
  let displayDuration: string | undefined;
  if (completionDate) {
    const durationMs = completionDate.getTime() - startDate.getTime();
    // Format duration in a user-friendly way
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      displayDuration = `${hours}h ${minutes % 60}m`;
    } else {
      displayDuration = `${minutes}m ${seconds % 60}s`;
    }
  }
  
  return {
    // Pass through all API properties
    ...apiResponse,
    
    // Add UI-specific properties
    formattedStartDate: formatFormDate(startDate.toISOString()),
    formattedCompletionDate: completionDate ? formatFormDate(completionDate.toISOString()) : undefined,
    displayStatus: getResponseStatusInfo(apiResponse.status),
    progress: calculateResponseProgress(apiResponse),
    displayDuration,
    isExpired: isResponseExpired(apiResponse)
  };
}

/**
 * Transform an array of API form responses to UI format
 * 
 * @param apiResponses - Array of API form response objects
 * @returns Array of UI-formatted form response objects
 */
export function apiToUiFormResponses(apiResponses: ApiFormResponse[]): UiFormResponse[] {
  return apiResponses.map(apiToUiFormResponse);
}

/**
 * Transform an API static block answer to UI format with enhanced display properties
 * 
 * @param apiAnswer - API static block answer object
 * @returns UI-formatted static block answer with display enhancements
 */
export function apiToUiStaticBlockAnswer(apiAnswer: ApiStaticBlockAnswer): UiStaticBlockAnswer {
  const answeredDate = new Date(apiAnswer.answeredAt);
  
  // For displayValue, we might want to do additional formatting based on answer type
  // This is a simplified example
  const displayValue = apiAnswer.answer;
  
  // Additional validation logic could be implemented here
  const isValid = !!apiAnswer.answer; // Simple validation example
  
  return {
    // Pass through all API properties
    ...apiAnswer,
    
    // Add UI-specific properties
    formattedAnsweredDate: formatFormDate(answeredDate.toISOString()),
    displayValue,
    isValid,
    validationMessage: isValid ? undefined : 'Answer is required'
  };
}

/**
 * Transform an array of API static block answers to UI format
 * 
 * @param apiAnswers - Array of API static block answer objects
 * @returns Array of UI-formatted static block answers
 */
export function apiToUiStaticBlockAnswers(apiAnswers: ApiStaticBlockAnswer[]): UiStaticBlockAnswer[] {
  return apiAnswers.map(apiToUiStaticBlockAnswer);
}

// UiQAPair transformation removed - using ApiQAPair directly

// UiQAPairs transformation removed - using ApiQAPair directly

/**
 * Transform an API dynamic block response to UI format with enhanced display properties
 * 
 * @param apiDynamicResponse - API dynamic block response object
 * @returns UI-formatted dynamic block response with display enhancements
 */
export function apiToUiDynamicBlockResponse(apiDynamicResponse: ApiDynamicBlockResponse): UiDynamicBlockResponse {
  const startDate = new Date(apiDynamicResponse.startedAt);
  const completionDate = apiDynamicResponse.completedAt ? new Date(apiDynamicResponse.completedAt) : undefined;
  
  // Assuming a typical dynamic conversation has a target number of exchanges
  const maxQuestions = 5; // This would typically come from block configuration
  const isComplete = !!apiDynamicResponse.completedAt;
  const questionCount = apiDynamicResponse.conversation.filter(m => m.type === 'question').length;
  const remainingQuestions = Math.max(0, maxQuestions - questionCount);
  
  return {
    // Pass through all API properties
    ...apiDynamicResponse,
    
    // Add UI-specific properties
    formattedStartDate: formatFormDate(startDate.toISOString()),
    formattedCompletionDate: completionDate ? formatFormDate(completionDate.toISOString()) : undefined,
    // Using conversation directly instead of conversationUi
    conversation: apiDynamicResponse.conversation,
    displayProgress: `${questionCount}/${maxQuestions} questions`,
    remainingQuestions,
    isComplete
  };
}

/**
 * Transform an array of API dynamic block responses to UI format
 * 
 * @param apiDynamicResponses - Array of API dynamic block response objects
 * @returns Array of UI-formatted dynamic block responses
 */
export function apiToUiDynamicBlockResponses(
  apiDynamicResponses: ApiDynamicBlockResponse[]
): UiDynamicBlockResponse[] {
  return apiDynamicResponses.map(apiToUiDynamicBlockResponse);
}

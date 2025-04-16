/**
 * API Types for FlowForm
 * 
 * This file contains type definitions for API requests and responses
 * to improve type safety across API routes.
 */

// Error types are defined inline for API responses

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
  };
  status: number;
}

/**
 * Error response helper
 */
export function createErrorResponse(message: string, status = 400, code?: string): ApiResponse<void> {
  return {
    error: {
      message,
      code,
      status
    },
    status
  };
}

/**
 * Success response helper
 */
export function createSuccessResponse<T>(data: T, status = 200): ApiResponse<T> {
  return {
    data,
    status
  };
}

/**
 * Common workspace request types
 */
export interface WorkspaceRequest {
  workspaceId: string;
  userId?: string;
}

/**
 * Common form request types
 */
export interface FormRequest {
  formId: string;
  workspaceId?: string;
  userId?: string;
}

/**
 * Analytics request types
 */
export interface AnalyticsRequest {
  formId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * Response types
 */
export interface ResponseRequest {
  responseId: string;
  formId?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

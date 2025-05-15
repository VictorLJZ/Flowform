/**
 * API response structure for analytics endpoints
 * 
 * Generic wrapper type for API responses with standardized structure
 */

/**
 * Analytics API response wrapper
 * @template T - The data type for the response
 */
export interface AnalyticsApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
}

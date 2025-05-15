/**
 * Types for analytics data and API responses
 * Following the three-layer type system architecture
 */

/**
 * Form insights data structure
 * Contains analytics metrics for a form
 */
export interface FormInsights {
  // Form metrics
  total_views: number;
  total_completions: number;
  completion_rate: number;
  
  // Time metrics
  average_completion_time: number; // in seconds
  average_time_per_question: number; // in seconds
  
  // Abandonment metrics
  abandonment_rate: number;
  top_abandonment_blocks: Array<{
    block_id: string;
    block_title: string;
    abandonment_count: number;
    abandonment_percentage: number;
  }>;
  
  // Trend data
  daily_submissions: Array<{
    date: string;
    count: number;
  }>;
  
  // Last updated timestamp
  last_updated: string;
}

/**
 * API response structure for analytics endpoints
 * @template T - The data type for the response
 */
export interface AnalyticsApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
}

/**
 * Database layer types for form metrics
 * 
 * Represents the form-related metrics tables in the database
 * Properties use snake_case following database conventions
 */

/**
 * Form metrics aggregate table
 */
export interface DbFormMetrics {
  form_id: string;
  total_views: number;
  unique_views: number;
  total_starts: number;
  total_completions: number;
  completion_rate: number | null;
  average_completion_time_seconds: number | null;
  bounce_rate: number | null;
  last_updated: string;
}

/**
 * Form interaction events table
 */
export interface DbFormInteraction {
  id: string;
  response_id: string | null;
  block_id: string | null;
  form_id: string | null;
  interaction_type: string;
  timestamp: string;
  duration_ms: number | null;
  metadata: Record<string, unknown> | null;
}

/**
 * Form views tracking table
 */
export interface DbFormView {
  id: string;
  form_id: string;
  visitor_id: string;
  source: string | null;
  device_type: string | null;
  browser: string | null;
  timestamp: string;
  is_unique: boolean;
}
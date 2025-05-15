/**
 * Database layer types for block-related analytics
 * 
 * Consolidated file containing all block-related database types
 * All properties use snake_case following database conventions
 */

/**
 * Represents a block in the database
 */
export interface DbBlock {
  id: string;
  title: string;
  description: string;
  block_type_id: string;
}

/**
 * Represents the block_metrics table in the database
 */
export interface DbBlockMetrics {
  id: string;
  block_id: string;
  form_id: string;
  views: number;
  skips: number;
  average_time_seconds: number | null;
  drop_off_count: number;
  drop_off_rate: number | null;
  last_updated: string;
  submissions: number;
}

/**
 * Represents block metrics data with additional analytics fields
 */
export interface DbBlockMetricsData {
  id: string;
  block_id: string;
  form_id: string;
  blocks?: DbBlock; // This is a single block, not an array
  views_count: number;
  unique_views_count: number;
  avg_time_spent: number;
  interaction_count: number;
  completion_rate: number;
}

/**
 * Represents analytics for dynamic (AI-generated) blocks
 */
export interface DbDynamicBlockAnalytics {
  id: string; // UUID
  dynamic_response_id: string; // UUID, references dynamic_block_responses.id
  block_id: string; // UUID, references form_blocks.id
  question_index: number;
  question_text: string;
  time_to_answer_seconds: number | null;
  answer_length: number | null;
  sentiment_score: number | null; // Float
  topics: { topic: string; confidence: number; relevance?: number }[] | null; // JSONB
}

/**
 * Block performance analytics data
 * Used in the getBlockPerformance service
 */
export interface DbBlockPerformance {
  block_id: string;
  form_id: string;
  block_type: string;
  block_subtype: string;
  completion_rate: number;
  average_time_spent: number;
  skip_rate: number;
  metrics: DbBlockMetrics | null;
}
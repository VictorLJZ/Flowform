// src/types/block-metrics-types.ts
// Type definitions for block metrics data

/**
 * Block in the database
 */
export type BlockData = {
  id: string;
  title: string;
  description: string;
  block_type_id: string;
};

/**
 * Block metrics data as returned from the database
 */
export type BlockMetricsData = {
  id: string;
  block_id: string;
  form_id: string;
  blocks?: BlockData; // This is a single block, not an array
  views_count: number;
  unique_views_count: number;
  avg_time_spent: number;
  interaction_count: number;
  completion_rate: number;
};

/**
 * Formatted block metrics for client consumption
 */
export type FormattedBlockMetrics = {
  id: string;
  title: string;
  blockTypeId: string;
  count: number;
  uniqueViews: number;
  avgTimeSpent: number;
  interactionCount: number;
  completionRate: number;
};

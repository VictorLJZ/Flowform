// src/types/analytics-types.ts
// Centralized type definitions for analytics functionality

import { BlockMetrics, FormMetrics } from '@/types/supabase-types';

/**
 * Block performance analytics data
 */
export type BlockPerformance = {
  block_id: string;
  form_id: string;
  block_type: string;
  block_subtype: string | null;
  completion_rate: number;
  average_time_spent: number;
  skip_rate: number;
  metrics: BlockMetrics | null;
};

/**
 * Form analytics data
 */
export type Analytics = {
  form_id: string;
  total_views: number;
  total_completions: number;
  completion_rate: number;
  average_time_spent: number;
  metrics: FormMetrics | null;
  views_over_time: { date: string; count: number }[];
};

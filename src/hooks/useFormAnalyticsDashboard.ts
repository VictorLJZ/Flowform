import useSWR from 'swr';
import { getFormAnalyticsSummary } from '@/services/analytics/getFormAnalyticsSummary';
import { useState } from 'react';
import type { FormMetrics } from '@/types/supabase-types';

// Minimal types for dashboard data - focusing only on base metrics to start
export type BaseAnalyticsDashboardData = {
  metrics: FormMetrics | null;
  isLoading: boolean;
  error: string | null;
};

// Keep old type exports for backward compatibility
export type DeviceMetrics = { device_type: string; count: number; percentage: number; };
export type SourceMetrics = { source: string; count: number; percentage: number; };
export type TimeSeriesPoint = { date: string; value: number; };
export type BlockPerformance = { block_id: string; title: string; avg_time_seconds: number; error_count: number; abandonment_count: number; };
export type BlockStats = { id: string; title: string; count: number; };
export type BasicInsight = { id: string; title: string; description: string; };

// Date range filter types
export type DateRangeFilter = 'last7days' | 'last30days' | 'last3months' | 'alltime' | 'custom';

/**
 * Simplified hook for fetching just the base form analytics metrics
 * 
 * @param formId - ID of the form to fetch analytics for
 * @returns Object containing basic analytics data and loading state
 */
export function useFormAnalyticsDashboard(formId: string | undefined) {
  // Create a simple cache key based on form ID
  const cacheKey = formId ? `analytics-base-metrics:${formId}` : null;
  
  // Simplified fetcher that only gets the base metrics
  const fetcher = async (key: string): Promise<FormMetrics> => {
    if (!formId) throw new Error('Form ID is required');
    
    console.log('Analytics Dashboard: Fetching base metrics for:', formId);
    
    // Get the form ID from the cache key
    const id = key.split(':')[1];
    
    // Fetch only the base metrics
    const metrics = await getFormAnalyticsSummary(id);
    if (!metrics) {
      throw new Error('Failed to fetch base metrics');
    }
    
    console.log('Analytics Dashboard: Successfully fetched base metrics');
    return metrics;
  };
  
  // Use SWR to fetch the data with minimal configuration
  const { data, error, isLoading } = useSWR<FormMetrics>(
    cacheKey,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Deduplicate requests within 1 minute
      errorRetryCount: 3, // Limit retries to prevent infinite loops
    }
  );
  
  // Return a simplified result
  return {
    metrics: data || null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  };
}

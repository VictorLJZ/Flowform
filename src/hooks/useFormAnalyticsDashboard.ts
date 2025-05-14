import useSWR from 'swr';
import { ApiFormMetrics, UiFormMetrics } from '@/types/analytics';
import { apiToUiFormMetrics } from '@/utils/type-utils/analytics';

// API response fetcher for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
};

// Date range filter types
export type DateRangeFilter = 'last7days' | 'last30days' | 'last3months' | 'alltime' | 'custom';

// Analytics summary data interface
export interface FormAnalyticsSummary {
  formId: string;
  views: number;
  uniqueViews: number;
  completions: number;
  submissionRate: number;
  bounceRate: number;
  avgTimeToComplete: number;
}

// Enhanced block statistics interface
export interface EnhancedBlockStats {
  id: string;
  title: string;
  blockTypeId: string;
  count: number;
  uniqueViews: number;
  avgTimeSpent: number;
  interactionCount: number;
  completionRate: number;
}

// Legacy types kept for backward compatibility
export type DeviceMetrics = { device_type: string; count: number; percentage: number; };
export type SourceMetrics = { source: string; count: number; percentage: number; };
export type TimeSeriesPoint = { date: string; value: number; };
export type BlockPerformance = { block_id: string; title: string; avg_time_seconds: number; error_count: number; abandonment_count: number; };
export type BlockStats = { id: string; title: string; count: number; };
export type BasicInsight = { id: string; title: string; description: string; };
export type BaseAnalyticsDashboardData = {
  metrics: ApiFormMetrics | null;
  uiMetrics: UiFormMetrics | null;
  isLoading: boolean;
  error: string | null;
};

/**
 * Hook to fetch analytics summary and block metrics for a form
 * 
 * @param formId - ID of the form to fetch analytics for (or null if none)
 * @returns Object containing analytics data, block metrics, and loading states
 */
export function useFormAnalyticsDashboard(formId: string | null) {
  // Fetch form analytics summary
  const { 
    data: analyticsData, 
    error: analyticsError, 
    isLoading: analyticsLoading 
  } = useSWR<{ success: boolean; data: FormAnalyticsSummary }>(
    formId ? `/api/analytics/summary/${formId}` : null, 
    fetcher
  );

  // Fetch block metrics
  const { 
    data: blockMetricsData, 
    error: blockMetricsError, 
    isLoading: blockMetricsLoading 
  } = useSWR<{ success: boolean; data: EnhancedBlockStats[] }>(
    formId ? `/api/analytics/block-metrics/${formId}` : null, 
    fetcher
  );

  // Return consolidated data with appropriate loading and error states
  return {
    // Form analytics summary
    analytics: analyticsData?.data,
    analyticsError,
    isAnalyticsLoading: analyticsLoading,
    
    // Block metrics
    blockStats: blockMetricsData?.data || [],
    blockStatsError: blockMetricsError,
    isBlockStatsLoading: blockMetricsLoading,
    
    // Combined loading state
    isLoading: analyticsLoading || blockMetricsLoading,
    
    // Combined error state
    hasError: !!analyticsError || !!blockMetricsError,
    
    // API layer metrics from the API response
    metrics: analyticsData?.data ? {
      formId: analyticsData.data.formId,
      totalViews: analyticsData.data.views,
      uniqueViews: analyticsData.data.uniqueViews,
      totalCompletions: analyticsData.data.completions,
      completionRate: analyticsData.data.submissionRate,
      bounceRate: analyticsData.data.bounceRate,
      averageCompletionTimeSeconds: analyticsData.data.avgTimeToComplete,
      totalStarts: analyticsData.data.views, // Estimate if not provided
      lastUpdated: new Date().toISOString()
    } : null,
    
    // UI layer metrics with formatted display values
    uiMetrics: analyticsData?.data ? apiToUiFormMetrics({
      formId: analyticsData.data.formId,
      totalViews: analyticsData.data.views,
      uniqueViews: analyticsData.data.uniqueViews,
      totalCompletions: analyticsData.data.completions,
      completionRate: analyticsData.data.submissionRate,
      bounceRate: analyticsData.data.bounceRate,
      averageCompletionTimeSeconds: analyticsData.data.avgTimeToComplete,
      totalStarts: analyticsData.data.views, // Estimate if not provided
      lastUpdated: new Date().toISOString()
    }) : null
  };
}

import useSWR from 'swr';
import type { FormInsights, AnalyticsApiResponse } from '@/types/analytics-types';

/**
 * Custom hook for fetching form insights data
 * 
 * Retrieves key analytics metrics for the form insights dashboard:
 * - Total views
 * - Total starts
 * - Total submissions
 * - Completion rate
 * - Average time to complete
 * 
 * @param formId - ID of the form to fetch insights for (or null if none)
 * @returns Object containing insights data, loading state, and error
 */
export function useFormInsights(formId: string | null) {
  // Define a typed fetcher for SWR
  const fetcher = async (url: string): Promise<AnalyticsApiResponse<FormInsights>> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  };

  // Create SWR key (null key prevents fetching)
  const key = formId ? `/api/analytics/insights/${formId}` : null;
  
  // Use SWR to fetch and cache the data
  const { data, error, isLoading, mutate } = useSWR<AnalyticsApiResponse<FormInsights>>(
    key,
    fetcher,
    {
      revalidateOnFocus: false, // Only revalidate on explicit user action or interval
      dedupingInterval: 30000, // Cache results for 30 seconds
      onError: (err) => {
        console.error('[useFormInsights] Error fetching insights:', err);
      }
    }
  );

  return {
    insights: data?.data,
    isLoading,
    error,
    mutate, // Expose mutate to allow manual refreshing
    
    // Derived metrics for convenience (with fallbacks)
    totalViews: data?.data?.totalViews ?? 0,
    totalStarts: data?.data?.totalStarts ?? 0,
    totalSubmissions: data?.data?.totalSubmissions ?? 0,
    completionRate: data?.data?.completionRate ?? 0,
    averageTimeToComplete: data?.data?.averageTimeToComplete ?? 0,
    formattedTime: data?.data ? formatTime(data.data.averageTimeToComplete) : '00:00',
    lastUpdated: data?.data?.lastUpdated ?? null
  };
}

/**
 * Format seconds into MM:SS format
 */
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  // Pad with leading zeros
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
  return `${formattedMinutes}:${formattedSeconds}`;
}

import useSWR from 'swr';
import { FormattedBlockMetrics } from '@/types';

/**
 * Custom hook for fetching and formatting question metrics
 * 
 * Retrieves metrics for each question/block in the form and calculates drop-off rates
 * 
 * @param formId - ID of the form to fetch metrics for
 * @returns Object containing question metrics, loading state, and error
 */
export function useQuestionMetrics(formId: string | null) {
  // Define a typed fetcher for SWR
  const fetcher = async (url: string): Promise<{ success: boolean; data: FormattedBlockMetrics[] }> => {
    try {
      console.log('[useQuestionMetrics] Fetching from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        // Try to get more detailed error info
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Ignore json parsing error
        }
        console.error('[useQuestionMetrics] API error:', errorMessage);
        throw new Error(`API request failed: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('[useQuestionMetrics] Data received:', data);
      return data;
    } catch (error) {
      console.error('[useQuestionMetrics] Fetch error:', error);
      throw error;
    }
  };

  // Create SWR key (null key prevents fetching)
  const key = formId ? `/api/analytics/block-metrics/${formId}` : null;
  
  // Use SWR to fetch and cache the data
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: FormattedBlockMetrics[] }>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache results for 30 seconds
      onError: (err) => {
        console.error('[useQuestionMetrics] Error fetching metrics:', err);
      }
    }
  );

  // Process and sort metrics
  const processedMetrics = data?.data 
    ? data.data
        // Filter out layout blocks or other non-question blocks if needed
        .filter(block => block.blockTypeId !== 'layout')
        // Sort by views count (descending)
        .sort((a, b) => b.count - a.count)
        // Add calculated drop-off rates with formatted percentages
        .map(block => ({
          ...block,
          dropOffRate: calculateDropOffPercentage(block.count, block.uniqueViews),
          dropOffPercentage: formatPercentage(calculateDropOffPercentage(block.count, block.uniqueViews))
        }))
    : [];

  return {
    questions: processedMetrics,
    isLoading,
    error,
    mutate,
    refresh: () => mutate()
  };
}

/**
 * Calculate drop-off percentage based on views and unique views
 */
function calculateDropOffPercentage(viewCount: number, completionCount: number): number {
  if (viewCount === 0) return 0;
  // Calculate the percentage of people who dropped off (didn't complete)
  return Math.round(((viewCount - completionCount) / viewCount) * 100);
}

/**
 * Format percentage for display with sign
 */
function formatPercentage(value: number): string {
  if (value === 0) return '0%';
  return `-${value}%`;
}

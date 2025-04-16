import { BlockMetrics } from '@/types/supabase-types';

type BlockPerformance = {
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
 * Get performance analytics for a specific block or all blocks in a form - Client-side implementation
 * Uses the API route to fetch block performance data
 * 
 * @param formId - The ID of the form
 * @param blockId - Optional ID of a specific block to analyze
 * @param startDate - Optional start date for filtering (ISO string)
 * @param endDate - Optional end date for filtering (ISO string)
 * @returns Performance data for the block(s)
 */
export async function getBlockPerformanceClient(
  formId: string,
  blockId?: string,
  startDate?: string,
  endDate?: string
): Promise<BlockPerformance[]> {
  try {
    // Construct the query parameters
    const params = new URLSearchParams({ formId });
    if (blockId) params.append('blockId', blockId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    // Make the API request
    const response = await fetch(`/api/analytics/blocks?${params.toString()}`);
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    // Parse the response data
    const blockPerformance = await response.json();
    return blockPerformance;
  } catch (error) {
    console.error('Error getting block performance:', error);
    throw error;
  }
}

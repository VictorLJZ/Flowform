import { ApiFormMetrics } from '@/types/analytics';

/**
 * Get analytics data for a specific form - Client-side implementation
 * Uses the API route to fetch analytics data
 * 
 * @param formId - The ID of the form
 * @param startDate - Optional start date for filtering (ISO string)
 * @param endDate - Optional end date for filtering (ISO string)
 * @returns Analytics data for the form
 */
export async function getFormAnalyticsClient(
  formId: string,
  startDate?: string,
  endDate?: string
): Promise<ApiFormMetrics> {
  try {
    // Construct the query parameters
    const params = new URLSearchParams({ formId });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    // Make the API request
    const response = await fetch(`/api/analytics/form?${params.toString()}`);
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    // Parse the response data
    const analytics = await response.json();
    return analytics;
  } catch (error) {
    console.error('Error getting form analytics:', error);
    throw error;
  }
}

import { ApiFormResponse, ApiStaticBlockAnswer, ApiDynamicBlockResponse } from '@/types/response';

/**
 * Get all responses for a specific form - Client-side implementation
 * Uses the API route to fetch form responses data
 * 
 * @param formId - The ID of the form
 * @param includeAnswers - Whether to include the detailed answers (defaults to false)
 * @param limit - Maximum number of responses to return
 * @param offset - Offset for pagination
 * @returns Array of form responses with optional answer details
 */
export async function getResponsesForFormClient(
  formId: string,
  includeAnswers: boolean = false,
  limit: number = 50,
  offset: number = 0
): Promise<{
  responses: ApiFormResponse[];
  static_answers?: Record<string, ApiStaticBlockAnswer[]>;
  dynamic_responses?: Record<string, ApiDynamicBlockResponse[]>;
  total: number;
}> {
  try {
    // Construct the query parameters
    const params = new URLSearchParams({
      formId,
      includeAnswers: includeAnswers.toString(),
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    // Make the API request
    const response = await fetch(`/api/responses?${params.toString()}`);
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    // Parse the response data
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error fetching form responses:', error);
    throw error;
  }
}

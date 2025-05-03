import { FormContextData } from '@/types/form-service-types';
import { getBaseUrl } from '@/lib/utils';

/**
 * Get the context of a form including all questions - CLIENT VERSION
 * Makes an API call to retrieve form context safely from the client side
 * 
 * @param formId - The ID of the form
 * @param currentBlockId - The ID of the current block (to exclude from context)
 * @param forceRefresh - Whether to force a cache refresh
 * @returns Form context data for AI processing
 */
export async function getFormContextClient(
  formId: string, 
  currentBlockId: string,
  forceRefresh = false
): Promise<FormContextData> {
  try {
    
    // Client-side implementation (browser)
    // Construct the query parameters
    const params = new URLSearchParams({
      formId,
      currentBlockId,
      forceRefresh: forceRefresh.toString()
    });
    
    // Get base URL - empty for browser, absolute URL for server
    const baseUrl = getBaseUrl();
    
    // Make the API request with proper URL construction
    const response = await fetch(`${baseUrl}/api/forms/context?${params.toString()}`);
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    // Parse the response data
    const formContext = await response.json();
    return formContext;
  } catch (error) {
    console.error('Error getting form context:', error);
    // Return a minimal placeholder context to avoid breaking the conversation flow
    return {
      formId,
      formTitle: 'Form',
      staticQuestions: [],
      dynamicBlocks: []
    };
  }
}

/**
 * Format the form context into a prompt-friendly string
 * Client-side version to ensure consistent formatting
 */
export function formatFormContextClient(context: FormContextData): string {
  let prompt = `This question is part of a form titled "${context.formTitle}" which contains the following questions:\n\n`;
  
  // Add static questions
  if (context.staticQuestions.length > 0) {
    prompt += "Static Questions:\n";
    context.staticQuestions.forEach((q, i) => {
      prompt += `${i+1}. ${q.title}${q.description ? ` - ${q.description}` : ''} (Type: ${q.subtype})\n`;
    });
    prompt += "\n";
  }
  
  // Add other dynamic blocks
  if (context.dynamicBlocks.length > 0) {
    prompt += "Other Dynamic Conversation Blocks:\n";
    context.dynamicBlocks.forEach((b, i) => {
      prompt += `${i+1}. Block: ${b.title}\n   Starter Question: "${b.starter_question}"\n`;
    });
  }
  
  return prompt;
}

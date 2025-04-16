import { FormContextData } from './getFormContext';

/**
 * Get the context of a form including all questions - Client-side implementation
 * Uses the API route to fetch form context data
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
    // Construct the query parameters
    const params = new URLSearchParams({
      formId,
      currentBlockId,
      forceRefresh: forceRefresh.toString()
    });
    
    // Make the API request
    const response = await fetch(`/api/forms/context?${params.toString()}`);
    
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
    throw error;
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

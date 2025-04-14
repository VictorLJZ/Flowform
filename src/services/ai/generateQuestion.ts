import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a question using the OpenAI Responses API
 * 
 * @param conversation - The conversation history in Responses API format
 * @param instructions - Instructions for the AI
 * @param temperature - Controls randomness (0.0-1.0)
 * @param previousResponseId - Optional previous response ID for conversation continuity
 * @returns Success status and generated question or error
 */
export async function generateQuestion(
  conversation: { role: string; content: string }[], 
  instructions: string,
  temperature: number = 0.7,
  previousResponseId?: string
) {
  try {
    // Using the Responses API that replaced Chat Completions API on March 11th, 2025
    const requestParams: any = {
      model: "gpt-4o-mini", // Using GPT-4o-mini as specified in project requirements
      input: conversation, 
      temperature,
      store: true // Enable state management
    };

    // Add previous response ID if provided for conversation continuity
    if (previousResponseId) {
      requestParams.previous_response_id = previousResponseId;
    }

    const response = await openai.responses.create(requestParams);

    // Access text using output_text helper property as per Responses API documentation
    return { 
      success: true, 
      data: response.output_text,
      responseId: response.id // Save for potential continuation
    };
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

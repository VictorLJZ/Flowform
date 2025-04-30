import OpenAI from "openai";
import { GenerateQuestionResponse, OpenAIMessage } from '@/types/ai-types';

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a question using the OpenAI Responses API
 * 
 * @param conversation Array of conversation messages
 * @param instructions System instructions for the AI
 * @param temperature Controls randomness (0-1)
 * @param previousResponseId Optional previous response ID for conversation continuity
 * @returns Success status and generated question or error
 */
export async function generateQuestion(
  conversation: OpenAIMessage[],
  instructions: string,
  temperature: number = 0.7,
  previousResponseId?: string
): Promise<GenerateQuestionResponse> {
  try {
    // Type safety check for conversation array
    if (!Array.isArray(conversation) || conversation.length === 0) {
      throw new Error("Invalid conversation format provided");
    }
    
    // Using the Responses API that replaced Chat Completions API on March 11th, 2025
    // Use a type that allows adding properties dynamically
    const requestParams: Record<string, unknown> = {
      model: "gpt-4o-mini", // Using GPT-4o-mini as specified in project requirements
      input: conversation, 
      temperature,
      store: true // Enable state management
    };

    // Add previous response ID if provided for conversation continuity
    if (previousResponseId) {
      requestParams.previous_response_id = previousResponseId;
    }

    // Add a comment explaining why we need to use 'any' here
    // We're using 'any' because the OpenAI Responses API is new (March 2025) and proper TypeScript
    // definitions may not be fully available yet. This is a temporary solution until official types are updated.
    // @ts-expect-error - Using any for new OpenAI Responses API until proper types are available
    const response = await openai.responses.create(requestParams);

    // Access text using output_text helper property as per Responses API documentation
    return { 
      success: true, 
      data: typeof response.output_text === 'string' ? response.output_text : '',
      responseId: typeof response.id === 'string' ? response.id : undefined // Save for potential continuation
    };
  } catch (error: unknown) {
    console.error('Error generating AI response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

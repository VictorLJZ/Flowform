import OpenAI from "openai";

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Response type for generate question function
interface GenerateQuestionResponse {
  success: boolean;
  data?: string;
  error?: string;
  responseId?: string;
}

// Define types for OpenAI Responses API parameters
type OpenAIMessage = {
  role: string;
  content: string;
};

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

    // Use a type assertion to allow the API call to work
    const response = await openai.responses.create(requestParams as any);

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

import OpenAI from "openai";
import { GenerateQuestionResponse, OpenAIMessage } from '@/types/ai-types';

// Define interfaces for the new OpenAI Responses API (March 11th, 2025)
// These follow the format specified in the project requirements
interface ResponsesAPIInput {
  role: string;
  content: string;
}

interface ResponsesAPIOptions {
  model: string;
  input: ResponsesAPIInput[];
  temperature?: number;
  store?: boolean;
  previous_response_id?: string;
}

// Define interface for the OpenAI Responses API response format (March 11th, 2025)
// This matches the structure defined in Rule 6 from the project requirements
interface ResponsesAPIResponse {
  id: string;
  output_text: string;
  // Add other properties as needed
  [key: string]: unknown;
}

// Initialize OpenAI client with API key
// Using singleton pattern to ensure consistent configuration across imports
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openaiClient;
}

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
    
    // Get OpenAI client using our singleton pattern
    const openai = getOpenAIClient();
    
    // Log the OpenAI API key status (without revealing the actual key)
    console.log('OpenAI API key status:', {
      exists: !!process.env.OPENAI_API_KEY,
      length: process.env.OPENAI_API_KEY?.length || 0,
      prefix: process.env.OPENAI_API_KEY?.substring(0, 5) || 'missing'
    });
    
    // Prepare input for Responses API format (March 2025)
    // According to project requirements, we're using the new Responses API format
    // Rule 1: Response API Input Format - use 'input' instead of 'messages'
    // Rule 2: Message Role Transformation - 'developer' instead of 'system'
    const apiInput = conversation.map(msg => ({
      role: msg.role, 
      content: msg.content
    }));
    
    // Rule 7: Enable State Management if needed
    const requestOptions: ResponsesAPIOptions = {
      model: "gpt-4o-mini", // Using GPT-4o-mini as specified in project requirements
      input: apiInput.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature,
      store: true // Enable state management as per Rule 7
    };

    // Add previous response ID if provided for conversation continuity
    if (previousResponseId) {
      requestOptions.previous_response_id = previousResponseId;
    }
    
    // Log request parameters for debugging (without sensitive data)
    console.log('OpenAI Responses API requestOptions:', {
      model: requestOptions.model,
      inputLength: apiInput.length,
      temperature: requestOptions.temperature,
      hasResponseId: !!previousResponseId
    });

    try {
      // Using the OpenAI Responses API (released March 11th 2025)
      // Rule 6: Accessing Text Output - use response.output_text
      // Use type assertion with unknown as intermediate step to satisfy TypeScript
      // This is safer than using 'any' directly while still allowing us to work with the new API format
      type ResponseCreateParamsType = Parameters<typeof openai.responses.create>[0];
      const rawResponse = await openai.responses.create(requestOptions as unknown as ResponseCreateParamsType);
      
      // Cast the response to our custom type for the new Responses API format
      const response = rawResponse as unknown as ResponsesAPIResponse;
      
      // Log successful response structure
      console.log('OpenAI response received:', {
        hasResponse: !!response,
        hasOutputText: !!response.output_text,
        responseId: response.id,
        outputText: response.output_text
      });
      
      // Rule 6: Accessing Text Output - use output_text helper property
      return { 
        success: true, 
        data: response.output_text || '',
        responseId: response.id
      };
    } catch (error) {
      // Detailed logging for OpenAI specific errors
      console.error('OpenAI API Error:', error);
      
      const errorObj = error as Record<string, unknown>;
      console.error('OpenAI API Error Details:', {
        name: errorObj.name || 'Unknown',
        message: errorObj.message || 'No message',
        code: errorObj.status || errorObj.code || 'No code',
        type: errorObj.type || 'Unknown type'
      });
      
      throw error; // Re-throw to be caught by outer catch block
    }
  } catch (error: unknown) {
    console.error('Error generating AI response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

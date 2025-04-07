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
 * @returns Success status and generated question or error
 */
export async function generateQuestion(
  conversation: { role: string; content: string }[], 
  instructions: string,
  temperature: number = 0.7
) {
  try {
    // Using the Responses API that replaced Chat Completions API on March 11th, 2025
    // Type cast to any to bypass type checking since we know the format is correct
    const response = await (openai.responses.create as any)({
      model: "gpt-4o-mini", // Using GPT-4o-mini as specified in project requirements
      input: conversation, 
      temperature,
      store: true // Enable state management as per Responses API documentation
    });

    // Access text using output_text helper property as per Responses API documentation
    return { 
      success: true, 
      data: response.output_text 
    };
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

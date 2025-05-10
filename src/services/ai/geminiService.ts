import { GoogleGenerativeAI } from '@google/generative-ai';

// Define types to match Gemini's API
interface FunctionDeclaration {
  name: string;
  description?: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface GeminiChatParams {
  history: Array<{role: string, parts: Array<{text: string}>}>;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
  tools?: Array<{
    functionDeclarations: FunctionDeclaration[];
  }>;
}

// Initialize Google AI client
const googleApiKey = process.env.GEMINI_API_KEY;
// Specify proper type
let geminiModel: ReturnType<typeof GoogleGenerativeAI.prototype.getGenerativeModel> | null = null;

if (googleApiKey) {
  try {
    const googleAI = new GoogleGenerativeAI(googleApiKey);
    geminiModel = googleAI.getGenerativeModel({ 
      model: "gemini-2.5-pro-exp-03-25",
    });
    console.log('[Gemini] Model initialized successfully');
  } catch (error) {
    console.error('[Gemini] Error initializing client:', error);
  }
}

/**
 * Extract text from a Gemini response, handling various response formats
 */
export function extractResponseText(response: unknown): string {
  if (!response) {
    console.error('[Gemini] Empty response received');
    return "";
  }
  
  try {
    // Use type assertion for specific response properties
    const resp = response as Record<string, unknown>;
    
    // Case 1: Direct text property is a function (common in newer Gemini SDK)
    if (resp.text && typeof resp.text === 'function') {
      try {
        const text = resp.text();
        if (text && typeof text === 'string') {
          return text;
        }
      } catch (textFuncError) {
        console.error('[Gemini] Error calling text() function:', textFuncError);
      }
    }
    
    // Case 2: Response has nested structure with candidates (newer Gemini API)
    const nestedResp = resp.response as Record<string, unknown> | undefined;
    if (nestedResp?.candidates && Array.isArray(nestedResp.candidates) && nestedResp.candidates.length > 0) {
      const candidate = nestedResp.candidates[0] as Record<string, unknown>;
      const content = candidate.content as Record<string, unknown> | undefined;
      const parts = content?.parts as Array<Record<string, unknown>> | undefined;
      
      if (parts && parts.length > 0 && typeof parts[0].text === 'string') {
        return parts[0].text;
      }
    }
    
    // Case 3: Response has direct candidates array
    if (resp.candidates && Array.isArray(resp.candidates) && resp.candidates.length > 0) {
      const candidate = resp.candidates[0] as Record<string, unknown>;
      const content = candidate.content as Record<string, unknown> | undefined;
      const parts = content?.parts as Array<Record<string, unknown>> | undefined;
      
      if (parts && parts.length > 0 && typeof parts[0].text === 'string') {
        return parts[0].text;
      }
    }
    
    // Case 4: Response text is a direct string property
    if (resp.text && typeof resp.text === 'string') {
      return resp.text;
    }
    
    // Case 5: Parts array direct access
    if (resp.parts && Array.isArray(resp.parts) && resp.parts.length > 0) {
      const text = (resp.parts[0] as Record<string, unknown>).text;
      if (typeof text === 'string') {
        return text;
      }
    }
    
    console.error('[Gemini] Failed to extract text from response');
    return "";
  } catch (error) {
    console.error('[Gemini] Error extracting text from response:', error);
    return "";
  }
}

/**
 * Create a chat session with the Gemini model
 */
export function createGeminiChat(
  history: Array<{role: string, parts: Array<{text: string}>}>,
  functionDeclarations?: Array<FunctionDeclaration>
) {
  if (!geminiModel) {
    throw new Error('[Gemini] Model not initialized');
  }
  
  // Create proper parameters for the Gemini API
  const chatParams: GeminiChatParams = {
    history,
    generationConfig: { 
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024
    }
  };
  
  // Add tools if function declarations are provided
  if (functionDeclarations && functionDeclarations.length > 0) {
    chatParams.tools = [{
      functionDeclarations
    }];
  }
  
  // @ts-expect-error - Gemini API typing isn't always aligned with actual usage
  return geminiModel.startChat(chatParams);
}

/**
 * Check if a response contains a function call
 */
export function extractFunctionCall(response: unknown): { name: string, args: Record<string, unknown> } | null {
  if (!response) return null;
  
  try {
    // Cast to Record<string, unknown> for better type safety
    const resp = response as Record<string, unknown>;
    
    // Case 1: New nested structure in response.response.candidates[0].content.parts[0].functionCall
    const nestedResp = resp.response as Record<string, unknown> | undefined;
    if (nestedResp && nestedResp.candidates && Array.isArray(nestedResp.candidates) && nestedResp.candidates.length > 0) {
      const candidate = nestedResp.candidates[0] as Record<string, unknown>;
      const content = candidate.content as Record<string, unknown> | undefined;
      const parts = content?.parts as Array<Record<string, unknown>> | undefined;
      
      if (parts && parts.length > 0 && parts[0].functionCall) {
        const functionCall = parts[0].functionCall as Record<string, unknown>;
        return {
          name: functionCall.name as string,
          args: functionCall.args as Record<string, unknown> || {}
        };
      }
    }
    
    // Case 2: Direct functionCalls array property
    if (resp.functionCalls && Array.isArray(resp.functionCalls) && resp.functionCalls.length > 0) {
      const functionCall = resp.functionCalls[0] as Record<string, unknown>;
      return {
        name: functionCall.name as string,
        args: functionCall.args as Record<string, unknown> || {}
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Gemini] Error extracting function call:', error);
    return null;
  }
}

export { geminiModel }; 
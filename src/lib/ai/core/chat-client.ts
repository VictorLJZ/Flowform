import { 
  OpenAIResponsesOptions, 
  OpenAIResponse, 
  OpenAIResponsesEvent
} from '../../../types/openai';

// Import the centralized streaming utilities
import { 
  createReadableStreamFromSSE, 
  processStreamingEvents as processStreamEvents,
  handleStreamError 
} from '@/lib/utils/streaming-utils';

/**
 * Generate an AI response using OpenAI's Responses API via server-side API route
 */
export async function generateAIResponse(options: OpenAIResponsesOptions): Promise<OpenAIResponse> {
  try {
    // Use the server-side API route instead of direct OpenAI access
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model ?? "gpt-4o-mini",
        input: options.input,
        tools: options.tools,
        store: options.store,
        previous_response_id: options.previous_response_id
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      output_text: data.output_text,
      tool_calls: data.tool_calls || [],
      usage: {
        prompt_tokens: data.usage?.input_tokens || 0,
        completion_tokens: data.usage?.output_tokens || 0,
        total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      }
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

/**
 * Stream an AI response using OpenAI's Responses API via server-side API route
 */
export async function streamAIResponse(options: OpenAIResponsesOptions): Promise<ReadableStream<OpenAIResponsesEvent | string>> {
  try {
    console.log('[CHAT-CLIENT] Streaming AI response with options:', {
      model: options.model,
      inputLength: options.input.length,
      toolsCount: options.tools?.length || 0,
      toolNames: options.tools?.map(t => t.name) || [],
      store: options.store
    });
    
    // Log the complete payload being sent to the API for debugging purposes
    const payload = {
      model: options.model ?? "gpt-4o-mini",
      input: options.input,
      tools: options.tools,
      store: options.store,
      previous_response_id: options.previous_response_id
    };
    
    // Log just the tool definitions specifically for debugging
    if (options.tools && options.tools.length > 0) {
      console.log('[CHAT-CLIENT] Sending tools to OpenAI:', 
        options.tools.map(tool => ({
          name: tool.name,
          type: tool.type,
          parameters: tool.parameters ? Object.keys(tool.parameters) : [],
          required: tool.parameters?.required || []
        }))
      );
    }
    
    // Use the server-side API route for streaming
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText}`);
    }
    
    console.log('[CHAT-CLIENT] API stream connection established');
    
    // Get the SSE response and convert to our event format using the centralized utility
    return createReadableStreamFromSSE(response, '[CHAT-CLIENT]');
  } catch (error) {
    console.error('Error streaming AI response:', error);
    return handleStreamError(error, '[CHAT-CLIENT]');
  }
}

// Original function replaced by imported utility function

/**
 * Process streaming events from OpenAI's Responses API
 * Uses the centralized streaming utility function
 */
export function processStreamingEvents(
  stream: ReadableStream<OpenAIResponsesEvent>,
  callbacks: {
    onTextDelta?: (delta: string, index: number) => void,
    onToolCall?: (toolCall: any, index: number) => void,
    onComplete?: (response: Partial<OpenAIResponse>) => void,
    onError?: (error: any) => void
  }
): Promise<void> {
  return processStreamEvents(stream, callbacks, '[CHAT-CLIENT]');
}

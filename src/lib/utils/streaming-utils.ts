/**
 * OpenAI Responses API Streaming Utilities
 * 
 * This file provides unified streaming functionality for the OpenAI Responses API.
 * It handles:
 * - Creating readable streams from Server-Sent Events (SSE)
 * - Common streaming event processing
 * - Consistent error handling for streams
 * 
 * Used by:
 * - src/lib/ai/core/chat-client.ts (client-side streaming)
 * - src/app/api/openai/route.ts (server-side streaming)
 * 
 * Part of the refactoring effort to reduce redundancy and improve maintainability
 * of the chat implementation.
 */

// Import core types
import { OpenAIResponse as BaseOpenAIResponse } from '@/types/openai';

/**
 * Type definitions for OpenAI Responses API events
 */
/**
 * Enhanced OpenAIResponse type to include function calls
 */
export interface OpenAIResponse extends BaseOpenAIResponse {
  function_calls?: Record<number, FunctionCall>;
  output?: any[];  // Array of output items like function calls and text
}

/**
 * Function call type for the Responses API
 */
export interface FunctionCall {
  type: string;
  id: string;
  call_id: string;
  name: string;
  arguments: string;
  status?: string;
}

/**
 * Type definitions for OpenAI Responses API events
 */
export interface OpenAIResponsesEvent {
  type: string;
  delta?: string | any;
  output_index?: number;
  content_index?: number;
  item_id?: string;
  // For function call arguments completion
  arguments?: string;
  // For new item events
  item?: {
    type: string;
    id: string;
    call_id: string;
    name: string;
    arguments?: string;
    status?: string;
  };
  data?: {
    delta?: string | any;
    index?: number;
  };
  id?: string;
  index?: number;
}

/**
 * Interface for Server-Sent Events
 */
export interface SSEEvent {
  data: string;
}

/**
 * Type guard to check if a value is an OpenAI event object
 */
export function isOpenAIEvent(value: any): value is OpenAIResponsesEvent {
  return typeof value === 'object' && value !== null && typeof value.type === 'string';
}

/**
 * Create a ReadableStream from Server-Sent Events (SSE)
 * This is used by both client-side and server-side code to handle streaming
 */
export function createReadableStreamFromSSE(
  response: Response, 
  logPrefix: string = '[STREAM]'
): ReadableStream<OpenAIResponsesEvent | string> {
  console.log(`${logPrefix} Creating readable stream from SSE response`);
  let eventCount = 0;
  
  return new ReadableStream<OpenAIResponsesEvent | string>({
    async start(controller) {
      if (!response.body) {
        controller.error(new Error('Response body is null'));
        return;
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log(`${logPrefix} SSE stream complete`);
            controller.close();
            break;
          }
          
          // Decode the chunk and add it to the buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // Process complete events from the buffer
          const events = buffer.split('\n\n');
          buffer = events.pop() || ''; // Keep the last incomplete event
          
          for (const event of events) {
            if (event.startsWith('data: ')) {
              const data = event.slice(6); // Remove 'data: ' prefix
              
              // Check if it's the completion signal
              if (data === '[DONE]') {
                console.log(`${logPrefix} Received [DONE] event`);
                controller.close();
                return;
              }
              
              try {
                eventCount++;
                // Parse the event data
                const parsedEvent = JSON.parse(data);
                
                // Log the first event and then every 10th event
                if (eventCount === 1 || eventCount % 10 === 0) {
                  console.log(`${logPrefix} Processing stream event #${eventCount}:`, { type: parsedEvent.type });  
                }
                
                // Enqueue the parsed event as our expected type
                controller.enqueue(parsedEvent as OpenAIResponsesEvent);
              } catch (e) {
                console.error(`${logPrefix} Error parsing event:`, e, data);
              }
            }
          }
        }
      } catch (error) {
        console.error(`${logPrefix} Error processing SSE stream:`, error);
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
    
    cancel() {
      console.log(`${logPrefix} Stream cancelled by consumer`);
      // Nothing to cancel in an already established fetch stream
    }
  });
}

/**
 * Event callbacks for processing streaming events
 */
export interface StreamEventCallbacks {
  onTextDelta?: (delta: string, index: number) => void;
  onToolCall?: (toolCall: any, index: number) => void;
  onFunctionCall?: (functionName: string, args: any, callId: string, index: number) => void;
  onComplete?: (response: Partial<OpenAIResponse>) => void;
  onError?: (error: any) => void;
}

/**
 * Process streaming events from OpenAI's Responses API
 * Provides consistent event handling for both client and server code
 */
export function processStreamingEvents(
  stream: ReadableStream<OpenAIResponsesEvent | string>,
  callbacks: StreamEventCallbacks,
  logPrefix: string = '[STREAM]'
): Promise<void> {
  const reader = stream.getReader();
  const response: Partial<OpenAIResponse> = {
    output_text: '',
    tool_calls: [],
    function_calls: {}
  };
  
  // Counter for tracking events
  let eventCount = 0;

  return new Promise((resolve, reject) => {
    function processEvents() {
      reader.read().then(({ done, value }) => {
        if (done) {
          callbacks.onComplete?.(response);
          resolve();
          return;
        }

        try {
          // Always log the first event for debugging
          if (eventCount === 0) {
            console.log(`${logPrefix} First raw event:`, JSON.stringify(value));
          }
          
          // Log every 20th event type for monitoring progress
          if (eventCount % 20 === 0 && typeof value !== 'string') {
            console.log(`${logPrefix} Event #${eventCount} type:`, value.type);
          }
          
          // Always log tool-related events
          if (typeof value !== 'string' && value.type && value.type.includes('tool')) {
            console.log(`${logPrefix} TOOL EVENT #${eventCount}:`, JSON.stringify(value));
          }
          
          // Special handling for [DONE] event
          if (typeof value === 'string' && value === '[DONE]') {
            console.log(`${logPrefix} Received [DONE] event`);
            callbacks.onComplete?.(response);
            resolve();
            return;
          }

          // Increment event counter
          eventCount++;
          
          // Handle string events (not expected in normal flow)
          if (typeof value === 'string') {
            console.warn(`${logPrefix} Received unexpected string event`, value);
            processEvents();
            return;
          }
          
          // Process different event types with proper validation
          if (value.type === 'response.output_text.delta') {
            // Handle direct delta property (as seen in real events)
            if (value.delta !== undefined) {
              response.output_text += value.delta;
              callbacks.onTextDelta?.(value.delta, value.output_index || value.content_index || 0);
            }
            // Fall back to nested data structure if direct delta isn't available
            else if (value.data && value.data.delta !== undefined) {
              // Handle delta that might be a complex object or a string
              const deltaContent = typeof value.data.delta === 'string' 
                ? value.data.delta 
                : JSON.stringify(value.data.delta);
              
              response.output_text += deltaContent;
              callbacks.onTextDelta?.(deltaContent, value.data.index || 0);
            } 
            // Log warning if delta isn't found in either location
            else {
              console.warn(`${logPrefix} Missing delta in output_text.delta event`, value);
              processEvents(); // Continue processing other events
              return;
            }
          } 
          // Handle legacy tool_calls.delta events
          else if (value.type === 'response.tool_calls.delta') {
            console.log(`${logPrefix} Processing tool call delta event:`, JSON.stringify(value));
            
            // Get index from either direct property or nested data
            const index = value.output_index !== undefined ? value.output_index : 
                        (value.data?.index !== undefined ? value.data.index : 0);
            
            // Get delta from either direct property or nested data
            const delta = value.delta || value.data?.delta;
            
            console.log(`${logPrefix} Tool call delta:`, { index, delta: JSON.stringify(delta) });
            
            // Validate required properties
            if (!delta) {
              console.warn(`${logPrefix} Missing delta in tool_calls.delta event`, value);
              processEvents(); // Continue processing other events
              return;
            }
            
            // Initialize tool_calls array if needed
            if (!response.tool_calls) {
              response.tool_calls = [];
            }
            
            // Initialize this specific tool call if needed
            if (!response.tool_calls[index]) {
              response.tool_calls[index] = {
                type: 'function_call',
                call_id: '',
                name: '',
                args: {}
              };
            }
            
            // Safely update the tool call with the delta
            if (delta.call_id) {
              response.tool_calls[index].call_id = delta.call_id;
            }
            if (delta.name) {
              response.tool_calls[index].name = delta.name;
            }
            if (delta.args) {
              response.tool_calls[index].args = {
                ...response.tool_calls[index].args,
                ...delta.args
              };
            }
            
            callbacks.onToolCall?.(response.tool_calls[index], index);
          }
          // Handle response.output_item.added for new function call
          else if (value.type === 'response.output_item.added' && value.item?.type === 'function_call') {
            console.log(`${logPrefix} Function call initiated:`, JSON.stringify(value));
            
            const outputIndex = value.output_index || 0;
            const item = value.item;
            
            // Initialize the function call with empty arguments that will be filled by delta events
            if (!response.function_calls) {
              response.function_calls = {};
            }
            
            response.function_calls[outputIndex] = {
              ...item,
              arguments: item.arguments || ''
            };
            
            console.log(`${logPrefix} Function call added at index ${outputIndex}:`, 
              response.function_calls[outputIndex]);
          }
          // Handle function call argument deltas
          else if (value.type === 'response.function_call_arguments.delta') {
            console.log(`${logPrefix} Function call argument delta:`, JSON.stringify(value));
            
            const outputIndex = value.output_index || 0;
            const itemId = value.item_id;
            const delta = value.delta || '';
            
            // Add the delta to the appropriate function call
            if (response.function_calls && response.function_calls[outputIndex]) {
              response.function_calls[outputIndex].arguments += delta;
              console.log(`${logPrefix} Updated function call arguments:`, 
                { index: outputIndex, partial: response.function_calls[outputIndex].arguments });
            } else {
              console.warn(`${logPrefix} Received argument delta for unknown function call at index ${outputIndex}`);
            }
          }
          // Handle function call arguments complete
          else if (value.type === 'response.function_call_arguments.done') {
            console.log(`${logPrefix} Function call arguments complete:`, JSON.stringify(value));
            
            const outputIndex = value.output_index || 0;
            // Use explicit local variable name to avoid reserved word
            const funcArgs = value.arguments || '';
            
            // Verify we have a function call to update
            if (response.function_calls && response.function_calls[outputIndex]) {
              const functionCall = response.function_calls[outputIndex];
              
              // Update with final arguments
              functionCall.arguments = funcArgs;
              
              // Parse arguments and execute function
              try {
                const argsObject = JSON.parse(funcArgs);
                console.log(`${logPrefix} Executing function ${functionCall.name} with args:`, argsObject);
                
                // Call the function execution callback
                callbacks.onFunctionCall?.(functionCall.name, argsObject, functionCall.call_id, outputIndex);
              } catch (error) {
                console.error(`${logPrefix} Error parsing function arguments:`, error);
              }
            }
          }
          // Handle function call completion
          else if (value.type === 'response.output_item.done' && value.item?.type === 'function_call') {
            console.log(`${logPrefix} Function call completed:`, JSON.stringify(value));
            
            const outputIndex = value.output_index || 0;
            
            // Update our internal representation with the final state
            if (response.function_calls && response.function_calls[outputIndex]) {
              response.function_calls[outputIndex] = {
                ...response.function_calls[outputIndex],
                ...value.item,
                status: 'completed'
              };
            }
          }
          else if (value.type === 'response.id') {
            // Safely assign from either direct property or nested data
            if (value.id !== undefined) {
              response.id = value.id;
              console.log(`${logPrefix} Response ID set:`, value.id);
            } else if (value.data !== undefined) {
              // Handle data that could be string or complex object
              const idValue = typeof value.data === 'string' 
                ? value.data 
                : JSON.stringify(value.data);
              
              response.id = idValue;
              console.log(`${logPrefix} Response ID set from data:`, idValue);
            }
          }
          // Handle content.delta events (alternative format for text deltas)
          else if (value.type === 'response.content.delta') {
            // Handle direct delta property
            if (value.delta !== undefined) {
              response.output_text += value.delta;
              callbacks.onTextDelta?.(value.delta, value.index || 0);
            }
            // Fall back to nested data structure
            else if (value.data && value.data.delta !== undefined) {
              response.output_text += value.data.delta;
              callbacks.onTextDelta?.(value.data.delta, value.data.index || 0);
            }
            // Log warning if delta isn't found in either location
            else {
              console.warn(`${logPrefix} Missing delta in content.delta event`, value);
              processEvents(); // Continue processing other events
              return;
            }
          }
          
          // Log unknown event types to help with debugging
          else if (typeof value !== 'string' && value.type && ![
            'response.output_text.delta', 
            'response.tool_calls.delta',
            'response.id',
            'response.content.delta',
            'response.output_item.added',
            'response.function_call_arguments.delta',
            'response.function_call_arguments.done',
            'response.output_item.done',
            'response.created',
            'response.in_progress',
            'response.completed'
          ].includes(value.type)) {
            console.log(`${logPrefix} Unknown event type:`, value.type, JSON.stringify(value));
          }
          
          // Continue processing events
          processEvents();
        } catch (error) {
          console.error(`${logPrefix} Error processing event:`, error);
          console.error(`${logPrefix} Problem event:`, JSON.stringify(value));
          callbacks.onError?.(error);
          
          // Continue processing rather than stopping the entire stream
          processEvents();
          return;
          // Don't reject here to allow the stream to continue despite errors
        }
      }).catch(error => {
        console.error(`${logPrefix} Stream reader error:`, error);
        callbacks.onError?.(error);
        reject(error);
      });
    }

    processEvents();
  });
}

/**
 * Create a Server-Sent Events (SSE) response from a stream of events
 * Used on the server side to convert OpenAI stream to SSE format
 */
export function createSSEResponseFromStream(
  openAIStream: any, // Use any type to accommodate OpenAI's stream
  logPrefix: string = '[SERVER]'
): ReadableStream<Uint8Array> {
  console.log(`${logPrefix} Creating SSE response from stream`);
  const encoder = new TextEncoder();
  let eventCount = 0;
  
  return new ReadableStream({
    async start(controller) {
      try {
        // Use proper async iteration on the OpenAI stream
        // This avoids the Symbol.asyncIterator error
        if (openAIStream[Symbol.asyncIterator]) {
          for await (const event of openAIStream) {
            // Convert each event to a server-sent event
            const data = JSON.stringify(event);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            eventCount++;
            
            // Log the first event and periodically log counts
            if (eventCount === 1) {
              console.log(`${logPrefix} First stream event received:`, { type: event.type });
            }
            if (eventCount % 10 === 0) {
              console.log(`${logPrefix} Processed ${eventCount} stream events`);
            }
          }
        } else {
          // Handle case where stream doesn't support async iteration
          // Use the reader API instead
          const reader = openAIStream.getReader();
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                break;
              }
              
              // Process the value as an event
              const data = JSON.stringify(value);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              eventCount++;
              
              // Log the first event and periodically log counts
              if (eventCount === 1) {
                console.log(`${logPrefix} First stream event received:`, { type: value.type });
              }
              if (eventCount % 10 === 0) {
                console.log(`${logPrefix} Processed ${eventCount} stream events`);
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
        
        console.log(`${logPrefix} Stream complete, sent ${eventCount} events`);
        // Send a final [DONE] event to signal completion
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        console.error(`${logPrefix} Stream error:`, error);
        controller.error(error);
      }
    }
  });
}

/**
 * Handle stream errors consistently
 */
export function handleStreamError(error: any, logPrefix: string = '[STREAM]'): ReadableStream<any> {
  console.error(`${logPrefix} Error:`, error);
  
  // Handle error of unknown type safely
  const errorObj: Record<string, any> = {};
  
  if (error instanceof Error) {
    errorObj.name = error.name;
    errorObj.message = error.message;
    errorObj.stack = error.stack?.substring(0, 200);
  } else {
    errorObj.details = String(error);
  }
    
  console.log(`${logPrefix} Error details:`, errorObj);
  
  // Create a readable stream that immediately errors
  return new ReadableStream({
    start(controller) {
      controller.error(error);
    }
  });
}

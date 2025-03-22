import { ChatMessage, StreamingStatus } from '../../../types/chat';
import { ToolCall } from '../../../types/tools';
import { OpenAIMessage, OpenAIResponsesOptions, OpenAIResponsesEvent } from '../../../types/openai';
import { streamAIResponse } from './chat-client';
import { processStreamingEvents, FunctionCall } from '@/lib/utils/streaming-utils';
import { ChatMessageRow } from '@/types/supabase';
import { chatMessageRowToMessage } from '@/types/chat';
import { toolRegistry } from './tool-registry';
// Import the initialized tool registry to ensure tools are properly loaded
import { initializedToolRegistry } from '../tools/tool-initializer';

// Travel assistant instructions
export const TRAVEL_ASSISTANT_INSTRUCTIONS = `
You are a helpful AI travel assistant for Sword Travel. Help users plan their trips by suggesting flights, hotels, and activities.

IMPORTANT: You have access to tools that you should use when appropriate. DO NOT make up information. 
Instead, use the relevant tool to get accurate data.

Specifically:
1. When asked about the weather in any location, ALWAYS use the get_weather tool
2. Provide the location parameter to the tool exactly as the user specified it
3. After receiving tool results, incorporate that information into your response

Always prioritize the user's preferences and budget when making suggestions.
`;

/**
 * Process a user message and generate an AI response with streaming
 */
export async function processUserMessage(
  message: string,
  sessionId: string,
  userId: string | null,
  conversationHistory: ChatMessage[],
  onEvent: {
    onMessageStart?: () => void,
    onMessageStream?: (text: string) => void,
    onToolCallStart?: (tool: Partial<ToolCall>) => void,
    onToolCallUpdate?: (tool: Partial<ToolCall>) => void,
    onMessageComplete?: (message: ChatMessage) => void,
    onError?: (error: any) => void
  }
) {
  console.log('[MESSAGE-PROCESSOR] Processing user message:', {
    messageLength: message.length,
    sessionId,
    userId,
    historyLength: conversationHistory.length
  });

  try {
    // Prepare input messages
    const inputMessages: OpenAIMessage[] = [
      // Developer instructions (system prompt in the Responses API)
      { role: 'developer', content: TRAVEL_ASSISTANT_INSTRUCTIONS }
    ];
    
    // Keep only 15 most recent messages for context
    const recentMessages = conversationHistory.slice(-15);
    
    // Add recent messages to the input messages array
    inputMessages.push(...recentMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })));
    
    // Add current user message
    inputMessages.push({ role: 'user', content: message });
    
    // Prepare streaming options
    const streamOptions: OpenAIResponsesOptions = {
      model: 'gpt-4o-mini',
      input: inputMessages,
      tools: initializedToolRegistry.getAllDefinitions(),
      store: true,
      stream: true
    };
    
    console.log('[MESSAGE-PROCESSOR] Streaming options prepared:', {
      model: streamOptions.model,
      inputLength: streamOptions.input.length,
      numTools: streamOptions.tools?.length || 0
    });
    
    // Signal start of message processing
    onEvent.onMessageStart?.();
    
    // Initialize new message
    const newMessage: Partial<ChatMessage> = {
      id: Date.now().toString(),
      sessionId,
      role: 'assistant',
      content: '',
      toolCalls: [],
      tool_calls: [],  // Added for UI compatibility
      createdAtDate: new Date(),
      streamingStatus: {
        isStreaming: true,
        accumulatedItems: {}
      }
    };
    
    // Stream the response
    const stream = await streamAIResponse(streamOptions);
    
    // Explicitly type the stream to avoid type errors
    await processStreamingEvents(stream, {
      onTextDelta: (delta, index) => {
        // Update message content
        newMessage.content += delta;
        onEvent.onMessageStream?.(delta);
      },
      
      onToolCall: (toolCall, index) => {
        // Initialize tool calls array if needed
        if (!newMessage.toolCalls) {
          newMessage.toolCalls = [];
        }
        
        // Create or update tool call
        if (!newMessage.toolCalls[index]) {
          const newToolCall: ToolCall = {
            id: Date.now().toString() + index,
            call_id: toolCall.call_id,
            name: toolCall.name,
            type: "function_call", 
            arguments: JSON.stringify(toolCall.args)
          };
          
          newMessage.toolCalls[index] = newToolCall;
          onEvent.onToolCallStart?.(newToolCall);
        } else {
          // Update existing tool call
          Object.assign(newMessage.toolCalls[index], {
            call_id: toolCall.call_id || newMessage.toolCalls[index].call_id,
            name: toolCall.name || newMessage.toolCalls[index].name,
            arguments: toolCall.args ? JSON.stringify(toolCall.args) : newMessage.toolCalls[index].arguments
          });
          
          onEvent.onToolCallUpdate?.(newMessage.toolCalls[index]);
        }
        
        // Also update tool_calls for UI compatibility
        if (!newMessage.tool_calls) {
          newMessage.tool_calls = [];
        }
        
        // Mirror the toolCall to tool_calls array for UI rendering
        if (!newMessage.tool_calls || !(newMessage.tool_calls as ToolCall[])[index]) {
          const uiToolCall: ToolCall = {
            id: (newMessage.toolCalls as ToolCall[])[index].id,
            call_id: (newMessage.toolCalls as ToolCall[])[index].call_id,
            name: (newMessage.toolCalls as ToolCall[])[index].name,
            type: "function_call",
            arguments: (newMessage.toolCalls as ToolCall[])[index].arguments
          };
          
          (newMessage.tool_calls as ToolCall[])[index] = uiToolCall;
        } else {
          // Update existing tool call in the UI array
          Object.assign((newMessage.tool_calls as ToolCall[])[index], (newMessage.toolCalls as ToolCall[])[index]);
        }
      },
      
      onComplete: async (response) => {
        // Update message with completed status
        if (newMessage.streamingStatus) {
          newMessage.streamingStatus.isStreaming = false;
          newMessage.streamingStatus.responseId = response.id;
        }
        
        // If response.function_calls exists, convert to toolCalls and tool_calls format
        // Handle function calls from response.output (Responses API format)
        if (response.output && Array.isArray(response.output)) {
          // Initialize arrays if they don't exist
          if (!newMessage.toolCalls) newMessage.toolCalls = [];
          if (!newMessage.tool_calls) newMessage.tool_calls = [];
          
          // Process each output item
          response.output.forEach((item, index) => {
            if (item.type === 'function_call') {
              const toolCall: ToolCall = {
                id: item.id || `${Date.now().toString()}_${index}`,
                call_id: item.call_id,
                name: item.name,
                type: "function_call",
                arguments: item.arguments || "{}"
              };
              
              // Update both arrays to ensure UI compatibility
              (newMessage.toolCalls as ToolCall[])[index] = toolCall;
              (newMessage.tool_calls as ToolCall[])[index] = {...toolCall};
              
              console.log(`[MESSAGE-PROCESSOR] Added function call from output to UI arrays:`, toolCall);
            }
          });
        }
        
        // Legacy format - Handle function calls from response.function_calls
        if (response.function_calls && Object.keys(response.function_calls).length > 0) {
          // Initialize arrays if they don't exist
          if (!newMessage.toolCalls) newMessage.toolCalls = [];
          if (!newMessage.tool_calls) newMessage.tool_calls = [];
          
          // Convert function_calls object to arrays
          Object.entries(response.function_calls).forEach(([indexStr, funcCall]) => {
            const index = parseInt(indexStr);
            const toolCall: ToolCall = {
              id: funcCall.id || `${Date.now().toString()}_${index}`,
              call_id: funcCall.call_id,
              name: funcCall.name,
              type: "function_call",
              arguments: funcCall.arguments || "{}"
            };
            
            // Update both arrays to ensure UI compatibility
            (newMessage.toolCalls as ToolCall[])[index] = toolCall;
            (newMessage.tool_calls as ToolCall[])[index] = {...toolCall};
            
            console.log(`[MESSAGE-PROCESSOR] Added function call from function_calls to UI arrays:`, toolCall);
          });
        }
        
        // Execute each tool call if any
        if (newMessage.toolCalls && newMessage.toolCalls.length > 0) {
          console.log('[MESSAGE-PROCESSOR] Executing tool calls:', { count: newMessage.toolCalls.length });
          
          // Execute all tool calls in parallel
          await Promise.all(newMessage.toolCalls.map(async (toolCall) => {
            try {
              // Parse the arguments
              const args = JSON.parse(toolCall.arguments);
              
              console.log(`[MESSAGE-PROCESSOR] Executing tool: ${toolCall.name}`, { args });
              
              // Execute the tool
              const result = await initializedToolRegistry.executeTool(toolCall.name, args);
              
              // Update tool with result
              toolCall.output = JSON.stringify(result);
              
              console.log(`[MESSAGE-PROCESSOR] Tool execution complete: ${toolCall.name}`, { result });
              
              onEvent.onToolCallUpdate?.(toolCall);
            } catch (error: any) {
              // Handle tool execution error
              console.error(`Error executing tool ${toolCall.name}:`, error);
              
              // Create error object to be stored in the tool call's metadata
              const toolError = {
                type: error.name || 'ExecutionError',
                message: error.message || 'Unknown error occurred',
                details: error.stack
              };
              
              // Store error as a string in output field with error marker
              toolCall.output = JSON.stringify({
                error: toolError
              });
              
              onEvent.onToolCallUpdate?.(toolCall);
            }
          }));
          
          // Implement ReAct pattern - continue the conversation with tool outputs
          try {
            console.log('[MESSAGE-PROCESSOR] Continuing conversation with tool outputs');
            
            // Prepare follow-up messages with tool outputs
            const followUpMessages: OpenAIMessage[] = [
              // Developer instructions (system prompt)
              { role: 'developer', content: TRAVEL_ASSISTANT_INSTRUCTIONS }
            ];
            
            // Add recent conversation history
            const recentMessages = conversationHistory.slice(-15);
            followUpMessages.push(...recentMessages.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            })));
            
            // Add current user message
            followUpMessages.push({ role: 'user', content: message });
            
            // Add the current assistant response
            followUpMessages.push({ 
              role: 'assistant', 
              content: newMessage.content || ''
            });
            
            // For the Responses API, we need to include BOTH the original function calls AND their outputs
            // Build a map of function calls from the response
            const functionCalls: Record<string, any> = {};
            
            // Extract function calls from response.output (new Responses API format)
            if (response.output && Array.isArray(response.output)) {
              response.output.forEach(item => {
                if (item.type === 'function_call' && item.call_id) {
                  functionCalls[item.call_id] = item;
                  console.log(`[MESSAGE-PROCESSOR] Found function call in response.output with call_id: ${item.call_id}`);
                }
              });
            }
            
            // Also check legacy format if needed
            if (Object.keys(functionCalls).length === 0 && response.function_calls && Object.keys(response.function_calls).length > 0) {
              Object.values(response.function_calls).forEach(funcCall => {
                if (funcCall.call_id) {
                  functionCalls[funcCall.call_id] = funcCall;
                  console.log(`[MESSAGE-PROCESSOR] Found function call in response.function_calls with call_id: ${funcCall.call_id}`);
                }
              });
            }
            
            // For each tool call that has an output, first add the original function call
            // then add its output
            for (const toolCall of newMessage.toolCalls) {
              if (toolCall.output && toolCall.call_id) {
                const originalCall = functionCalls[toolCall.call_id];
                
                if (originalCall) {
                  // 1. First add the original function call to the input
                  console.log(`[MESSAGE-PROCESSOR] Adding original function call with call_id: ${toolCall.call_id}`);
                  followUpMessages.push(originalCall as any);
                  
                  // 2. Then add its output
                  console.log(`[MESSAGE-PROCESSOR] Adding function output for call_id: ${toolCall.call_id}`);
                  followUpMessages.push({
                    type: 'function_call_output',
                    call_id: toolCall.call_id,
                    output: toolCall.output
                  } as any);
                } else {
                  console.warn(`[MESSAGE-PROCESSOR] Function call with call_id ${toolCall.call_id} was not found in the original response. Skipping.`);
                }
              }
            }
            
            // Ensure we filter out any legacy format messages with function_call property
            // This would cause the "Unknown parameter: 'input[x].function_call'" error
            const sanitizedMessages = followUpMessages.map(msg => {
              // If this is a regular message object with role and content
              if (typeof msg === 'object' && 'role' in msg && 'content' in msg) {
                // Create a clean copy without function_call
                const { function_call, ...cleanMsg } = msg as any;
                return cleanMsg;
              }
              // Otherwise return the original message (like function_call_output types)
              return msg;
            });
            
            console.log('[MESSAGE-PROCESSOR] Sanitized follow-up messages:', sanitizedMessages);
            
            // Prepare follow-up options
            const followUpOptions: OpenAIResponsesOptions = {
              model: 'gpt-4o-mini',
              previous_response_id: response.id,
              input: sanitizedMessages,
              tools: toolRegistry.getAllDefinitions(),
              store: true,
              stream: true
            };
            
            // Let the UI know we're continuing the stream with tool outputs
            if (newMessage.streamingStatus) {
              newMessage.streamingStatus.isStreaming = true;
              newMessage.streamingStatus.isProcessingTools = false;
              newMessage.streamingStatus.continuationResponseId = response.id;
            }
            
            // Notify about all tool updates
            if (newMessage.toolCalls) {
              newMessage.toolCalls.forEach(tc => onEvent.onToolCallUpdate?.(tc));
            }
            
            // Stream the follow-up response
            const followUpStream = await streamAIResponse(followUpOptions);
            
            // Process the follow-up stream
            await processStreamingEvents(followUpStream, {
              onTextDelta: (delta, index) => {
                // Append new content instead of replacing
                newMessage.content += delta;
                onEvent.onMessageStream?.(delta);
              },
              
              onToolCall: (toolCall, index) => {
                // Handle any new tool calls the same way as before
                if (!newMessage.toolCalls) {
                  newMessage.toolCalls = [];
                }
                
                const newToolCall: ToolCall = {
                  id: Date.now().toString() + index,
                  call_id: toolCall.call_id,
                  name: toolCall.name,
                  type: "function_call", 
                  arguments: JSON.stringify(toolCall.args)
                };
                
                newMessage.toolCalls.push(newToolCall);
                onEvent.onToolCallStart?.(newToolCall);
              },
              
              onComplete: async (finalResponse) => {
                if (newMessage.streamingStatus) {
                  newMessage.streamingStatus.isStreaming = false;
                  newMessage.streamingStatus.finalResponseId = finalResponse.id;
                }
                
                // Notify completion with the enhanced message
                onEvent.onMessageComplete?.(newMessage as ChatMessage);
              },
              
              onError: (error) => {
                console.error('Error in ReAct follow-up:', error);
                // Still consider the message complete even if the follow-up failed
                onEvent.onMessageComplete?.(newMessage as ChatMessage);
              }
            });
          } catch (error) {
            console.error('Error implementing ReAct pattern:', error);
            // If ReAct fails, still deliver the original message
            onEvent.onMessageComplete?.(newMessage as ChatMessage);
          }
        } else {
          // No tool calls, just complete the message normally
          onEvent.onMessageComplete?.(newMessage as ChatMessage);
        }
      },
      
      onError: (error) => {
        console.error('Error in streaming process:', error);
        onEvent.onError?.(error);
      }
    });
    
    return newMessage as ChatMessage;
  } catch (error) {
    console.error('Error processing message:', error);
    onEvent.onError?.(error);
    throw error;
  }
}

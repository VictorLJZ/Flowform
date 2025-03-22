/**
 * Chat Message Utilities
 * Shared utilities for chat message transformations and operations
 */
import { ChatMessageRow } from '@/types/supabase';
import { ChatMessage, ToolCall } from '@/types/chat';
import { CHAT_CONSTANTS } from '@/lib/constants/chat-constants';
import { chatMessageService } from './chat-message-service';

/**
 * Process tool calls from database format to ensure they are properly formatted for the UI
 * 
 * @param dbToolCalls The tool calls as stored in the database
 * @returns An array of properly formatted tool calls or undefined if none exist
 */
export function processToolCallsFromDatabase(dbToolCalls: any): ToolCall[] | undefined {
  // Add detailed logging to diagnose the issue
  console.log('[CHAT-UTILITIES] Processing tool calls from database:', {
    originalValue: dbToolCalls,
    type: typeof dbToolCalls,
    isArray: Array.isArray(dbToolCalls),
    stringified: JSON.stringify(dbToolCalls)
  });
  
  try {
    // Case 1: dbToolCalls is already a properly formatted array
    if (Array.isArray(dbToolCalls) && dbToolCalls.length > 0) {
      console.log('[CHAT-UTILITIES] Tool calls already in array format');
      
      // Ensure each tool call has the required properties
      return dbToolCalls.map(tc => ({
        id: tc.id || tc.call_id || `tool_${Date.now()}`,
        call_id: tc.call_id || tc.id || `call_${Date.now()}`, 
        name: tc.name || 'unknown_tool',
        arguments: typeof tc.arguments === 'string' ? tc.arguments : JSON.stringify({}),
        output: tc.output || undefined,
        type: tc.type || 'function_call'
      }));
    }
    
    // Case 2: dbToolCalls is a string that needs to be parsed
    if (typeof dbToolCalls === 'string') {
      try {
        const parsed = JSON.parse(dbToolCalls);
        console.log('[CHAT-UTILITIES] Parsed tool calls from string:', parsed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Recursively call this function with the parsed array
          return processToolCallsFromDatabase(parsed);
        }
        return undefined;
      } catch (error) {
        console.error('[CHAT-UTILITIES] Error parsing tool calls string:', error);
        return undefined;
      }
    }
    
    // Case 3: dbToolCalls is an object but not an array (rare but possible)
    if (dbToolCalls && typeof dbToolCalls === 'object') {
      // Try to convert to array if it looks like a tool call
      if ('name' in dbToolCalls && ('arguments' in dbToolCalls || 'args' in dbToolCalls)) {
        console.log('[CHAT-UTILITIES] Converting single tool call object to array');
        const args = dbToolCalls.arguments || 
                    (dbToolCalls.args ? JSON.stringify(dbToolCalls.args) : '{}');
                    
        return [{
          id: dbToolCalls.id || dbToolCalls.call_id || `tool_${Date.now()}`,
          call_id: dbToolCalls.call_id || dbToolCalls.id || `call_${Date.now()}`,
          name: dbToolCalls.name,
          arguments: typeof args === 'string' ? args : JSON.stringify(args),
          output: dbToolCalls.output || undefined,
          type: dbToolCalls.type || 'function_call'
        }];
      }
      
      // Otherwise check if it's an object with numeric keys (like from OpenAI)
      const toolCallsArray = Object.values(dbToolCalls).filter(v => 
        v && typeof v === 'object' && 'name' in v);
        
      if (toolCallsArray.length > 0) {
        console.log('[CHAT-UTILITIES] Extracted tool calls from object values');
        // Recursively call this function with the extracted array
        return processToolCallsFromDatabase(toolCallsArray);
      }
    }
    
    // Default: No valid tool calls
    return undefined;
  } catch (error) {
    console.error('[CHAT-UTILITIES] Error processing tool calls:', error);
    return undefined;
  }
}

/**
 * Convert a database message row to a ChatMessage for the OpenAI API
 */
export function convertToChatMessage(msg: ChatMessageRow): ChatMessage {
  // Process tool calls from the database
  const processedToolCalls = processToolCallsFromDatabase(msg.tool_calls);
  
  // Log diagnostic information about the conversion
  console.log('[CHAT-UTILITIES] Converting DB row to ChatMessage:', {
    messageId: msg.id,
    originalToolCalls: msg.tool_calls,
    processedToolCalls
  });
  
  return {
    id: msg.id,
    session_id: msg.session_id,
    user_id: msg.user_id,
    content: msg.content || '',
    role: msg.role as 'user' | 'assistant' | 'system',
    timestamp: msg.timestamp,
    created_at: msg.created_at,
    user_display_name: msg.user_display_name,
    display_name: msg.display_name,
    avatar_url: msg.avatar_url,
    embedding: msg.embedding,
    // Include processed tool calls
    tool_calls: processedToolCalls,
    metadata: msg.metadata,
    sessionId: msg.session_id,
    userId: msg.user_id,
    userDisplayName: msg.user_display_name
  };
}

/**
 * Create a placeholder message for streaming responses
 * Now creates a real database record to avoid UUID issues
 * 
 * @param sessionId The session ID to create the placeholder for
 * @returns A promise that resolves to the created database record
 */
export async function createStreamingPlaceholder(sessionId: string): Promise<ChatMessageRow> {
  try {
    // Create a real database record for the assistant message
    const message = await chatMessageService.createAssistantMessagePlaceholder(sessionId);
    return message;
  } catch (error) {
    console.error('Error creating streaming placeholder in database:', error);
    // Fall back to local placeholder if database insert fails
    // This is still not ideal but prevents the app from crashing
    const streamingTimestamp = new Date().toISOString();
    return {
      id: `${CHAT_CONSTANTS.DEFAULTS.TEMP_PREFIX}${Date.now().toString()}`,
      session_id: sessionId,
      user_id: null,
      content: '',
      role: CHAT_CONSTANTS.DEFAULTS.DEFAULT_ROLE as 'assistant',
      timestamp: streamingTimestamp,
      created_at: streamingTimestamp,
      user_display_name: null,
      display_name: null,
      avatar_url: null,
      embedding: null,
      tool_calls: null,
      segments: null,
      processing_metadata: null,
      metadata: null
    };
  }
}

/**
 * Handle store errors with consistent logging and messaging
 */
export function handleStoreError(error: unknown, errorType: string): string {
  console.error(`Error in ${errorType}:`, error);
  
  if (error instanceof Error) {
    return error.message;
  }
  
  // Map common error types to constants
  switch (errorType) {
    case 'load':
      return CHAT_CONSTANTS.ERROR_MESSAGES.LOAD_FAILURE;
    case 'send':
      return CHAT_CONSTANTS.ERROR_MESSAGES.SEND_FAILURE;
    case 'delete':
      return CHAT_CONSTANTS.ERROR_MESSAGES.DELETE_FAILURE;
    case 'process':
      return CHAT_CONSTANTS.ERROR_MESSAGES.PROCESS_FAILURE;
    case 'ai_response':
      return CHAT_CONSTANTS.ERROR_MESSAGES.AI_RESPONSE_FAILURE;
    default:
      return `Failed to ${errorType}`;
  }
}

/**
 * Convert array of messages to API format
 */
export function convertMessagesToAPIFormat(messages: ChatMessageRow[]): ChatMessage[] {
  return messages.map(convertToChatMessage);
}

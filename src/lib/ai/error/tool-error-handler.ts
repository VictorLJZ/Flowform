import { ToolCall, ToolError } from '../../../types/tools';
import { withRetry, RetryOptions } from './retry';
import { toolRegistry } from '../core/tool-registry';

export interface ToolErrorContext {
  toolName: string;
  args: any;
  error: any;
  attemptCount: number;
}

export interface ToolErrorHandler {
  canHandle: (context: ToolErrorContext) => boolean;
  handle: (context: ToolErrorContext) => Promise<any>;
}

// Registry of tool-specific error handlers
const errorHandlers: Record<string, ToolErrorHandler[]> = {};

/**
 * Register a handler for a specific tool
 */
export function registerToolErrorHandler(
  toolName: string,
  handler: ToolErrorHandler
) {
  if (!errorHandlers[toolName]) {
    errorHandlers[toolName] = [];
  }
  
  errorHandlers[toolName].push(handler);
}

/**
 * Execute a tool with error handling
 */
export async function executeToolWithErrorHandling(
  toolName: string,
  args: any
): Promise<any> {
  const tool = toolRegistry.getTool(toolName);
  
  if (!tool) {
    throw new Error(`Tool not found: ${toolName}`);
  }
  
  // Get retry config from tool definition
  const retryConfig: Partial<RetryOptions> = tool.retryConfig || {
    maxRetries: 1,
    initialDelay: 300,
    shouldRetry: () => true
  };
  
  let attemptCount = 0;
  
  // Execute with retry
  return withRetry(
    async () => {
      attemptCount++;
      
      try {
        return await tool.executor(args);
      } catch (error) {
        // Look for specific handlers for this tool
        const handlers = errorHandlers[toolName] || [];
        
        for (const handler of handlers) {
          const context = { toolName, args, error, attemptCount };
          
          if (handler.canHandle(context)) {
            return await handler.handle(context);
          }
        }
        
        // No handler found, rethrow
        throw error;
      }
    },
    retryConfig
  );
}

/**
 * Format a tool error for inclusion in a response
 */
export function formatToolError(toolCall: ToolCall): ToolError {
  const { name, error } = toolCall;
  
  // Default error if none provided
  if (!error) {
    return {
      type: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred'
    };
  }
  
  // Format based on tool type
  switch (name) {
    case 'search_flights':
      if (error.type === 'INVALID_AIRPORT') {
        return {
          type: 'INVALID_AIRPORT',
          message: `One or more airport codes are invalid. Please use valid IATA codes.`
        };
      }
      break;
      
    case 'search_hotels':
      if (error.type === 'LOCATION_NOT_FOUND') {
        return {
          type: 'LOCATION_NOT_FOUND',
          message: `Could not find the location you specified.`
        };
      }
      break;
  }
  
  // Return original error if no special formatting
  return error;
}

import { ChatMessage } from '../../../types/chat';
import { ToolCall, ToolError } from '../../../types/tools';
import { toolRegistry } from './tool-registry';
import { generateAIResponse } from './chat-client';
import { OpenAIMessage } from '../../../types/openai';

/**
 * ReAct cycle states
 */
export type ReActPhase = 'reasoning' | 'action' | 'observation' | 'integration' | 'response';

/**
 * ReAct state for tracking progress
 */
export interface ReActState {
  phase: ReActPhase;
  thought?: string;
  actionPlan?: string;
  observations: Record<string, any>;
  toolCalls: ToolCall[];
  response?: string;
  isComplete: boolean;
}

/**
 * Initialize a new ReAct state
 */
export function initializeReActState(): ReActState {
  return {
    phase: 'reasoning',
    observations: {},
    toolCalls: [],
    isComplete: false
  };
}

/**
 * Run a single ReAct cycle
 */
export async function runReActCycle(
  userQuery: string,
  conversationHistory: ChatMessage[],
  currentState: ReActState,
  onUpdate?: (state: ReActState) => void
): Promise<ReActState> {
  // Make a copy of the current state
  let state = { ...currentState };
  
  try {
    // Handle different phases of the ReAct cycle
    switch (state.phase) {
      case 'reasoning':
        state = await performReasoningPhase(userQuery, conversationHistory, state);
        onUpdate?.(state);
        break;
        
      case 'action':
        state = await performActionPhase(state);
        onUpdate?.(state);
        break;
        
      case 'observation':
        state = await performObservationPhase(state);
        onUpdate?.(state);
        break;
        
      case 'integration':
        state = await performIntegrationPhase(userQuery, conversationHistory, state);
        onUpdate?.(state);
        break;
        
      case 'response':
        state = await performResponsePhase(userQuery, conversationHistory, state);
        state.isComplete = true;
        onUpdate?.(state);
        break;
    }
    
    return state;
  } catch (error) {
    console.error('Error in ReAct cycle:', error);
    
    // Handle error gracefully by moving to response phase with error information
    state.phase = 'response';
    state.response = `I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`;
    state.isComplete = true;
    
    onUpdate?.(state);
    return state;
  }
}

/**
 * Perform the reasoning phase to analyze the query and determine actions
 */
async function performReasoningPhase(
  userQuery: string,
  conversationHistory: ChatMessage[],
  state: ReActState
): Promise<ReActState> {
  // Prepare prompt for reasoning phase
  const reasoningPrompt: OpenAIMessage[] = [
    {
      role: 'developer',
      content: `
      You are a travel assistant analyzing a user query. 
      Your task is to:
      1. Understand what the user is asking for
      2. Determine what information you need
      3. Plan what tools to use to gather this information
      
      Respond in this format:
      THOUGHT: [Your analysis of the user's query]
      ACTION PLAN: [Detailed plan of which tools to use and why]
      `
    },
    ...conversationHistory.slice(-5).map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userQuery }
  ];
  
  // Generate reasoning response
  const response = await generateAIResponse({
    model: 'gpt-4o-mini',
    input: reasoningPrompt
  });
  
  // Extract thought and action plan from response
  const content = response.output_text;
  
  // Parse the response
  const thoughtMatch = content.match(/THOUGHT:(.*?)(?=ACTION PLAN:|$)/);  // Removed 's' flag
  const actionPlanMatch = content.match(/ACTION PLAN:(.*?)(?=$)/);  // Removed 's' flag
  
  return {
    ...state,
    phase: 'action',
    thought: thoughtMatch ? thoughtMatch[1].trim() : '',
    actionPlan: actionPlanMatch ? actionPlanMatch[1].trim() : '',
  };
}

/**
 * Perform the action phase to execute tools based on the action plan
 */
async function performActionPhase(state: ReActState): Promise<ReActState> {
  // Identify tools to call based on action plan
  // This is a placeholder implementation - in a real system, you would
  // use a more sophisticated approach to parse the action plan
  
  // Placeholder tool calls based on action plan
  const toolsToCall: { name: string; args: Record<string, any> }[] = []; // This would be determined from the action plan
  
  // Execute each tool in parallel
  const toolPromises = toolsToCall.map(async (toolInfo) => {
    const { name, args } = toolInfo;
    
    try {
      // Create a new tool call record
      const toolCall: ToolCall = {
        id: Date.now().toString(),
        call_id: Date.now().toString(),
        name,
        type: 'function_call',
        arguments: JSON.stringify(args)
      };
      
      // Execute the tool
      const result = await toolRegistry.executeTool(name, args);
      
      // Update tool call with result
      toolCall.output = JSON.stringify(result);
      
      return toolCall;
    } catch (error: unknown) {
      // Handle tool execution error
      const toolCall: ToolCall = {
        id: Date.now().toString(),
        call_id: Date.now().toString(),
        name,
        type: 'function_call',
        arguments: JSON.stringify(args),
        error: {
          type: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
      
      return toolCall;
    }
  });
  
  // Wait for all tool calls to complete
  const toolCalls = await Promise.all(toolPromises);
  
  // Move to observation phase
  return {
    ...state,
    phase: 'observation',
    toolCalls: [...state.toolCalls, ...toolCalls]
  };
}

/**
 * Perform the observation phase to analyze tool results
 */
async function performObservationPhase(state: ReActState): Promise<ReActState> {
  // Process tool results to build observations
  const observations: Record<string, any> = {};
  
  for (const toolCall of state.toolCalls) {
    if (toolCall.output) {
      observations[toolCall.name] = toolCall.output;
    } else if (toolCall.error) {
      observations[`${toolCall.name}_error`] = toolCall.error;
    }
  }
  
  // Move to integration phase
  return {
    ...state,
    phase: 'integration',
    observations: {
      ...state.observations,
      ...observations
    }
  };
}

/**
 * Perform the integration phase to combine observations with reasoning
 */
async function performIntegrationPhase(
  userQuery: string,
  conversationHistory: ChatMessage[],
  state: ReActState
): Promise<ReActState> {
  // Prepare prompt for integration phase
  const integrationPrompt: OpenAIMessage[] = [
    {
      role: 'developer',
      content: `
      You are a travel assistant integrating observations from tools.
      Based on the user query, your initial thoughts, and the tool results,
      determine whether all required information has been gathered or if
      additional tools need to be called.
      
      User Query: ${userQuery}
      
      Your Thought: ${state.thought}
      
      Action Plan: ${state.actionPlan}
      
      Observations:
      ${formatObservations(state.observations)}
      
      Respond with either:
      COMPLETE: [Why the information is complete]
      or
      NEED MORE INFO: [What additional information is needed and what tools to call]
      `
    }
  ];
  
  // Generate integration response
  const response = await generateAIResponse({
    model: 'gpt-4o-mini',
    input: integrationPrompt
  });
  
  const content = response.output_text;
  
  // Determine if we have all the information we need
  if (content.startsWith('COMPLETE:')) {
    return {
      ...state,
      phase: 'response'
    };
  } else {
    // We need more information, go back to action phase
    return {
      ...state,
      phase: 'action',
      actionPlan: content.replace('NEED MORE INFO:', '').trim()
    };
  }
}

/**
 * Perform the response phase to generate the final response to the user
 */
async function performResponsePhase(
  userQuery: string,
  conversationHistory: ChatMessage[],
  state: ReActState
): Promise<ReActState> {
  // Prepare prompt for response phase
  const responsePrompt: OpenAIMessage[] = [
    {
      role: 'developer',
      content: `
      You are a helpful travel assistant. Based on the user's query and the
      information gathered, provide a comprehensive and helpful response.
      
      User Query: ${userQuery}
      
      Your Analysis: ${state.thought}
      
      Information Gathered:
      ${formatObservations(state.observations)}
      
      Respond directly to the user with a helpful, comprehensive answer.
      Do not mention your internal thought process or that you used tools.
      Focus on providing value to the user based on their query.
      `
    }
  ];
  
  // Generate final response
  const response = await generateAIResponse({
    model: 'gpt-4o-mini',
    input: responsePrompt
  });
  
  // Return the final state with the response
  return {
    ...state,
    phase: 'response',
    response: response.output_text,
    isComplete: true
  };
}

/**
 * Format observations for inclusion in prompts
 */
function formatObservations(observations: Record<string, any>): string {
  return Object.entries(observations)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return `${key}: ${JSON.stringify(value, null, 2)}`;
      } else {
        return `${key}: ${value}`;
      }
    })
    .join('\n\n');
}

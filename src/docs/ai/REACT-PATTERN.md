# Modified ReAct Pattern Implementation

## Overview

The ReAct (Reasoning + Acting) pattern enables LLMs to solve complex tasks by alternating between reasoning steps and action steps. For Sword Travel, we've implemented a modified ReAct pattern that maintains a conversational flow while leveraging the structured tool-use capabilities of OpenAI's Responses API.

## Traditional vs. Modified ReAct

### Traditional ReAct Pattern
The traditional ReAct approach follows a strict sequence:
1. **Thought**: Internal reasoning about what to do
2. **Action**: Taking a specific action
3. **Observation**: Processing the result of the action
4. Repeat...

This traditional pattern often exposes all the thinking to the user, which can be verbose and less conversational.

### Modified ReAct in Sword Travel
Our modified ReAct pattern maintains the core reasoning-action-observation cycle but adapts it for a more natural conversational flow:

1. **Reasoning** (Internal): The AI reasons about user needs but doesn't expose all thinking
2. **Acknowledgment** (External): The AI acknowledges user input and announces intent
3. **Action** (External + Visualization): Tool calls are executed with visual feedback
4. **Integration** (Internal): Results are processed internally
5. **Response** (External): Conversational response incorporating tool results

## Implementation Details

```typescript
// Modified ReAct execution flow
async function executeModifiedReAct(userMessage: string, sessionId: string) {
  const store = useSessionChatStore.getState();
  const messageId = generateUniqueId();
  
  // 1. Start assistant message (initial acknowledgment)
  store.addStreamingMessage({
    id: messageId,
    role: "assistant",
    content: "",
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    streamingStatus: { isStreaming: true }
  });
  
  try {
    // 2. Generate initial response with potential tool calls
    const stream = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "developer", content: constructInstructionsWithReActGuidance() },
        ...getConversationHistory(sessionId),
        { role: "user", content: userMessage }
      ],
      tools: getAllTools(),
      stream: true,
      store: true
    });
    
    // 3. Process streaming response
    for await (const event of stream) {
      await processStreamEvent(event, messageId, stream.responseId);
    }
    
    // 4. Finalize message
    store.finalizeStreamingMessage(messageId);
  } catch (error) {
    handleAIError(error, messageId);
  }
}

// Instructions that guide the AI to use our modified ReAct pattern
function constructInstructionsWithReActGuidance() {
  return `
You are a helpful travel assistant for Sword Travel.

IMPORTANT INSTRUCTIONS FOR REASONING AND ACTIONS:

1. ALWAYS follow this process when helping users:
   - First, SILENTLY reason about what the user needs
   - Start your response by acknowledging their message
   - Announce when you need to access information or use tools
   - After using tools, provide insightful analysis of the results
   - End with clear next steps or recommendations

2. TOOL USAGE GUIDELINES:
   - Use tools when factual information is needed
   - Chain multiple tools for complex questions
   - Explain what information you're looking for before using a tool
   - After receiving tool results, explain their significance

3. PROBLEM DECOMPOSITION:
   - Break complex travel planning into sub-goals
   - Tackle one sub-goal at a time
   - Use appropriate tools for each sub-goal
   - Maintain an overall plan for the entire trip

4. ITERATIVE REFINEMENT:
   - Confirm understanding before detailed planning
   - Propose options before making specific recommendations
   - Ask clarifying questions when needed
   - Refine plans based on user feedback

${ADDITIONAL_TRAVEL_INSTRUCTIONS}`;
}

// Process streaming events including tool calls
async function processStreamEvent(
  event: OpenAIStreamEvent,
  messageId: string,
  responseId: string
) {
  const store = useSessionChatStore.getState();
  
  switch (event.type) {
    case "response.output_text.delta":
      // Update message content (acknowledgment and response phases)
      store.updateStreamingMessage(messageId, {
        content: (store.getMessageById(messageId)?.content || "") + event.delta.text
      });
      break;
      
    case "response.output_item.added":
      if (event.item?.type === "function_call") {
        // Handle tool call (action phase)
        await executeToolWithVisualization(event.item, messageId, responseId);
      }
      break;
  }
}

// Execute a tool with visualization
async function executeToolWithVisualization(
  toolCall: OpenAIToolCall,
  messageId: string,
  responseId: string
) {
  const store = useSessionChatStore.getState();
  
  // 1. Add tool call visualization to message
  store.updateStreamingMessage(messageId, {
    toolCalls: [...(store.getMessageById(messageId)?.toolCalls || []), {
      id: toolCall.id,
      name: toolCall.name,
      arguments: toolCall.arguments,
      status: "pending"
    }]
  });
  
  // 2. Execute tool (action phase)
  try {
    const result = await executeToolWithRetry(toolCall.name, JSON.parse(toolCall.arguments));
    
    // 3. Update visualization with result
    store.updateToolCall(messageId, toolCall.id, {
      output: result,
      status: "complete"
    });
    
    // 4. Send result back to continue conversation (integration phase)
    await openai.responses.create({
      previous_response_id: responseId,
      input: [{
        type: "function_call_output",
        call_id: toolCall.call_id,
        output: JSON.stringify(result)
      }]
    });
    
    // 5. Record action for reasoning chain
    recordReActStep(messageId, {
      type: "tool_execution",
      tool: toolCall.name,
      args: JSON.parse(toolCall.arguments),
      result
    });
  } catch (error) {
    handleToolError(error, toolCall, messageId, responseId);
  }
}

// Record ReAct steps for analysis and debugging
function recordReActStep(messageId: string, step: ReActStep) {
  const store = useSessionChatStore.getState();
  
  store.updateStreamingMessage(messageId, {
    processingMetadata: {
      ...(store.getMessageById(messageId)?.processingMetadata || {}),
      reactSteps: [
        ...(store.getMessageById(messageId)?.processingMetadata?.reactSteps || []),
        {
          ...step,
          timestamp: new Date().toISOString()
        }
      ]
    }
  });
}
```

## Chain-of-Thought vs. Chain-of-Tools

Our implementation leverages two related concepts:

1. **Chain-of-Thought**: The AI performs internal reasoning to break down problems
2. **Chain-of-Tools**: Multiple tools are called in sequence to solve complex problems

Example flow:

```mermaid
graph TD
    A[User: "Plan a trip to Japan in April"] --> B["AI: Initial acknowledgment"]
    B --> C["AI reasoning (internal): Need dates, preferences, budget"]
    C --> D["AI: I'll help plan your Japan trip! Let me check some options..."]
    D --> E["Tool: check_travel_season(Japan, April)"]
    E --> F["AI: April is cherry blossom season in Japan"]
    F --> G["Tool: search_flights(origin, Japan, April)"]
    G --> H["AI: Here are flight options"]
    H --> I["Tool: search_hotels(Tokyo, April)"]
    I --> J["AI: Complete recommendations with itinerary suggestions"]
```

## Sub-Goal Decomposition

For complex travel planning, our pattern implements structured sub-goal decomposition:

1. **Identify Main Goals**: Determine key aspects (transportation, accommodation, activities)
2. **Sequence Sub-Goals**: Arrange in logical order (flights first, then hotels, then activities)
3. **Execute Tools per Sub-Goal**: Use appropriate tools for each component
4. **Track Progress**: Maintain a checklist of completed and pending items
5. **Synthesize Results**: Combine all findings into a cohesive plan

```typescript
// Structure for tracking sub-goals
interface PlanningSession {
  mainGoal: string;
  subGoals: Array<{
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    toolResults?: any[];
    notes?: string;
  }>;
  progress: number; // 0-100%
}

// Update sub-goal status
function updateSubGoalStatus(
  sessionId: string, 
  subGoalId: string, 
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  notes?: string
) {
  const store = useSessionChatStore.getState();
  
  // Update in Zustand state
  store.updatePlanningSession(sessionId, (session) => ({
    ...session,
    subGoals: session.subGoals.map(sg => 
      sg.id === subGoalId 
        ? { ...sg, status, notes: notes || sg.notes } 
        : sg
    ),
    progress: calculateProgress(session.subGoals)
  }));
}
```

## Reasoning Templates

To improve the AI's reasoning process, we provide structured templates for common travel planning scenarios:

```typescript
// Flight planning reasoning template
const flightPlanningTemplate = `
REASONING PROCESS:
1. Determine if I have origin and destination
2. Check if I have specific dates or date ranges
3. Consider if there are specific airlines or flight preferences
4. Assess if budget constraints are known
5. Check if number of travelers is specified

INFORMATION NEEDS:
- Origin: ?
- Destination: ?
- Dates: ?
- Travelers: ?
- Preferences: ?
- Budget: ?

TOOL SELECTION:
If all key information available → search_flights
If airports unclear → lookup_airport_codes
If dates flexible → check_flight_price_trends
`;

// Inject relevant reasoning templates based on detected intent
function injectReasoningTemplates(detected_intent: string) {
  const templates = {
    flight_booking: flightPlanningTemplate,
    hotel_booking: hotelPlanningTemplate,
    activity_planning: activityPlanningTemplate,
    // ...other templates
  };
  
  return templates[detected_intent] || "";
}
```

## ReAct Performance Optimization

To enhance the AI's reasoning capabilities while maintaining conversational flow:

1. **Pre-computed Tool Paths**: Common sequences of tools are pre-computed
2. **Parallelization**: Non-dependent tools execute simultaneously
3. **Reasoning Checkpoints**: Complex plans save intermediate reasoning states
4. **Fallback Mechanisms**: Alternative approaches when primary tools fail

```typescript
// Parallel tool execution when possible
async function executeParallelTools(tools: ToolCall[], messageId: string, responseId: string) {
  // Add all tool visualizations immediately
  tools.forEach(tool => {
    store.getState().updateStreamingMessage(messageId, {
      toolCalls: [...(store.getState().getMessageById(messageId)?.toolCalls || []), {
        id: tool.id,
        name: tool.name,
        arguments: tool.arguments,
        status: "pending"
      }]
    });
  });
  
  // Execute tools in parallel
  const results = await Promise.all(
    tools.map(async tool => {
      try {
        const result = await executeToolWithRetry(tool.name, JSON.parse(tool.arguments));
        
        // Update UI immediately when each tool completes
        store.getState().updateToolCall(messageId, tool.id, {
          output: result,
          status: "complete"
        });
        
        return {
          tool,
          result,
          error: null
        };
      } catch (error) {
        store.getState().updateToolCall(messageId, tool.id, {
          error: error.message,
          status: "error"
        });
        
        return {
          tool,
          result: null,
          error
        };
      }
    })
  );
  
  // Send all results back to continue conversation
  await openai.responses.create({
    previous_response_id: responseId,
    input: results.map(({ tool, result, error }) => ({
      type: "function_call_output",
      call_id: tool.call_id,
      output: JSON.stringify(error ? { error: error.message } : result)
    }))
  });
}
```

## Advantages of Our Modified ReAct Approach

1. **Conversational UX**: Maintains a natural dialogue despite complex reasoning
2. **Visual Transparency**: Tool usage is visible but not intrusive
3. **Efficient Problem Solving**: Structured approach to complex travel planning
4. **Adaptability**: Can switch between simple responses and multi-step reasoning
5. **User Trust**: Makes the AI's process understandable without overwhelming detail

## Challenges and Mitigations

| Challenge | Mitigation |
|-----------|------------|
| Long reasoning chains | Implement step limits and summarization |
| Tool execution failures | Retry logic and alternative approach suggestions |
| Context window limitations | Prioritize recent and relevant information |
| Maintaining coherence | Track and refer to sub-goals throughout conversation |
| Performance concerns | Parallelize independent tool calls, cache results |

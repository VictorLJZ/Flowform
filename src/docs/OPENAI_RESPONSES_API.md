# OpenAI Responses API Implementation

This document outlines how to correctly implement the OpenAI Responses API in the FlowForm-neo application, which replaces the legacy Chat Completions API as of March 11th, 2025.

## Key Differences from Legacy Chat Completions API

| Legacy Chat Completions API | New Responses API |
|----------------------------|-------------------|
| `messages` parameter | `input` parameter |
| `system` role | `developer` role |
| `content` access via `response.choices[0].message.content` | `response.output_text` helper property |
| `functions` for function calling | `tools` with different schema |

## Implementation Rules

### Rule 1: Response API Input Format

```typescript
// ✅ DO
const response = await openai.responses.create({
  model: "gpt-4o-mini",
  input: [{ role: "user", content: "Hello" }]
});

// ❌ DON'T
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello" }]
});
```

### Rule 2: Message Role Transformation

```typescript
// ✅ DO - Use "developer" instead of "system"
const response = await openai.responses.create({
  model: "gpt-4o-mini",
  input: [
    { role: "developer", content: "You are a helpful assistant." },
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi there! How can I help you?" }
  ]
});

// ❌ DON'T - Use "system" role (deprecated in Responses API)
```

### Rule 3: Function Calling Format

```typescript
// ✅ DO
const response = await openai.responses.create({
  model: "gpt-4o-mini",
  input: [{ role: "user", content: "What's the weather like?" }],
  tools: [{
    type: "function",
    name: "get_weather",
    description: "Get weather information",
    parameters: { /* schema */ },
    strict: true
  }]
});

// ❌ DON'T
// Don't use the "functions" property
```

### Rule 4: Function Call Results

```typescript
// ✅ DO
input.push(toolCall); // Add the function call
input.push({
  type: "function_call_output",
  call_id: toolCall.call_id,
  output: result.toString()
});

// ❌ DON'T
// Don't use the "role: function" approach
```

### Rule 5: Handling Streaming Events

```typescript
// ✅ DO - Handle typed events
const stream = await openai.responses.stream({
  model: "gpt-4o-mini",
  input: [{ role: "user", content: "Write a story about a dragon" }]
});

for await (const chunk of stream) {
  if (chunk.type === "response.output_text.delta") {
    // Process text delta
    console.log(chunk.delta);
  }
}

// ❌ DON'T
// Don't expect simple content deltas only
```

### Rule 6: Accessing Text Output

```typescript
// ✅ DO
console.log(response.output_text);  // Helper property for text

// ❌ DON'T
console.log(response.choices[0].message.content);
```

### Rule 7: Enable State Management

```typescript
// ✅ DO
// Enable state management
const response = await openai.responses.create({
  store: true,
  model: "gpt-4o-mini",
  input: [{ role: "user", content: "Hello" }]
});

// Reference previous conversation
const continuedResponse = await openai.responses.create({
  previous_response_id: response.id,
  input: [{ role: "user", content: "follow-up question" }]
});

// ❌ DON'T
// Manually track conversation history
```

## Implementation Example in FlowForm-neo

Here's how we implement the Responses API in our form generation service:

```typescript
// src/lib/ai/openaiService.ts
export async function generateNextQuestion(
  prevQuestions: string[],
  prevAnswers: string[],
  instructions: string,
  temperature: number = 0.7
) {
  // Format conversation history for the Responses API
  const conversationHistory = [];
  
  // Add system instructions as 'developer' role
  conversationHistory.push({
    role: "developer", // Using 'developer' instead of 'system'
    content: instructions
  });
  
  // Add previous Q&A exchanges
  for (let i = 0; i < prevQuestions.length; i++) {
    conversationHistory.push({
      role: "assistant", // Assistant asks questions
      content: prevQuestions[i]
    });
    
    if (i < prevAnswers.length) {
      conversationHistory.push({
        role: "user", // User provides answers
        content: prevAnswers[i]
      });
    }
  }
  
  // Request next question using the Responses API
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: conversationHistory,
    temperature,
    max_tokens: 500,
  });

  return { 
    success: true, 
    data: response.output_text 
  };
}
```

## Testing the Responses API

During development, you can use these endpoints to test your implementation:

1. `/api/ai/test-responses-api` - Tests basic text generation
2. `/api/ai/test-function-calling` - Tests function calling with the new format
3. `/api/ai/test-streaming` - Tests streaming with the new event types

## Additional Resources

- Reference our centralized state management documentation in `src/docs/DEVELOPMENT_GUIDELINES.md`
- See examples of the OpenAI Responses API in `src/lib/ai/openaiService.ts`

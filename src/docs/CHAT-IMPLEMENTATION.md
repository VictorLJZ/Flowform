# Chat Implementation for Sword Travel

## Overview

This document outlines the architecture and implementation details for the chat functionality in the Sword Travel application. The chat interface provides users with an AI assistant to help plan their trips, using OpenAI's Responses API.

## Component Structure

```
SessionChatPanel
├── ChatHeader
├── ChatMessageList
│   └── ChatMessageItem
│       ├── UserMessage
│       ├── AIMessage
│       │   └── StructuredContent (tool call outputs)
│       └── SystemMessage
├── ChatInput
└── ChatTypingIndicator
```

## Core Components

### SessionChatPanel
- Main container component for the chat interface
- Manages layout and component coordination
- Connects to the session chat store
- Handles chat history loading/pagination

### ChatMessageList
- Renders a scrollable list of chat messages
- Handles virtual scrolling for performance
- Implements auto-scroll behavior with user override
- Manages unread message indicators

### ChatMessageItem
- Renders individual messages with proper styling
- Displays user attribution for collaborative sessions
- Renders different message types (user, AI, system)
- Handles structured content from AI responses

### ChatInput
- Provides message composition interface
- Implements message sending functionality
- Shows typing indicators
- Provides message drafting/editing features

### ChatTypingIndicator
- Shows when the AI is generating a response
- Provides visual feedback during streaming responses
- Indicates when other users are typing (collaboration)

## State Management

The chat functionality uses the `session-chat-store.ts` for state management:

### Key State Elements
- `messages`: Array of chat messages
- `isLoadingMessages`: Loading state flag
- `messageError`: Error state for message operations
- `streamingMessage`: Currently streaming message (if any)
- `hasMoreMessages`: Pagination indicator

### Key Methods
- `loadMessages`: Fetches message history
- `sendUserMessage`: Sends a new user message
- `processAIResponse`: Handles AI response processing
- `updateStreamingMessage`: Updates message during streaming
- `finalizeStreamingMessage`: Completes a streaming message

## OpenAI Responses API Integration

Following the Sword Travel best practices for the OpenAI Responses API:

### Message Format
```typescript
const response = await openai.responses.create({
  model: "gpt-4o-mini",
  input: [{ role: "user", content: userMessageContent }]
});
```

### Developer Instructions
```typescript
// Using "developer" role instead of "system"
input.unshift({ 
  role: "developer", 
  content: TRAVEL_ASSISTANT_INSTRUCTIONS 
});
```

### Streaming Implementation
```typescript
// Handle typed events
for await (const event of stream) {
  if (event.type === "response.output_text.delta") {
    // Update streaming message with delta
  }
}
```

### Function Calling
```typescript
// Function calling format
tools: [{
  type: "function",
  name: "add_to_itinerary",
  description: "Add an event to the trip itinerary",
  parameters: { /* schema */ },
  strict: true
}]
```

## Real-time Collaboration

### Supabase Realtime Integration
- Subscribe to chat message changes through Supabase Realtime
- Show user attribution for each message
- Display typing indicators for other users
- Register subscriptions through the session context store

### Subscription Management
```typescript
useEffect(() => {
  const subscription = supabase
    .channel(`session-${sessionId}-chat`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'chat_messages' },
      handleNewMessage
    )
    .subscribe();
  
  // Register for automatic cleanup
  registerSubscription(sessionId, 'chat-messages', subscription);
  
  // No need to clean up - handled by SessionContainer
}, [sessionId, registerSubscription]);
```

## Accessibility Considerations

- Proper keyboard navigation
- ARIA attributes for screen readers
- Color contrast ratios for readability
- Focus management for new messages
- Notifications for screen reader users

## Error Handling

- Message send failures with retry options
- Connection loss recovery
- Graceful degradation when offline
- Clear error states with recovery options

## Performance Optimization

- Virtual scrolling for long chat histories
- Efficient re-render prevention
- Pagination for historical messages
- Image and content lazy loading
- Debounced typing indicators

## Type System Architecture

### Type Consolidation (Updated 2025-03-17)

Chat-related types have been consolidated and organized with clear inheritance patterns:

```
Database Layer (supabase.ts)
└── ChatMessageRow - Raw database structure with snake_case fields
    └── Chat UI Layer (chat.ts)
        └── ChatMessage - UI representation with both snake_case and camelCase fields
            └── ChatMessageWithUser - Enhanced UI message with user display info
```

### Type Responsibility Breakdown

#### Database Types (`supabase.ts`)
- Define the raw database tables and fields
- Use snake_case for field names (following PostgreSQL conventions)
- Include insert/update types for database operations
- Examples: `ChatMessageRow`, `ChatMessageInsert`, `ChatMessageUpdate`

#### UI Types (`chat.ts`)
- Add UI-specific properties like streaming status
- Provide both snake_case (for DB compatibility) and camelCase (for UI convenience)
- Handle structured data parsing (JSON to TypeScript objects)
- Include helper conversion functions
- Examples: `ChatMessage`, `ChatMessageWithUser`

### Conversion Functions

```typescript
// Database to UI conversion
export function chatMessageRowToMessage(row: ChatMessageRow): ChatMessage {
  // Logic to transform database row to UI message
}

// UI to Database conversion
export function chatMessageToInsert(message: ChatMessage): ChatMessageInsert {
  // Logic to prepare UI message for database insertion
}
```

### OpenAI API Type Structure

OpenAI Responses API types have been centralized in chat.ts:

```typescript
// Streaming event types
export type OpenAIStreamEvent = /* ... */;
export type OpenAIStreamItem = /* ... */;
export interface StreamingStatus { /* ... */ }

// Function calling types
export interface ToolCall { /* ... */ }
export interface ContentBlock { /* ... */ }
export interface OpenAITool { /* ... */ }

// UI representation
export interface MessageSegment { /* ... */ }
```

See the detailed documentation in `/src/types/TypeRelationships.md`.

## Future Enhancements

- Message search functionality
- File/image sharing capabilities
- Voice input options
- Message reactions/emojis
- Message threading for complex discussions
- Offline queue mechanism for disconnection handling
- Performance optimization with message virtualization
- Chunked rendering for complex messages


Offline Queue Mechanism (highest value for user experience)
Message Rendering Optimizations (improves performance as chat history grows)
Network Status Management (enhances reliability)
Error Handling Enhancements (improves resilience)
Unit Test Suite (ensures stability)
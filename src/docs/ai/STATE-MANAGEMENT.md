# AI State Management

## Overview

The Sword Travel application uses a hybrid Zustand-Supabase architecture for state management, following the principles of optimistic UI updates and proper session containerization. This document details how the AI functionality integrates with this architecture.

## Zustand Store Integration

The AI functionality is integrated with our Zustand stores to manage chat state, tool execution, and user preferences:

```typescript
// src/store/session-chat-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { 
  ChatMessage, 
  ChatMessageRow, 
  MessageSegment, 
  ToolCall 
} from '../types/chat';

interface SessionChatState {
  // Message state
  messages: Record<string, ChatMessage[]>;
  currentSessionId: string | null;
  currentUser: { id: string; email: string } | null;
  
  // AI state
  pendingToolCalls: Record<string, ToolCall[]>;
  
  // Session management
  getRecentMessages: (sessionId: string, limit?: number) => ChatMessage[];
  getMessageById: (messageId: string) => ChatMessage | undefined;
  
  // Message actions
  addUserMessage: (message: Omit<ChatMessageRow, 'id'>) => Promise<string>;
  addStreamingMessage: (message: ChatMessage) => void;
  updateStreamingMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  finalizeStreamingMessage: (messageId: string) => Promise<void>;
  
  // Tool call actions
  updateToolCall: (messageId: string, toolCallId: string, updates: Partial<ToolCall>) => void;
  rerunToolCall: (messageId: string, toolCallId: string, newArgs?: any) => Promise<void>;
  
  // Supabase sync
  syncMessagesToSupabase: (sessionId: string) => Promise<void>;
  
  // Itinerary management
  updateItinerary: (sessionId: string, updater: (itinerary: any) => any) => void;
  syncItineraryToSupabase: (sessionId: string) => Promise<void>;
}

export const useSessionChatStore = create<SessionChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: {},
      currentSessionId: null,
      currentUser: null,
      pendingToolCalls: {},
      
      // Get recent messages for context window
      getRecentMessages: (sessionId, limit = 15) => {
        const allMessages = get().messages[sessionId] || [];
        return allMessages.slice(-limit);
      },
      
      // Get specific message by ID
      getMessageById: (messageId) => {
        const allSessions = Object.values(get().messages).flat();
        return allSessions.find(msg => msg.id === messageId);
      },
      
      // Add user message
      addUserMessage: async (message) => {
        const messageId = `msg_${Date.now()}`;
        const sessionId = message.session_id;
        
        // Create full message object
        const fullMessage: ChatMessage = {
          ...message,
          id: messageId,
          timestampDate: new Date(message.timestamp),
          createdAtDate: new Date()
        };
        
        // Optimistic update to Zustand
        set(state => ({
          messages: {
            ...state.messages,
            [sessionId]: [
              ...(state.messages[sessionId] || []),
              fullMessage
            ]
          }
        }));
        
        // Sync to Supabase
        try {
          const { data, error } = await supabase
            .from('chat_messages')
            .insert({
              id: messageId,
              session_id: sessionId,
              user_id: message.user_id,
              role: message.role,
              content: message.content,
              timestamp: message.timestamp
            })
            .select()
            .single();
            
          if (error) throw error;
        } catch (error) {
          console.error('Error syncing message to Supabase:', error);
        }
        
        return messageId;
      },
      
      // Add streaming message placeholder
      addStreamingMessage: (message) => {
        const sessionId = message.session_id;
        
        set(state => ({
          messages: {
            ...state.messages,
            [sessionId]: [
              ...(state.messages[sessionId] || []),
              {
                ...message,
                timestampDate: new Date(message.timestamp),
                createdAtDate: new Date()
              }
            ]
          }
        }));
      },
      
      // Update streaming message content
      updateStreamingMessage: (messageId, updates) => {
        set(state => {
          // Find the session containing this message
          const sessionId = Object.keys(state.messages).find(sessionId =>
            state.messages[sessionId].some(msg => msg.id === messageId)
          );
          
          if (!sessionId) return state;
          
          return {
            messages: {
              ...state.messages,
              [sessionId]: state.messages[sessionId].map(msg =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              )
            }
          };
        });
      },
      
      // Finalize streaming message
      finalizeStreamingMessage: async (messageId) => {
        const state = get();
        const message = state.getMessageById(messageId);
        
        if (!message) return;
        
        // Update streaming status
        state.updateStreamingMessage(messageId, {
          streamingStatus: { isStreaming: false }
        });
        
        // Sync to Supabase
        try {
          const { error } = await supabase
            .from('chat_messages')
            .insert({
              id: message.id,
              session_id: message.session_id,
              role: message.role,
              content: message.content,
              timestamp: message.timestamp,
              tool_calls: message.toolCalls?.length ? 
                message.toolCalls.map(tc => ({
                  id: tc.id,
                  name: tc.name,
                  arguments: tc.arguments,
                  output: tc.output,
                  status: tc.status,
                  error: tc.error
                })) : 
                null
            });
            
          if (error) throw error;
        } catch (error) {
          console.error('Error finalizing message in Supabase:', error);
        }
      },
      
      // Update tool call status
      updateToolCall: (messageId, toolCallId, updates) => {
        set(state => {
          // Find the message containing this tool call
          const message = state.getMessageById(messageId);
          
          if (!message || !message.toolCalls) return state;
          
          // Find the session for this message
          const sessionId = message.session_id;
          
          return {
            messages: {
              ...state.messages,
              [sessionId]: state.messages[sessionId].map(msg =>
                msg.id === messageId ? {
                  ...msg,
                  toolCalls: msg.toolCalls?.map(tc =>
                    tc.id === toolCallId ? { ...tc, ...updates } : tc
                  )
                } : msg
              )
            }
          };
        });
      },
      
      // Rerun a tool call with new arguments
      rerunToolCall: async (messageId, toolCallId, newArgs) => {
        const state = get();
        const message = state.getMessageById(messageId);
        
        if (!message || !message.toolCalls) return;
        
        // Find the tool call
        const toolCall = message.toolCalls.find(tc => tc.id === toolCallId);
        if (!toolCall) return;
        
        // Update status to pending
        state.updateToolCall(messageId, toolCallId, {
          status: 'pending',
          ...(newArgs ? { arguments: JSON.stringify(newArgs) } : {})
        });
        
        try {
          // Re-execute the tool
          const args = newArgs || JSON.parse(toolCall.arguments);
          const { executeToolWithRetry } = await import('../lib/ai/tool-helpers');
          
          const result = await executeToolWithRetry(
            toolCall.name,
            args
          );
          
          // Update with result
          state.updateToolCall(messageId, toolCallId, {
            output: result,
            status: 'complete',
            error: undefined
          });
          
          // Sync to Supabase
          await state.syncMessagesToSupabase(message.session_id);
          
          return result;
        } catch (error) {
          console.error('Error rerunning tool:', error);
          
          state.updateToolCall(messageId, toolCallId, {
            error: error.message,
            status: 'error'
          });
          
          throw error;
        }
      },
      
      // Sync messages to Supabase
      syncMessagesToSupabase: async (sessionId) => {
        const messages = get().messages[sessionId] || [];
        
        // Only sync non-streaming messages
        const completedMessages = messages.filter(
          msg => !msg.streamingStatus?.isStreaming
        );
        
        for (const message of completedMessages) {
          try {
            // Skip messages already in Supabase
            const { data } = await supabase
              .from('chat_messages')
              .select('id')
              .eq('id', message.id)
              .single();
              
            if (data) continue;
            
            // Insert new message
            const { error } = await supabase
              .from('chat_messages')
              .insert({
                id: message.id,
                session_id: message.session_id,
                role: message.role,
                content: message.content,
                timestamp: message.timestamp,
                tool_calls: message.toolCalls?.length ? 
                  message.toolCalls.map(tc => ({
                    id: tc.id,
                    name: tc.name,
                    arguments: tc.arguments,
                    output: tc.output,
                    status: tc.status,
                    error: tc.error
                  })) : 
                  null
              });
              
            if (error) throw error;
          } catch (error) {
            console.error('Error syncing message to Supabase:', error);
          }
        }
      },
      
      // Itinerary management (simplified)
      updateItinerary: (sessionId, updater) => {
        // Implementation omitted for brevity
      },
      
      syncItineraryToSupabase: async (sessionId) => {
        // Implementation omitted for brevity
      }
    }),
    {
      name: 'session-chat-store',
      partialize: (state) => ({
        currentSessionId: state.currentSessionId,
        currentUser: state.currentUser,
      })
    }
  )
);
```

## Database Schema

The Supabase database schema supports our AI functionality:

```sql
-- Chat messages table
create table chat_messages (
  id text primary key,
  session_id text not null references sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  timestamp timestamptz not null,
  created_at timestamptz not null default now(),
  tool_calls jsonb,
  segments jsonb,
  processing_metadata jsonb
);

-- Tool executions table for analytics
create table tool_executions (
  id uuid primary key default uuid_generate_v4(),
  message_id text not null references chat_messages(id) on delete cascade,
  tool_name text not null,
  arguments jsonb not null,
  result jsonb,
  error text,
  execution_time_ms integer,
  created_at timestamptz not null default now()
);

-- User preferences table
create table user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  travel_preferences jsonb default '{}'::jsonb,
  notification_preferences jsonb default '{}'::jsonb,
  ui_preferences jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Create RLS policies for secure access
alter table chat_messages enable row level security;
create policy "Users can view their own messages"
  on chat_messages for select
  using (auth.uid() = user_id or exists (
    select 1 from sessions
    where sessions.id = chat_messages.session_id
    and sessions.user_id = auth.uid()
  ));
```

## Optimistic Updates Pattern

We follow the optimistic updates pattern for all AI interactions:

1. **Immediate UI Updates**: Update Zustand state immediately
2. **Background Persistence**: Sync to Supabase asynchronously
3. **Error Handling**: Roll back changes if persistence fails
4. **Conflict Resolution**: Handle concurrent updates gracefully

```typescript
// Example of optimistic update with rollback
const optimisticUpdate = async (action: () => void, persistFunc: () => Promise<void>) => {
  // Store previous state for rollback
  const previousState = { ...get() };
  
  try {
    // Update state immediately
    action();
    
    // Persist changes
    await persistFunc();
  } catch (error) {
    console.error('Error persisting changes:', error);
    
    // Roll back to previous state
    set(previousState);
    
    throw error;
  }
};
```

## Message Context Management

We maintain conversation context using the Responses API state management:

```typescript
// src/lib/ai/context-manager.ts
import { useSessionChatStore } from '../../store/session-chat-store';
import { sendAIRequest } from './openai-client';

export async function getUserContextForSession(sessionId: string): Promise<any> {
  const store = useSessionChatStore.getState();
  const recentMessages = store.getRecentMessages(sessionId, 15);
  
  // If we have a previous responseId, use the built-in state management
  const lastAssistantMessage = recentMessages
    .filter(m => m.role === 'assistant')
    .pop();
    
  const responseId = lastAssistantMessage?.processingMetadata?.responseId;
  
  if (responseId) {
    // Use Responses API state management
    return {
      previous_response_id: responseId,
      useApiStateManagement: true
    };
  }
  
  // Otherwise, provide the full conversation history
  return {
    messages: recentMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })),
    useApiStateManagement: false
  };
}

// When continuing a conversation
const continueConversation = async (sessionId: string, userMessage: string) => {
  const context = await getUserContextForSession(sessionId);
  
  if (context.useApiStateManagement) {
    // Use OpenAI's built-in state management
    return sendAIRequest({
      previous_response_id: context.previous_response_id,
      input: [{ role: 'user', content: userMessage }],
      store: true
    });
  } else {
    // Provide full context manually
    return sendAIRequest({
      input: [
        { role: 'developer', content: ASSISTANT_INSTRUCTIONS },
        ...context.messages,
        { role: 'user', content: userMessage }
      ],
      store: true
    });
  }
};
```

## Offline Support

We implement offline queuing for tool executions:

```typescript
// src/lib/ai/offline-queue.ts
import { openDB, DBSchema } from 'idb';

interface ToolExecutionQueue extends DBSchema {
  pendingExecutions: {
    key: string;
    value: {
      id: string;
      messageId: string;
      toolName: string;
      args: any;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

// Open IndexedDB for offline queue
const dbPromise = openDB<ToolExecutionQueue>('tool-execution-queue', 1, {
  upgrade(db) {
    const store = db.createObjectStore('pendingExecutions', {
      keyPath: 'id'
    });
    store.createIndex('by-timestamp', 'timestamp');
  }
});

// Queue tool execution for offline processing
export async function queueToolExecution(
  messageId: string,
  toolName: string,
  args: any
): Promise<string> {
  const db = await dbPromise;
  const id = `exec_${Date.now()}`;
  
  await db.add('pendingExecutions', {
    id,
    messageId,
    toolName,
    args,
    timestamp: Date.now()
  });
  
  return id;
}

// Process pending tool executions when online
export async function processPendingExecutions(): Promise<void> {
  const db = await dbPromise;
  const tx = db.transaction('pendingExecutions', 'readwrite');
  const index = tx.store.index('by-timestamp');
  
  let cursor = await index.openCursor();
  const { executeToolWithRetry } = await import('./tool-helpers');
  const store = useSessionChatStore.getState();
  
  while (cursor) {
    const execution = cursor.value;
    
    try {
      // Execute pending tool
      const result = await executeToolWithRetry(
        execution.toolName,
        execution.args
      );
      
      // Update tool call with result
      store.updateToolCall(execution.messageId, execution.id, {
        output: result,
        status: 'complete'
      });
      
      // Remove from queue
      await cursor.delete();
    } catch (error) {
      console.error('Error processing offline execution:', error);
      
      // Update with error
      store.updateToolCall(execution.messageId, execution.id, {
        error: error.message,
        status: 'error'
      });
      
      // Remove from queue
      await cursor.delete();
    }
    
    cursor = await cursor.continue();
  }
  
  await tx.done;
}

// Register online/offline listeners
export function setupOfflineSync() {
  window.addEventListener('online', async () => {
    console.log('Back online, processing pending executions');
    await processPendingExecutions();
  });
}
```

## User Preference Integration

User preferences are integrated into AI requests:

```typescript
// src/lib/ai/preference-manager.ts
import { supabase } from '../supabase';
import { useSessionChatStore } from '../../store/session-chat-store';

export async function getUserPreferences(userId: string) {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('user_preferences')
    .select('travel_preferences')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
  
  return data?.travel_preferences || {};
}

export function injectUserPreferences(input: any[], userId: string | null) {
  if (!userId) return input;
  
  // Find developer message to augment
  const developerMessageIndex = input.findIndex(m => m.role === 'developer');
  
  if (developerMessageIndex === -1) return input;
  
  // Clone input to avoid mutating original
  const newInput = [...input];
  
  // Add user preferences to developer message
  getUserPreferences(userId).then(preferences => {
    if (!preferences) return;
    
    const developerMessage = newInput[developerMessageIndex];
    newInput[developerMessageIndex] = {
      ...developerMessage,
      content: `${developerMessage.content}\n\nUser Preferences: ${JSON.stringify(preferences, null, 2)}`
    };
  });
  
  return newInput;
}
```

## Session Containerization

We implement proper session containerization for AI:

```typescript
// src/components/session/SessionContainer.tsx
import { useEffect, useRef } from 'react';
import { useSessionChatStore } from '../../store/session-chat-store';
import { initializeToolRegistry } from '../../lib/ai/initialize';
import { setupOfflineSync } from '../../lib/ai/offline-queue';

export const SessionContainer: React.FC<{
  sessionId: string;
  children: React.ReactNode;
}> = ({ sessionId, children }) => {
  const subscriptionsRef = useRef<(() => void)[]>([]);
  
  useEffect(() => {
    // 1. Set current session in store
    useSessionChatStore.getState().setCurrentSession(sessionId);
    
    // 2. Initialize AI tools
    initializeToolRegistry();
    
    // 3. Setup offline sync
    setupOfflineSync();
    
    // 4. Subscribe to real-time updates
    const chatSubscription = supabase
      .channel(`session:${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${sessionId}`
      }, payload => {
        const store = useSessionChatStore.getState();
        if (payload.new.user_id !== store.currentUser?.id) {
          // Message from another user, add to state
          store.addRemoteMessage(payload.new);
        }
      })
      .subscribe();
      
    subscriptionsRef.current.push(() => chatSubscription.unsubscribe());
    
    // Clean up all subscriptions
    return () => {
      subscriptionsRef.current.forEach(unsub => unsub());
      subscriptionsRef.current = [];
    };
  }, [sessionId]);
  
  return <>{children}</>;
};
```

## Performance Optimizations

We implement several optimizations for AI state management:

1. **Surgical State Subscriptions**: Components only subscribe to needed state slices
2. **Memoized Selectors**: Create specialized selectors to avoid re-renders
3. **Message Virtualization**: Only render visible messages
4. **Chunked Rendering**: Batch UI updates for streaming

Example of surgical state subscription:

```tsx
// Inefficient - subscribes to all changes
const messages = useSessionChatStore(state => state.messages[sessionId]);

// Efficient - only subscribes to specific session messages
const sessionMessages = useSessionChatStore(state => state.messages[sessionId] || []);

// More efficient - creates a memoized selector
const useSessionMessages = (sessionId: string) => 
  useSessionChatStore(state => state.messages[sessionId] || []);
```

## Analytics and Monitoring

We track AI and tool usage for optimization:

```typescript
// src/lib/analytics/ai-tracker.ts
import { supabase } from '../supabase';

export async function trackToolExecution(
  messageId: string,
  toolName: string,
  args: any,
  result: any,
  error: string | null,
  executionTimeMs: number
) {
  try {
    await supabase
      .from('tool_executions')
      .insert({
        message_id: messageId,
        tool_name: toolName,
        arguments: args,
        result,
        error,
        execution_time_ms: executionTimeMs
      });
  } catch (e) {
    console.error('Failed to track tool execution:', e);
  }
}

export async function trackAIInteraction(
  sessionId: string,
  messageCount: number,
  toolCallCount: number,
  processingTimeMs: number
) {
  try {
    await supabase
      .from('ai_interactions')
      .insert({
        session_id: sessionId,
        message_count: messageCount,
        tool_call_count: toolCallCount,
        processing_time_ms: processingTimeMs
      });
  } catch (e) {
    console.error('Failed to track AI interaction:', e);
  }
}
```

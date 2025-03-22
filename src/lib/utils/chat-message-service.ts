import { createClient } from '@/lib/supabase/client';
import type { 
  ChatMessageRow, 
  ChatMessageInsert, 
  ChatMessageUpdate 
} from '@/types/supabase';
import { ChatMessage, ToolCall } from '@/types/chat';

/**
 * Chat Message Service
 * 
 * Handles all database interactions for chat messages following the Single Responsibility Principle.
 * This removes API communication from the Zustand stores, making them cleaner and more testable.
 */
export const chatMessageService = {
  /**
   * Load messages for a chat session with pagination
   */
  async loadMessages(
    sessionId: string, 
    page: number = 1, 
    messagesPerPage: number = 20
  ): Promise<{ 
    messages: ChatMessageRow[], 
    hasMore: boolean, 
    total: number 
  }> {
    const isFirstPage = page === 1;
    const from = (page - 1) * messagesPerPage;
    
    try {
      const supabase = createClient();
      
      const { data, error, count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })
        .range(from, from + messagesPerPage - 1);
        
      if (error) throw error;
      
      // Process the tool_calls JSONB field for each message
      const processedMessages = (data as ChatMessageRow[]).map(message => {
        // Add diagnostic logs for tool_calls format
        console.log('[CHAT-MESSAGE-SERVICE] Processing message tool calls:', { 
          messageId: message.id,
          hasToolCalls: !!message.tool_calls,
          toolCallsType: typeof message.tool_calls,
          toolCallsIsArray: Array.isArray(message.tool_calls)
        });
        
        // Process tool_calls only if they exist
        if (message.tool_calls) {
          // Force tool_calls to be proper JSON if it's a string (some DB drivers return JSONB as string)
          if (typeof message.tool_calls === 'string') {
            try {
              message.tool_calls = JSON.parse(message.tool_calls as unknown as string);
            } catch (e) {
              console.error('[CHAT-MESSAGE-SERVICE] Error parsing tool_calls string:', e);
              message.tool_calls = null;
            }
          }
        }
        
        return message;
      });
      
      const hasMore = count ? from + messagesPerPage < count : false;
      
      return {
        messages: processedMessages,
        hasMore,
        total: count || 0
      };
    } catch (error) {
      console.error('Error loading messages:', error);
      throw error;
    }
  },
  
  /**
   * Save a new user message to the database
   */
  async saveUserMessage(
    sessionId: string,
    userId: string | null,
    content: string,
    displayName: string | null = null
  ): Promise<ChatMessageRow> {
    try {
      const supabase = createClient();
      const timestamp = new Date().toISOString();
      
      const newMessage: ChatMessageInsert = {
        session_id: sessionId,
        user_id: userId,
        content,
        role: 'user',
        timestamp,
        user_display_name: displayName,
      };
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(newMessage)
        .select('*')
        .single();
        
      if (error) throw error;
      
      return data as ChatMessageRow;
    } catch (error) {
      console.error('Error saving user message:', error);
      throw error;
    }
  },
  
  /**
   * Create a placeholder assistant message for streaming
   */
  async createAssistantMessagePlaceholder(
    sessionId: string
  ): Promise<ChatMessageRow> {
    try {
      const supabase = createClient();
      const timestamp = new Date().toISOString();
      
      const assistantMessage: ChatMessageInsert = {
        session_id: sessionId,
        user_id: null, // AI message
        content: "", // Will be populated during streaming
        role: 'assistant',
        timestamp
      };
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(assistantMessage)
        .select('*')
        .single();
        
      if (error) throw error;
      
      return data as ChatMessageRow;
    } catch (error) {
      console.error('Error creating assistant message placeholder:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing message content and tool calls
   */
  async updateMessage(
    messageId: string,
    updates: Partial<ChatMessageUpdate>
  ): Promise<ChatMessageRow> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('chat_messages')
        .update(updates)
        .eq('id', messageId)
        .select('*')
        .single();
        
      if (error) throw error;
      
      return data as ChatMessageRow;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  },
  
  /**
   * Finalize an assistant message after streaming completes
   */
  async finalizeAssistantMessage(
    messageId: string,
    content: string,
    toolCalls: ToolCall[] | null = null
  ): Promise<ChatMessageRow> {
    try {
      // Add diagnostic logs to track tool calls
      console.log('[CHAT-MESSAGE-SERVICE] Finalizing message with tool calls:', { 
        messageId, 
        toolCallsPresent: !!toolCalls,
        toolCallsCount: toolCalls?.length || 0,
        toolCallsArray: Array.isArray(toolCalls)
      });

      if (toolCalls && toolCalls.length > 0) {
        console.log('[CHAT-MESSAGE-SERVICE] Sample tool call:', JSON.stringify(toolCalls[0]));
      }

      // Ensure tool_calls is stored as proper JSONB
      let formattedToolCalls = null;
      
      if (toolCalls && toolCalls.length > 0) {
        // Make sure each tool call has the required properties
        formattedToolCalls = toolCalls.map(tc => ({
          call_id: tc.call_id || `call_${Date.now()}`,
          name: tc.name,
          // Ensure we have a string representation of arguments
          arguments: typeof tc.arguments === 'string' ? tc.arguments : JSON.stringify({})
        }));
      }
      
      console.log('[CHAT-MESSAGE-SERVICE] Storing formatted tool calls:', {
        isArray: Array.isArray(formattedToolCalls),
        length: formattedToolCalls?.length || 0,
        sample: formattedToolCalls?.[0] ? JSON.stringify(formattedToolCalls[0]) : 'none'
      });

      // Explicitly prepare the update object to control JSONB handling
      const updates: Partial<ChatMessageUpdate> = {
        content: content
      };
      
      // Only include tool_calls if they're not null
      if (formattedToolCalls !== null) {
        updates.tool_calls = formattedToolCalls;
      }
      
      const result = await this.updateMessage(messageId, updates);

      // Check the result
      console.log('[CHAT-MESSAGE-SERVICE] Message updated, tool_calls in result:', {
        resultHasToolCalls: !!result.tool_calls,
        resultToolCallsType: typeof result.tool_calls,
        resultToolCallsIsArray: Array.isArray(result.tool_calls),
        resultToolCallsLength: Array.isArray(result.tool_calls) ? result.tool_calls.length : 'N/A'
      });

      return result;
    } catch (error) {
      console.error('Error finalizing assistant message:', error);
      throw error;
    }
  },
  
  /**
   * Delete a message from the database
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
};

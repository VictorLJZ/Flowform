import { createClient } from '@/lib/supabase/client';
import OpenAI from 'openai';
import { searchSimilarConversations, ConversationResult } from './searchVectorDb';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * RAG System Prompt template for analytics insights
 */
const RAG_SYSTEM_PROMPT = `
You are an analytics assistant for form creators using Flowform. Your task is to help form owners understand patterns in their form responses, particularly from AI conversation blocks.

I'll provide you with relevant form responses based on the user's question. Use ONLY the information provided to answer their questions. If the information isn't in the provided context, admit that you don't know rather than guessing.

Focus on identifying:
1. Common themes and patterns
2. Unusual or standout responses
3. Quantitative insights when possible
4. Actionable suggestions for the form creator
`;

/**
 * Format retrieved conversations into a context string for the LLM
 * 
 * @param conversations Array of conversation results
 * @returns Formatted context string
 */
function formatContextFromConversations(conversations: ConversationResult[]): string {
  return conversations.map((conversation, index) => {
    return `[Conversation ${index + 1} (Relevance: ${Math.round(conversation.similarity * 100)}%)]\n${conversation.conversation_text}`;
  }).join('\n\n');
}

/**
 * Generate chat response using RAG approach with retrieved contexts
 * 
 * @param query User's question
 * @param formId Form ID to search within
 * @returns AI-generated response based on retrieved contexts
 */
export async function generateRagResponse(
  query: string,
  formId: string
): Promise<string> {
  try {
    // Search for relevant conversations
    const conversations = await searchSimilarConversations(query, formId, 5);
    
    if (!conversations || conversations.length === 0) {
      return "I couldn't find any relevant form responses to answer your question. This might be because there aren't enough responses yet, or the responses don't contain information related to your question.";
    }
    
    // Format context from retrieved conversations
    const context = formatContextFromConversations(conversations);
    
    // Generate response using OpenAI Responses API with the context
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: [
        { role: "developer", content: RAG_SYSTEM_PROMPT },
        { role: "user", content: `CONTEXT:\n${context}\n\nQUESTION:\n${query}` }
      ]
    });
    
    return response.output_text;
  } catch (error) {
    console.error('Error generating RAG response:', error);
    throw new Error('Failed to generate insights from form responses');
  }
}

/**
 * Create a new chat session for a form
 * 
 * @param formId Form ID
 * @param userId User ID
 * @returns The created session ID
 */
export async function createChatSession(
  formId: string,
  userId: string
): Promise<string> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        form_id: formId,
        user_id: userId
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error('Failed to create chat session:', error);
    throw new Error('Failed to create chat session');
  }
}

/**
 * Save a chat message to the database
 * 
 * @param sessionId Chat session ID
 * @param role Message role (user/assistant)
 * @param content Message content
 * @returns The created message ID
 */
export async function saveChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<string> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error('Failed to save chat message:', error);
    throw new Error('Failed to save chat message');
  }
}

/**
 * Get messages for a chat session
 * 
 * @param sessionId Chat session ID
 * @returns Array of chat messages
 */
export async function getChatMessages(sessionId: string): Promise<Array<{
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}>> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch chat messages:', error);
    throw new Error('Failed to fetch chat messages');
  }
} 
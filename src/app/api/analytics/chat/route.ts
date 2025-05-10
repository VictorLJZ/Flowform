import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OpenAI } from 'openai';
import { OpenAIMessage, OpenAIResponsesOptions } from '@/types/ai-types';
import { generateRagResponse } from '@/services/ai/ragService';
import { searchSimilarConversations } from '@/services/ai/searchVectorDb';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
 */
function formatContextFromConversations(conversations: any[]): string {
  return conversations.map((conversation, index) => {
    return `[Conversation ${index + 1} (Relevance: ${Math.round(conversation.similarity * 100)}%)]\n${conversation.conversation_text}`;
  }).join('\n\n');
}

/**
 * POST handler for chat API
 * Creates a new message and generates a response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, query, sessionId } = body;
    
    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // Create supabase server client
    const supabase = await createClient();
    
    // Get user ID from session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let chatSessionId = sessionId;
    
    // If no session ID provided, create a new session
    if (!chatSessionId) {
      const defaultTitle = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          form_id: formId,
          user_id: user.id,
          title: defaultTitle,
          last_message: query
        })
        .select('id')
        .single();
      
      if (sessionError) {
        console.error('Error creating chat session:', sessionError);
        return NextResponse.json({ error: sessionError.message }, { status: 500 });
      }
      
      chatSessionId = newSession.id;
    } else {
      // If session ID provided, verify it belongs to this user and update last_message
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({ last_message: query })
        .eq('id', chatSessionId)
        .eq('user_id', user.id);
      
      if (updateError) {
        console.error('Error updating chat session:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }
    
    // Save the user message
    const { error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: chatSessionId,
        role: 'user',
        content: query
      });
    
    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
      return NextResponse.json({ error: userMessageError.message }, { status: 500 });
    }
    
    // Fetch form details
    const { data: formData, error: formError } = await supabase
      .from('forms')
      .select('title')
      .eq('form_id', formId)
      .single();
    
    if (formError) {
      console.error('Error fetching form data:', formError);
      return NextResponse.json({ error: formError.message }, { status: 500 });
    }
    
    // Get existing messages for context
    const { data: previousMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', chatSessionId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error('Error fetching previous messages:', messagesError);
      return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }
    
    // RAG Implementation: Search for relevant conversations
    let aiResponse = '';
    try {
      // Option 1: Use the dedicated RAG service
      aiResponse = await generateRagResponse(query, formId);
    } catch (ragError) {
      console.error('Error with RAG service, using fallback method:', ragError);
      
      try {
        // Option 2: Fallback - implement RAG directly
        const conversations = await searchSimilarConversations(query, formId, 5);
        
        if (!conversations || conversations.length === 0) {
          aiResponse = "I couldn't find any relevant form responses to answer your question. This might be because there aren't enough responses yet, or the responses don't contain information related to your question.";
        } else {
          // Format messages for OpenAI following the Responses API format
          const inputMessages: OpenAIMessage[] = [];
          
          // Add developer message (system message in the new format)
          inputMessages.push({
            role: "developer", 
            content: RAG_SYSTEM_PROMPT
          });
          
          // Add conversation history for context
          for (const msg of previousMessages) {
            // Ensure role is one of the accepted types
            const role = msg.role === 'user' ? 'user' : 'assistant';
            inputMessages.push({
              role,
              content: msg.content
            });
          }
          
          // Add the context and current query
          const context = formatContextFromConversations(conversations);
          inputMessages.push({
            role: 'user',
            content: `CONTEXT:\n${context}\n\nQUESTION:\n${query}`
          });
          
          // Generate response using OpenAI Responses API
          const requestOptions: OpenAIResponsesOptions = {
            model: "gpt-4o",
            input: inputMessages,
            store: true
          };
          
          const response = await openai.responses.create(requestOptions as any);
          aiResponse = response.output_text;
        }
      } catch (fallbackError) {
        console.error('Fallback RAG implementation failed:', fallbackError);
        aiResponse = "I'm having trouble accessing form response data to answer your question. Please try again later.";
      }
    }
    
    // Save the assistant response
    const { error: assistantMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: chatSessionId,
        role: 'assistant',
        content: aiResponse
      });
    
    if (assistantMessageError) {
      console.error('Error saving assistant message:', assistantMessageError);
      return NextResponse.json({ error: assistantMessageError.message }, { status: 500 });
    }
    
    return NextResponse.json({
      sessionId: chatSessionId,
      response: aiResponse
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to process chat' 
    }, { status: 500 });
  }
}

/**
 * GET handler for chat API
 * Retrieves chat messages for a session
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }
  
  try {
    // Create supabase server client
    const supabase = await createClient();
    
    // Get user ID from session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // First verify the session belongs to this user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // Get messages for this session
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching chat messages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to load chat messages' 
    }, { status: 500 });
  }
} 
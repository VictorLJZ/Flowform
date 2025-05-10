import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRagResponse } from '@/services/ai/ragService';

// Define a type for the chat response
interface ChatResponseWithState {
  sessionId: string;
  response: string;
  response_id?: string;
  usedRAG?: boolean;
}

/**
 * POST handler for chat API
 * Creates a new message and generates a response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, query, sessionId, previous_response_id } = body;
    
    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // Create supabase server client
    const supabase = await createClient();
    
    // Get user ID from session
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
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
          user_id: userData.user.id,
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
        .eq('user_id', userData.user.id);
      
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
    
    // Fetch previous response_id from the session if not provided
    let responseId = previous_response_id;
    if (!responseId && chatSessionId) {
      const { data: sessionData, error: sessionFetchError } = await supabase
        .from('chat_sessions')
        .select('last_response_id')
        .eq('id', chatSessionId)
        .single();
      
      if (!sessionFetchError && sessionData?.last_response_id) {
        responseId = sessionData.last_response_id;
      }
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
    
    // Generate RAG response with the new tool-based approach
    let aiResponse = '';
    let newResponseId: string | undefined;
    let usedRAG = false;
    
    try {
      // Using the updated generateRagResponse function with previous messages context
      // and optional response ID for conversation continuity
      const responseResult = await generateRagResponse(
        query, 
        formId,
        previousMessages,
        responseId
      );
      
      aiResponse = responseResult.text;
      newResponseId = responseResult.id;
      usedRAG = responseResult.usedRAG || false;
        
      // Store the response ID in the session for future continuity
      if (newResponseId) {
        await supabase
          .from('chat_sessions')
          .update({ last_response_id: newResponseId })
          .eq('id', chatSessionId);
      }
    } catch (ragError) {
      console.error('Error with RAG service:', ragError);
      
      // Simplified fallback
      aiResponse = "I'm having trouble accessing form response data to answer your question. Please try again later.";
      usedRAG = false;
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
    
    // Return session ID, response, and response ID if available
    const responseObject: ChatResponseWithState = {
      sessionId: chatSessionId,
      response: aiResponse,
      usedRAG: usedRAG
    };
    
    if (newResponseId) {
      responseObject.response_id = newResponseId;
    }
    
    return NextResponse.json(responseObject);
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
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // First verify the session belongs to this user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userData.user.id)
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
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET endpoint to fetch all sessions for a form
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const formId = searchParams.get('formId');
  
  if (!formId) {
    return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
  }
  
  try {
    // Create supabase server client
    const supabase = await createClient();
    
    // Get user ID from session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get chat sessions for this form
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at, last_message, updated_at')
      .eq('form_id', formId)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching chat sessions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Map to SessionInfo format
    const formattedSessions = sessions.map((session: { id: string; title: string; created_at: string; updated_at: string; last_message?: string }) => ({
      id: session.id,
      title: session.title || new Date(session.created_at).toLocaleDateString(),
      created_at: session.created_at,
      updated_at: session.updated_at,
      last_message: session.last_message
    }));
    
    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to load chat sessions' 
    }, { status: 500 });
  }
}

// POST endpoint to create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId } = body;
    
    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }
    
    // Create supabase server client
    const supabase = await createClient();
    
    // Get user ID from session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Generate a default title (formatted date)
    const defaultTitle = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Create a new chat session
    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({
        form_id: formId,
        user_id: user.id,
        title: defaultTitle
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating chat session:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create chat session' 
    }, { status: 500 });
  }
} 
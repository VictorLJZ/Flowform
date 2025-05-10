import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE endpoint to clear all sessions for a form
export async function DELETE(request: NextRequest) {
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
    
    // First get all session IDs for this form
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('form_id', formId)
      .eq('user_id', user.id);
    
    if (sessionsError) {
      return NextResponse.json({ error: sessionsError.message }, { status: 500 });
    }
    
    const sessionIds = sessions.map(s => s.id);
    
    // Delete all messages for these sessions
    if (sessionIds.length > 0) {
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .in('session_id', sessionIds);
      
      if (messagesError) {
        return NextResponse.json({ error: messagesError.message }, { status: 500 });
      }
    }
    
    // Then delete all sessions
    const { error: deleteError } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('form_id', formId)
      .eq('user_id', user.id);
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to clear chat sessions' 
    }, { status: 500 });
  }
} 
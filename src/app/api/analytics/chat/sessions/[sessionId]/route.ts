import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE endpoint to delete a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> | { sessionId: string } }
) {
  // Next.js 15 pattern for handling dynamic route params - we need to await the params object
  const resolvedParams = 'then' in params ? await params : params;
  const { sessionId } = resolvedParams;
  
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
    
    // First delete associated messages
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', sessionId);
    
    if (messagesError) {
      console.error('Error deleting chat messages:', messagesError);
      return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }
    
    // Then delete the session
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting chat session:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete chat session' 
    }, { status: 500 });
  }
}

// PATCH endpoint to update session metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> | { sessionId: string } }
) {
  // Next.js 15 pattern for handling dynamic route params - we need to await the params object
  const resolvedParams = 'then' in params ? await params : params;
  const { sessionId } = resolvedParams;
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }
  
  try {
    const body = await request.json();
    const { title, last_message } = body;
    
    // Create supabase server client
    const supabase = await createClient();
    
    // Get user ID from session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Build update object with only provided fields
    const updateData: { title?: string; last_message?: string } = {};
    if (title !== undefined) updateData.title = title;
    if (last_message !== undefined) updateData.last_message = last_message;
    
    // Update the session
    const { error } = await supabase
      .from('chat_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error updating chat session:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating chat session:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update chat session' 
    }, { status: 500 });
  }
} 
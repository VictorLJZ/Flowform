import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/publicClient';

/**
 * API route for tracking form completions
 * This provides a server-side endpoint to track form completions, separating client and server code
 */
export async function POST(request: Request) {
  try {
    const { 
      formId, 
      responseId,
      metadata 
    } = await request.json();

    // Validate required fields
    if (!formId || !responseId) {
      return NextResponse.json(
        { error: 'Missing required fields: formId and responseId are required' },
        { status: 400 }
      );
    }

    // Create the Supabase public client for unauthenticated access
    const supabase = createPublicClient();
    
    // First, update the response status to completed
    const { error: responseError } = await supabase
      .from('form_responses')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', responseId);

    if (responseError) {
      console.error('Error updating response status:', responseError);
      return NextResponse.json(
        { error: responseError.message },
        { status: 500 }
      );
    }
    
    // Then insert the completion record for analytics
    const { data, error } = await supabase
      .from('form_interactions')
      .insert({
        form_id: formId,
        response_id: responseId,
        event_type: 'form_completion',
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          completion_type: 'full'
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking form completion:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error processing form completion tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

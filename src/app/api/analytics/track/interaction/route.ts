import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/publicClient';

/**
 * API route for tracking block interactions
 * This provides a server-side endpoint to track form block interactions, separating client and server code
 */
export async function POST(request: Request) {
  try {
    const { 
      blockId, 
      formId, 
      responseId,
      eventType, 
      metadata 
    } = await request.json();

    // Validate required fields
    if (!blockId || !formId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: blockId, formId, and eventType are required' },
        { status: 400 }
      );
    }

    // Create the Supabase public client for unauthenticated access
    const supabase = createPublicClient();
    
    // Insert the block interaction into the database
    const { data, error } = await supabase
      .from('form_interactions')
      .insert({
        block_id: blockId,
        form_id: formId,
        response_id: responseId || null,
        event_type: eventType,
        timestamp: new Date().toISOString(),
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking block interaction:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error processing block interaction tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

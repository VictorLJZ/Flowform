import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/serviceClient';

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

    // Create the Supabase service client for trusted server operations
    const supabase = createServiceClient();
    
    // Use the RPC function to track the interaction (bypasses RLS restrictions)
    console.log('[API DEBUG] Calling track_block_interaction RPC with block_id:', blockId, 'form_id:', formId);
    
    // Extract visitor_id from metadata if present
    const visitorId = metadata?.visitor_id || null;
    
    // Remove visitor_id from metadata to avoid duplication
    const { visitor_id: _, ...cleanMetadata } = metadata || {};
    
    const { data: rpcResult, error } = await supabase.rpc('track_block_interaction', {
      p_block_id: blockId,
      p_form_id: formId,
      p_interaction_type: eventType,
      p_response_id: responseId || null,
      p_duration_ms: metadata?.duration_ms || null,
      p_visitor_id: visitorId,
      p_metadata: cleanMetadata || null
    });
    
    if (error || (rpcResult && !rpcResult.success)) {
      const errorMessage = error ? error.message : (rpcResult ? rpcResult.error : 'Unknown error');
      console.error('[API] Error tracking block interaction:', errorMessage);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
    
    console.log('[API] Block interaction tracked successfully via RPC');

    return NextResponse.json({ success: true, data: rpcResult });
  } catch (error) {
    console.error('Error processing block interaction tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

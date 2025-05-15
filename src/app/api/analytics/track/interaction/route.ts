import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/serviceClient';
import { InteractionRequestBodySchema, InteractionRpcResponse, TrackingResponse, InteractionRequestBody } from '@/types/AggregateApiCleanup';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * API route for tracking block interactions
 * This provides a server-side endpoint to track form block interactions, separating client and server code
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = InteractionRequestBodySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        } as TrackingResponse,
        { status: 400 }
      );
    }

    const { 
      blockId, 
      formId, 
      responseId,
      eventType, 
      metadata 
    } = validationResult.data as InteractionRequestBody;

    // Create the Supabase service client for trusted server operations
    const supabase = createServiceClient();
    
    // Use the RPC function to track the interaction (bypasses RLS restrictions)
    // console.log('[API DEBUG] Calling track_block_interaction RPC with block_id:', blockId, 'form_id:', formId);
    
    // Extract visitor_id from metadata if present
    const visitorId = metadata?.visitor_id || null;
    
    // Remove visitor_id from metadata to avoid duplication
    const cleanMetadata = metadata ? { ...metadata } : {}; // Ensure cleanMetadata is an object
    if (cleanMetadata && 'visitor_id' in cleanMetadata) { // Check if visitor_id exists before deleting
      delete cleanMetadata.visitor_id;
    }
    
    const { data: rpcResult, error } = await supabase.rpc('track_block_interaction', {
      p_block_id: blockId,
      p_form_id: formId,
      p_interaction_type: eventType,
      p_response_id: responseId || null,
      p_duration_ms: metadata?.duration_ms || null,
      p_visitor_id: visitorId,
      p_metadata: cleanMetadata && Object.keys(cleanMetadata).length > 0 ? cleanMetadata : null
    }) as { data: InteractionRpcResponse | null, error: PostgrestError | null }; // Use specific error type
    
    if (error || (rpcResult && !rpcResult.success)) {
      const errorMessage = error ? error.message : (rpcResult ? rpcResult.error : 'Unknown error');
      // console.error('[API] Error tracking block interaction:', errorMessage);
      return NextResponse.json(
        { success: false, error: errorMessage } as TrackingResponse,
        { status: 500 }
      );
    }
    
    // console.log('[API] Block interaction tracked successfully via RPC');

    return NextResponse.json({ success: true, data: rpcResult } as TrackingResponse);
  } catch (error) {
    console.error('Error processing block interaction tracking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as TrackingResponse,
      { status: 500 }
    );
  }
}

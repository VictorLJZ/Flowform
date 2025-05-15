import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/serviceClient';
import { TrackingResponse } from '@/types/AggregateApiCleanup';

/**
 * API route for tracking block views
 * This provides a server-side endpoint to track when form blocks are viewed
 */
export async function POST(request: Request) {
  try {
    const { 
      blockId, 
      formId, 
      responseId, 
      metadata
      // timestamp is available but not used
    } = await request.json();

    // Validate required fields
    if (!blockId || !formId) {
      return NextResponse.json(
        { error: 'Missing required fields: blockId and formId are required' },
        { status: 400 }
      );
    }

    // Create the Supabase service client for trusted server operations
    const supabase = createServiceClient();
    
    // Call the RPC function to track block view and update metrics in one transaction
    
    const { data: rpcResult, error } = await supabase.rpc('track_block_view', {
      p_block_id: blockId,
      p_form_id: formId,
      p_response_id: responseId || null,
      p_visitor_id: metadata?.visitor_id || null,
      p_metadata: metadata || null
    });
      
    if (error || (rpcResult && !rpcResult.success)) {
      const errorMessage = error ? error.message : (rpcResult ? rpcResult.error : 'Unknown error');
      // Error tracking block view
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
    
    // Block view tracked successfully via RPC
    
    // Create data to return to the client
    const data = {
      id: rpcResult.view_id,
      block_id: blockId,
      form_id: formId,
      timestamp: rpcResult.timestamp
    };

    const response: TrackingResponse = { success: true, data };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing block view tracking:', error);
    // Error processing block view tracking
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

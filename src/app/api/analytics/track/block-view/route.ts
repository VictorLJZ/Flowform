import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/serviceClient';

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
      metadata,
      timestamp 
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
    console.log('[API DEBUG] Calling track_block_view RPC with block_id:', blockId, 'form_id:', formId);
    
    const { data: rpcResult, error } = await supabase.rpc('track_block_view', {
      p_block_id: blockId,
      p_form_id: formId,
      p_response_id: responseId || null,
      p_visitor_id: metadata?.visitor_id || null,
      p_metadata: metadata || null
    });
      
    if (error || (rpcResult && !rpcResult.success)) {
      const errorMessage = error ? error.message : (rpcResult ? rpcResult.error : 'Unknown error');
      console.error('[API] Error tracking block view:', errorMessage);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
    
    console.log('[API] Block view tracked successfully via RPC');
    
    // Create data to return to the client
    const data = {
      id: rpcResult.view_id,
      block_id: blockId,
      form_id: formId,
      timestamp: rpcResult.timestamp
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error processing block view tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

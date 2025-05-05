import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/serviceClient';

// Define validation schema for request body - simpler, focused on submit events
const blockSubmitSchema = z.object({
  blockId: z.string().uuid(),
  formId: z.string().uuid(),
  responseId: z.string().uuid(), // Required for block submissions
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.string().optional(),
});

/**
 * API route for tracking block submit events
 * This provides a server-side endpoint specifically for tracking form block submissions
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validationResult = blockSubmitSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    const supabase = createServiceClient();
    
    // Extract visitor_id from metadata if present
    const visitorId = data.metadata?.visitor_id || null;
    
    // Remove visitor_id from metadata to avoid duplication
    const cleanMetadata = { ...data.metadata };
    if (cleanMetadata) {
      delete cleanMetadata.visitor_id;
    }
    
    // Call the new simplified RPC function
    console.log('[API DEBUG] Calling track_block_submit RPC with block_id:', data.blockId, 'form_id:', data.formId, 'response_id:', data.responseId);
    console.log('[API DEBUG] Block submit payload:', {
      blockId: data.blockId,
      formId: data.formId,
      responseId: data.responseId,
      metadata_keys: Object.keys(cleanMetadata || {})
    });
    
    const { data: rpcResult, error } = await supabase.rpc('track_block_submit', {
      p_block_id: data.blockId,
      p_form_id: data.formId,
      p_response_id: data.responseId,
      p_duration_ms: data.metadata?.duration_ms || null,
      p_visitor_id: visitorId,
      p_metadata: cleanMetadata || null
    });
    
    if (error || (rpcResult && !rpcResult.success)) {
      const errorMessage = error ? error.message : (rpcResult ? rpcResult.error : 'Unknown error');
      console.error('[API] Error tracking block submit:', errorMessage);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
    
    console.log('[API] Block submit tracked successfully via RPC');
    return NextResponse.json({ success: true, data: rpcResult });
    
  } catch (error) {
    console.error('Error processing block submit tracking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/serviceClient';

// Define validation schema for request body with improved validation
const blockSubmitSchema = z.object({
  blockId: z.string().uuid({ message: 'Valid block ID (UUID format) is required' }),
  formId: z.string().uuid({ message: 'Valid form ID (UUID format) is required' }),
  responseId: z.string().uuid({ message: 'Valid response ID (UUID format) is required' }),
  visitorId: z.string().optional(),
  durationMs: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

/**
 * API route for tracking block submit events
 * This provides a server-side endpoint for tracking form block submissions
 * following the same consistent pattern as other successful analytics tracking
 */
export async function POST(request: Request) {
  try {
    // Check for public access header
    const publicAccessHeader = request.headers.get('x-flowform-public-access');
    const isPublicAccess = publicAccessHeader === 'true';
    
    // Log the public access status
    console.log('[API] Block submit request with public access:', isPublicAccess ? 'yes' : 'no');
    
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validationResult = blockSubmitSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('[API] Block submit validation error:', validationResult.error.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
    
    // If not public access and not authenticated, return 401
    if (!isPublicAccess) {
      // For now, we'll allow all public form access requests - no authentication required
      console.log('[API] Public access not specified, checking auth would happen here');
      // In a real implementation, we would check for auth token here
      // For now, if public access header is not present, return 401
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const data = validationResult.data;
    const supabase = createServiceClient();
    
    // Prepare clean metadata - avoid duplicating fields that are already parameters
    const cleanMetadata = { ...data.metadata };
    if (cleanMetadata) {
      // Remove any fields that might be duplicated in the RPC call
      delete cleanMetadata.visitor_id;
      delete cleanMetadata.duration_ms;
      delete cleanMetadata.block_id;
      delete cleanMetadata.form_id;
      delete cleanMetadata.response_id;
    }
    
    // Call the RPC function
    console.log('[API] Calling track_block_submit RPC with block_id:', data.blockId, 'form_id:', data.formId);
    
    const { data: rpcResult, error } = await supabase.rpc('track_block_submit', {
      p_block_id: data.blockId,
      p_form_id: data.formId,
      p_response_id: data.responseId,
      p_duration_ms: data.durationMs || data.metadata?.duration_ms || null,
      p_visitor_id: data.visitorId || data.metadata?.visitor_id || null,
      p_metadata: cleanMetadata || null
    });
    
    if (error) {
      console.error('[API] Database error tracking block submit:', error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    if (rpcResult && !rpcResult.success) {
      console.error('[API] RPC function reported error:', rpcResult.error);
      return NextResponse.json(
        { success: false, error: rpcResult.error },
        { status: 500 }
      );
    }
    
    // Create data to return to the client
    const responseData = {
      id: rpcResult.submit_id,
      block_id: data.blockId,
      form_id: data.formId,
      response_id: data.responseId,
      timestamp: rpcResult.timestamp
    };
    
    return NextResponse.json({ success: true, data: responseData });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error processing block submit tracking:', errorMessage);
    return NextResponse.json(
      { success: false, error: 'Internal server error', detail: errorMessage },
      { status: 500 }
    );
  }
}

import { createServiceClient } from '@/lib/supabase/serviceClient';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define validation schema for request body
const blockInteractionSchema = z.object({
  block_id: z.string().uuid(),
  form_id: z.string().uuid(),
  response_id: z.string().uuid().optional().nullable(),
  interaction_type: z.enum(['view', 'focus', 'blur', 'change', 'submit', 'error']),
  duration_ms: z.number().optional().nullable(),
  visitor_id: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

// POST handler for block interaction tracking
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validationResult = blockInteractionSchema.safeParse(body);
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
    const timestamp = new Date().toISOString();
    
    // Call the RPC function to track block interaction and update metrics in one transaction
    console.log(`[API DEBUG] Calling track_block_interaction RPC with block_id: ${data.block_id}, interaction_type: ${data.interaction_type}`);
    
    const { data: rpcResult, error } = await supabase.rpc('track_block_interaction', {
      p_block_id: data.block_id,
      p_form_id: data.form_id,
      p_response_id: data.response_id || null,
      p_interaction_type: data.interaction_type,
      p_duration_ms: data.duration_ms || null,
      p_visitor_id: data.visitor_id,
      p_metadata: data.metadata || null
    });
      
    if (error || (rpcResult && !rpcResult.success)) {
      const errorMessage = error ? error.message : (rpcResult ? rpcResult.error : 'Unknown error');
      console.error('[API] Error tracking block interaction:', errorMessage);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
    
    console.log(`[API] Block ${data.interaction_type} interaction tracked successfully via RPC`);
    
    // Create interaction object to return to the client
    const interaction = {
      id: rpcResult.interaction_id,
      block_id: data.block_id,
      form_id: data.form_id,
      interaction_type: data.interaction_type,
      timestamp: rpcResult.timestamp,
      duration_ms: data.duration_ms
    };
    
    return NextResponse.json({
      success: true,
      data: interaction
    });
  } catch (error) {
    console.error('[API] Error in block interaction tracking API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

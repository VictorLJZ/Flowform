import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/serviceClient';

// Define validation schema for request body
const formCompletionSchema = z.object({
  form_id: z.string().uuid(),
  response_id: z.string().uuid(),
  visitor_id: z.string(),
  total_time_seconds: z.number().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

// POST handler for form completion tracking
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validationResult = formCompletionSchema.safeParse(body);
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
    
    // Call the RPC function to track form completion and update metrics in one transaction
    console.log('[API DEBUG] Calling track_form_completion RPC with form_id:', data.form_id);
    
    const { data: rpcResult, error } = await supabase.rpc('track_form_completion', {
      p_form_id: data.form_id,
      p_response_id: data.response_id,
      p_total_time_seconds: data.total_time_seconds || null,
      p_metadata: data.metadata || {}
    });
      
    if (error || (rpcResult && !rpcResult.success)) {
      const errorMessage = error ? error.message : (rpcResult ? rpcResult.error : 'Unknown error');
      console.error('[API] Error tracking form completion:', errorMessage);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
    
    console.log('[API] Form completion tracked successfully via RPC');
    
    // Create a simple response object to return to the client
    const updatedResponse = {
      id: data.response_id,
      form_id: data.form_id,
      status: 'completed',
      completed_at: timestamp,
      total_time_seconds: rpcResult.completion_time_seconds
    };
    
    
    return NextResponse.json({
      success: true,
      data: updatedResponse
    });
  } catch (error) {
    console.error('[API] Error in form completion tracking API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

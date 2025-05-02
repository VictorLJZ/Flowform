import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

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
    const supabase = await createClient();
    const timestamp = new Date().toISOString();
    
    // Create a form interaction for the completion event
    try {
      await supabase
        .from('form_interactions')
        .insert({
          response_id: data.response_id,
          block_id: null, // No specific block for form completion
          interaction_type: 'submit',
          timestamp,
          duration_ms: data.total_time_seconds ? data.total_time_seconds * 1000 : null,
          metadata: {
            visitor_id: data.visitor_id,
            form_id: data.form_id,
            ...(data.metadata || {})
          }
        });
    } catch (error) {
      console.warn('[API] Non-critical error logging form completion interaction:', error);
      // Don't throw here, we still want to update the response status
    }
    
    // Update the form response status to 'completed'
    const { data: updatedResponse, error: responseError } = await supabase
      .from('form_responses')
      .update({
        status: 'completed',
        completed_at: timestamp,
        metadata: {
          ...(data.metadata || {}),
          total_time_seconds: data.total_time_seconds,
          visitor_id: data.visitor_id
        }
      })
      .eq('id', data.response_id)
      .select()
      .single();
      
    if (responseError) {
      console.error('[API] Error updating form response status:', responseError);
      return NextResponse.json(
        { success: false, error: responseError.message },
        { status: 500 }
      );
    }
    
    // Update form metrics (non-critical operation)
    try {
      await supabase.rpc('increment_form_completion', { 
        p_form_id: data.form_id,
        p_time_seconds: data.total_time_seconds || null 
      });
    } catch (metricsError) {
      console.warn('[API] Non-critical error updating form completion metrics:', metricsError);
    }
    
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

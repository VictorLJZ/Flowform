import { createClient } from '@/lib/supabase/server';
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
    const supabase = await createClient();
    const timestamp = new Date().toISOString();
    
    // Create interaction record
    const { data: interaction, error } = await supabase
      .from('form_interactions')
      .insert({
        block_id: data.block_id,
        response_id: data.response_id || null,
        interaction_type: data.interaction_type,
        timestamp,
        duration_ms: data.duration_ms || null,
        metadata: {
          visitor_id: data.visitor_id,
          form_id: data.form_id,
          ...(data.metadata || {})
        }
      })
      .select()
      .single();
      
    if (error) {
      console.error('[API] Error tracking block interaction:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // For specific interaction types, update metrics
    if (data.interaction_type === 'view') {
      // Try to update block_metrics for views (not critical if it fails)
      try {
        await supabase.rpc('increment_block_view', { 
          p_block_id: data.block_id,
          p_form_id: data.form_id 
        });
      } catch (metricsError) {
        console.warn('[API] Non-critical error updating block view metrics:', metricsError);
      }
    } else if (data.interaction_type === 'submit' && data.duration_ms) {
      // Try to update time spent metrics (not critical if it fails)
      try {
        await supabase.rpc('update_block_time_spent', { 
          p_block_id: data.block_id,
          p_form_id: data.form_id,
          p_duration_seconds: Math.floor(data.duration_ms / 1000)
        });
      } catch (metricsError) {
        console.warn('[API] Non-critical error updating block time metrics:', metricsError);
      }
    }
    
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

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { FormView } from '@/types/supabase-types';
import { z } from 'zod';

// Define validation schema for request body
const formViewSchema = z.object({
  form_id: z.string().uuid(),
  visitor_id: z.string(),
  is_unique: z.boolean().optional().default(false),
  device_type: z.string().optional(),
  browser: z.string().optional(),
  source: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

// POST handler for form view tracking
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validationResult = formViewSchema.safeParse(body);
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
    
    // Create form view record
    const { data: formView, error } = await supabase
      .from('form_views')
      .insert({
        form_id: data.form_id,
        visitor_id: data.visitor_id,
        device_type: data.device_type || null,
        browser: data.browser || null,
        source: data.source || null,
        is_unique: !!data.is_unique,
        timestamp: new Date().toISOString(),
        metadata: data.metadata || null,
      })
      .select()
      .single();
      
    if (error) {
      console.error('[API] Error tracking form view:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // Try to update form_metrics (not critical if it fails)
    try {
      await supabase.rpc('increment_form_view', { 
        p_form_id: data.form_id,
        p_is_unique: !!data.is_unique
      });
    } catch (metricsError) {
      console.warn('[API] Non-critical error updating form metrics:', metricsError);
      // Continue without throwing error since this is a non-critical operation
    }
    
    return NextResponse.json({
      success: true,
      data: formView
    });
  } catch (error) {
    console.error('[API] Error in form view tracking API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

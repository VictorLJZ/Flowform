import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/serviceClient';

// Mark this route as dynamic to prevent caching
export const dynamic = 'force-dynamic';
// Allow this endpoint to be hit without authentication
export const runtime = 'edge';

// Define validation schema for request body
const formViewSchema = z.object({
  form_id: z.string().uuid(),
  visitor_id: z.string(),
  is_unique: z.boolean().optional().default(false),
  device_type: z.string().optional(),
  browser: z.string().optional(),
  source: z.string().optional().nullable(),
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
    
    // Log the full validated payload
    console.log('[API DEBUG] Form view tracking payload:', {
      form_id: data.form_id,
      visitor_id: data.visitor_id,
      device_type: data.device_type || null,
      browser: data.browser || null,
      source: data.source || null,
      is_unique: !!data.is_unique,
      timestamp: new Date().toISOString()
    });
    
    // Use a secure service client for analytics tracking
    // This is secure because it only runs server-side in this API endpoint
    const supabase = createServiceClient();
    console.log('[API DEBUG] Using service client for analytics tracking');
    
    // Call the RPC function to track form view and update metrics in one transaction
    console.log('[API DEBUG] Calling track_form_view RPC with form_id:', data.form_id);
    
    const { data: rpcResult, error } = await supabase.rpc('track_form_view', {
      p_form_id: data.form_id,
      p_visitor_id: data.visitor_id,
      p_is_unique: !!data.is_unique,
      p_device_type: data.device_type || null,
      p_browser: data.browser || null,
      p_source: data.source || null
    });
      
    if (error || (rpcResult && !rpcResult.success)) {
      const errorMessage = error ? error.message : (rpcResult ? rpcResult.error : 'Unknown error');
      console.error('[API] Error tracking form view:', errorMessage);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
    
    console.log('[API] Form view tracked successfully via RPC');
    
    const formView = {
      id: rpcResult.view_id,
      form_id: data.form_id,
      timestamp: rpcResult.timestamp
    };
    
    
    const response = NextResponse.json({
      success: true,
      data: formView
    });
    
    // Add CORS headers to allow requests from any origin
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
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

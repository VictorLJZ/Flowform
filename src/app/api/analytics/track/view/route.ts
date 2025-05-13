import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/serviceClient';
import type { ViewRequestBody, ViewResponseData, TrackingResponse } from '../../../../../types/AggregateApiCleanup';
import { ViewRequestBodySchema } from '../../../../../types/AggregateApiCleanup';

/**
 * API route for tracking form views
 * This provides a server-side endpoint to track form views, separating client and server code
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = ViewRequestBodySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        } as TrackingResponse,
        { status: 400 }
      );
    }

    const {
      formId,
      visitorId,
      deviceType,
      browser,
      source,
      timestamp,
      isUnique,
      metadata
    } = validationResult.data as ViewRequestBody;

    // Validate required fields - Handled by Zod schema
    // if (!formId || !visitorId) {
    //   return NextResponse.json(
    //     { error: 'Missing required fields: formId and visitorId are required' },
    //     { status: 400 }
    //   );
    // }

    // Create the Supabase service client for trusted server operations
    const supabase = createServiceClient();
    
    // Insert the form view into the database
    const { data, error } = await supabase
      .from('form_views')
      .insert({
        form_id: formId,
        visitor_id: visitorId,
        device_type: deviceType,
        browser,
        source,
        timestamp: timestamp || new Date().toISOString(), // Ensure timestamp is provided
        is_unique: isUnique,
        metadata
      })
      .select()
      .single();

    if (error) {
      // console.error('Error tracking form view:', error);
      return NextResponse.json(
        { success: false, error: error.message } as TrackingResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data as ViewResponseData } as TrackingResponse);
  } catch (error) {
    // console.error('Error processing form view tracking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as TrackingResponse,
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/publicClient';

/**
 * API route for tracking form views
 * This provides a server-side endpoint to track form views, separating client and server code
 */
export async function POST(request: Request) {
  try {
    const { 
      formId, 
      visitorId, 
      deviceType, 
      browser, 
      source, 
      timestamp, 
      isUnique, 
      metadata 
    } = await request.json();

    // Validate required fields
    if (!formId || !visitorId) {
      return NextResponse.json(
        { error: 'Missing required fields: formId and visitorId are required' },
        { status: 400 }
      );
    }

    // Create the Supabase public client for unauthenticated access
    const supabase = createPublicClient();
    
    // Insert the form view into the database
    const { data, error } = await supabase
      .from('form_views')
      .insert({
        form_id: formId,
        visitor_id: visitorId,
        device_type: deviceType,
        browser,
        source,
        timestamp,
        is_unique: isUnique,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking form view:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error processing form view tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

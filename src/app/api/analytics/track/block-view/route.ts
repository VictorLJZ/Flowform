import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/publicClient';

/**
 * API route for tracking block views
 * This provides a server-side endpoint to track when form blocks are viewed
 */
export async function POST(request: Request) {
  try {
    const { 
      blockId, 
      formId, 
      responseId, 
      metadata,
      timestamp 
    } = await request.json();

    // Validate required fields
    if (!blockId || !formId) {
      return NextResponse.json(
        { error: 'Missing required fields: blockId and formId are required' },
        { status: 400 }
      );
    }

    // Create the Supabase public client for unauthenticated access
    const supabase = createPublicClient();
    
    // Insert the block view into the database
    const { data, error } = await supabase
      .from('block_views')
      .insert({
        block_id: blockId,
        form_id: formId,
        response_id: responseId || null,
        timestamp: timestamp || new Date().toISOString(),
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking block view:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error processing block view tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

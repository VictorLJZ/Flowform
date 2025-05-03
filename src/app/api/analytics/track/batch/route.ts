import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

// Define validation schema for individual events
const analyticsEventSchema = z.object({
  type: z.string(),
  timestamp: z.string(),
  properties: z.record(z.unknown())
});

// Define validation schema for request body
const batchSchema = z.object({
  events: z.array(analyticsEventSchema)
});

// POST handler for batch event processing
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validationResult = batchSchema.safeParse(body);
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
    
    const { events } = validationResult.data;
    const supabase = await createClient();
    
    // Initialize results
    const results = {
      processed: 0,
      errors: 0,
      details: [] as Array<{ type: string; success: boolean; error?: string }>
    };
    
    // Process each event
    for (const event of events) {
      try {
        // Route event to appropriate handler based on type
        switch (event.type) {
          case 'form_view':
            await processFormView(supabase, event.properties);
            break;
            
          case 'block_view':
          case 'block_focus':
          case 'block_blur':
          case 'block_change':
          case 'block_submit':
          case 'block_error':
            await processBlockInteraction(
              supabase, 
              event.properties, 
              event.type.replace('block_', '') as 'view' | 'focus' | 'blur' | 'change' | 'submit' | 'error'
            );
            break;
            
          case 'form_completion':
            await processFormCompletion(supabase, event.properties);
            break;
            
          case 'dynamic_block_analytics':
            await processDynamicBlockAnalytics(supabase, event.properties);
            break;
            
          default:
            // Log unknown event type but don't fail the whole batch
            results.details.push({
              type: event.type,
              success: false,
              error: `Unknown event type: ${event.type}`
            });
            results.errors++;
            continue;
        }
        
        // Count successful processing
        results.details.push({
          type: event.type,
          success: true
        });
        results.processed++;
      } catch (error) {
        // Log error but continue processing other events
        results.details.push({
          type: event.type,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
        results.errors++;
      }
    }
    
    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('[API] Error in batch analytics API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

/**
 * Process a form view event
 */
async function processFormView(supabase: SupabaseClient, properties: Record<string, unknown>) {
  const { form_id, visitor_id } = properties;
  
  if (!form_id || !visitor_id) {
    throw new Error('Missing required properties for form_view event');
  }
  
  await supabase
    .from('form_views')
    .insert({
      form_id: form_id as string,
      visitor_id: visitor_id as string,
      device_type: properties.device_type as string || null,
      browser: properties.browser as string || null,
      source: properties.source as string || null,
      is_unique: !!properties.is_unique,
      timestamp: properties.timestamp as string || new Date().toISOString(),
      metadata: properties
    });
}

/**
 * Process a block interaction event
 */
async function processBlockInteraction(
  supabase: SupabaseClient, 
  properties: Record<string, unknown>,
  interactionType: 'view' | 'focus' | 'blur' | 'change' | 'submit' | 'error'
) {
  const { block_id, visitor_id } = properties;
  
  if (!block_id || !visitor_id) {
    throw new Error(`Missing required properties for block_${interactionType} event`);
  }
  
  await supabase
    .from('form_interactions')
    .insert({
      block_id: block_id as string,
      response_id: properties.response_id as string || null,
      interaction_type: interactionType,
      timestamp: properties.timestamp as string || new Date().toISOString(),
      duration_ms: properties.duration_ms as number || null,
      metadata: properties
    });
}

/**
 * Process a form completion event
 */
async function processFormCompletion(supabase: SupabaseClient, properties: Record<string, unknown>) {
  const { form_id, response_id, visitor_id } = properties;
  
  if (!form_id || !response_id || !visitor_id) {
    throw new Error('Missing required properties for form_completion event');
  }
  
  const timestamp = properties.timestamp as string || new Date().toISOString();
  
  // Update the form response status
  await supabase
    .from('form_responses')
    .update({
      status: 'completed',
      completed_at: timestamp,
      metadata: {
        ...properties,
        visitor_id
      }
    })
    .eq('id', response_id);
}

/**
 * Process dynamic block analytics event
 */
async function processDynamicBlockAnalytics(supabase: SupabaseClient, properties: Record<string, unknown>) {
  const { dynamic_response_id, block_id, question_index, question_text } = properties;
  
  if (!dynamic_response_id || !block_id || typeof question_index !== 'number' || !question_text) {
    throw new Error('Missing required properties for dynamic_block_analytics event');
  }
  
  await supabase
    .from('dynamic_block_analytics')
    .insert({
      dynamic_response_id: dynamic_response_id as string,
      block_id: block_id as string,
      question_index: question_index as number,
      question_text: question_text as string,
      time_to_answer_seconds: properties.time_to_answer_seconds as number || null,
      answer_length: properties.answer_length as number || null,
      sentiment_score: null,
      topics: null
    });
}

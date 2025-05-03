import { createClient } from '@/lib/supabase/client';
import { FormInteraction } from '@/types/supabase-types';
import { getVisitorId } from '@/lib/analytics/visitorId';
import { queueEvent } from '@/lib/analytics/eventQueue';

/**
 * Track when a form block becomes visible to the user
 * 
 * @param blockId - The ID of the block being viewed
 * @param formId - The ID of the form containing the block
 * @param responseId - Optional ID of the current form response
 * @param metadata - Optional additional metadata
 * @returns The created form interaction record
 */
export async function trackBlockView(
  blockId: string,
  formId: string,
  responseId?: string,
  metadata: Record<string, unknown> = {}
): Promise<FormInteraction> {
  const supabase = createClient();
  const visitorId = getVisitorId();
  const timestamp = new Date().toISOString();
  
  // Queue the event for batch processing
  queueEvent({
    type: 'block_view',
    timestamp,
    properties: {
      block_id: blockId,
      form_id: formId,
      response_id: responseId,
      visitor_id: visitorId,
      ...metadata
    }
  });
  
  // Create the interaction record directly
  const { data, error } = await supabase
    .from('form_interactions')
    .insert({
      block_id: blockId,
      response_id: responseId || null,
      interaction_type: 'view',
      timestamp,
      duration_ms: null, // No duration for view events
      metadata: {
        visitor_id: visitorId,
        ...metadata
      }
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error tracking block view:', error);
    throw error;
  }
  
  // Update block_metrics if they exist (will be created by background job if not)
  try {
    await supabase.rpc('increment_block_view', { 
      p_block_id: blockId,
      p_form_id: formId 
    });
  } catch (metricsError) {
    // Non-critical error, just log it
    console.warn('Error updating block metrics:', metricsError);
  }
  
  return data;
}

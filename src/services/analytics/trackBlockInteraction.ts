import { createClient } from '@/lib/supabase/client';
import { FormInteraction } from '@/types/supabase-types';
import { getVisitorId } from '@/lib/analytics/visitorId';
import { queueEvent } from '@/lib/analytics/eventQueue';

/**
 * Track user interactions with a specific form block
 * 
 * @param blockId - The ID of the block being interacted with
 * @param formId - The ID of the form containing the block
 * @param interactionType - The type of interaction (focus, blur, change, submit, error)
 * @param responseId - Optional ID of the current form response
 * @param durationMs - Optional duration of the interaction in milliseconds
 * @param metadata - Optional additional metadata
 * @returns The created form interaction record
 */
export async function trackBlockInteraction(
  blockId: string,
  formId: string,
  interactionType: 'focus' | 'blur' | 'change' | 'submit' | 'error',
  responseId?: string,
  durationMs?: number,
  metadata: Record<string, unknown> = {}
): Promise<FormInteraction> {
  const supabase = createClient();
  const visitorId = getVisitorId();
  const timestamp = new Date().toISOString();
  
  // Queue the event for batch processing
  queueEvent({
    type: `block_${interactionType}`,
    timestamp,
    properties: {
      block_id: blockId,
      form_id: formId,
      response_id: responseId,
      visitor_id: visitorId,
      duration_ms: durationMs,
      ...metadata
    }
  });
  
  // Create the interaction record directly
  const { data, error } = await supabase
    .from('form_interactions')
    .insert({
      block_id: blockId,
      response_id: responseId || null,
      interaction_type: interactionType,
      timestamp,
      duration_ms: durationMs || null,
      metadata: {
        visitor_id: visitorId,
        form_id: formId, // Store form ID in metadata for easier querying
        ...metadata
      }
    })
    .select()
    .single();
    
  if (error) {
    console.error(`Error tracking block ${interactionType}:`, error);
    throw error;
  }
  
  // If this is a submit interaction and has duration, update average time metrics
  if (interactionType === 'submit' && durationMs) {
    try {
      await supabase.rpc('update_block_time_spent', { 
        p_block_id: blockId,
        p_form_id: formId,
        p_duration_seconds: Math.floor(durationMs / 1000)
      });
    } catch (metricsError) {
      // Non-critical error, just log it
      console.warn('Error updating block time metrics:', metricsError);
    }
  }
  
  return data;
}

import { createClient } from '@/lib/supabase/client';
import { DbFormResponse, ApiFormResponse } from '@/types/response';
import { dbToApiFormResponse } from '@/utils/type-utils/response';
import { getVisitorId } from '@/lib/analytics/visitorId';
import { queueEvent } from '@/lib/analytics/eventQueue';

/**
 * Track when a form is completed by a user
 * 
 * @param formId - The ID of the form being completed
 * @param responseId - The ID of the form response
 * @param totalTimeSeconds - Optional total time spent on the form in seconds
 * @param metadata - Optional additional metadata
 * @returns The updated form response
 */
export async function trackFormCompletion(
  formId: string,
  responseId: string,
  totalTimeSeconds?: number,
  metadata: Record<string, unknown> = {}
): Promise<ApiFormResponse> {
  const supabase = createClient();
  const visitorId = getVisitorId();
  const timestamp = new Date().toISOString();
  
  // Queue the event for batch processing
  queueEvent({
    type: 'form_completion',
    timestamp,
    properties: {
      form_id: formId,
      response_id: responseId,
      visitor_id: visitorId,
      total_time_seconds: totalTimeSeconds,
      ...metadata
    }
  });
  
  // Create a form interaction for the completion event
  try {
    await supabase
      .from('form_interactions')
      .insert({
        response_id: responseId,
        block_id: null, // No specific block for form completion
        interaction_type: 'submit',
        timestamp,
        duration_ms: totalTimeSeconds ? totalTimeSeconds * 1000 : null,
        metadata: {
          visitor_id: visitorId,
          form_id: formId,
          ...metadata
        }
      });
  } catch (error) {
    console.warn('Error logging form completion interaction:', error);
    // Don't throw here, we still want to update the response status
  }
  
  // Update the form response status to 'completed'
  const { data, error } = await supabase
    .from('form_responses')
    .update({
      status: 'completed',
      completed_at: timestamp,
      metadata: {
        ...metadata,
        total_time_seconds: totalTimeSeconds,
        visitor_id: visitorId
      }
    })
    .eq('id', responseId)
    .select()
    .single();
    
  if (error) {
    console.error('Error tracking form completion:', error);
    throw error;
  }
  
  // Update form metrics (non-critical operation)
  try {
    await supabase.rpc('increment_form_completion', { 
      p_form_id: formId,
      p_time_seconds: totalTimeSeconds || null 
    });
  } catch (metricsError) {
    // Non-critical error, just log it
    console.warn('Error updating form completion metrics:', metricsError);
  }
  
  return dbToApiFormResponse(data as DbFormResponse);
}

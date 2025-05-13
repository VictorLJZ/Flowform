import { createClient } from '@/lib/supabase/client';
import { createPublicClient } from '@/lib/supabase/publicClient';
import { DbFormResponse, ApiFormResponse } from '@/types/response';
import { dbToApiFormResponse } from '@/utils/type-utils/response';

/**
 * Mark a form response as completed
 * 
 * @param responseId - The ID of the form response to complete
 * @param mode - Optional mode flag ('builder' or 'viewer') - uses public client when in viewer mode
 * @returns The updated form response
 */
export async function completeResponse(responseId: string, mode: 'builder' | 'viewer' = 'viewer'): Promise<ApiFormResponse> {
  // Use public client for viewer mode, standard client for builder mode
  const supabase = mode === 'viewer' ? createPublicClient() : createClient();

  // Update the response status to completed
  const { data, error } = await supabase
    .from('form_responses')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', responseId)
    .select()
    .single();

  if (error) {
    console.error('Error completing form response:', error);
    throw error;
  }

  return dbToApiFormResponse(data as DbFormResponse);
}

import { createClient } from '@/lib/supabase/client';
import { FormResponse } from '@/types/supabase-types';

/**
 * Mark a form response as completed
 * 
 * @param responseId - The ID of the form response to complete
 * @returns The updated form response
 */
export async function completeResponse(responseId: string): Promise<FormResponse> {
  const supabase = createClient();

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

  return data;
}

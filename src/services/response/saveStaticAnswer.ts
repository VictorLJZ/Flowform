import { createClient } from '@/lib/supabase/client';
import { StaticBlockAnswer } from '@/types/supabase-types';

/**
 * Save an answer to a static block question
 * 
 * @param responseId - The ID of the form response
 * @param blockId - The ID of the static block
 * @param answer - The user's answer
 * @returns The created static answer record
 */
export async function saveStaticAnswer(
  responseId: string,
  blockId: string,
  answer: string
): Promise<StaticBlockAnswer> {
  const supabase = createClient();

  // Upsert to avoid duplicate answers (unique on response_id+block_id)
  const payload = {
    response_id: responseId,
    block_id: blockId,
    answer,
    answered_at: new Date().toISOString()
  };
  const { data, error } = await supabase
    .from('static_block_answers')
    // Use comma-separated string for onConflict to satisfy TS signature
    .upsert(payload, { onConflict: 'response_id,block_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving static answer:', error);
    throw error;
  }

  return data;
}

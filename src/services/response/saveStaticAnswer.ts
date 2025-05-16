import { createClient } from '@/lib/supabase/client';
import { createPublicClient } from '@/lib/supabase/publicClient';
import { DbStaticBlockAnswer, ApiStaticBlockAnswer } from '@/types/response';
import { dbToApiStaticBlockAnswer } from '@/utils/type-utils/response';

/**
 * Save an answer to a static block question
 * 
 * @param responseId - The ID of the form response
 * @param blockId - The ID of the static block
 * @param answer - The user's answer (can be string, number, array, or other complex types)
 * @param mode - Optional mode flag ('builder' or 'viewer') - uses public client when in viewer mode
 * @returns The created static answer record
 */
export async function saveStaticAnswer(
  responseId: string,
  blockId: string,
  answer: string | number | string[] | Record<string, unknown> | unknown,
  mode: 'builder' | 'viewer' = 'viewer' // Default to viewer mode for backwards compatibility
): Promise<ApiStaticBlockAnswer> {
  // DEBUG LOGGING: Initial entry point to service function
  // Create a safe preview of the answer for logging
  let answerPreview = 'Unable to stringify content';
  try {
    const stringified = JSON.stringify(answer);
    if (stringified && typeof stringified === 'string') {
      answerPreview = stringified.substring(0, 100) + (stringified.length > 100 ? '...' : '');
    }
  } catch {
    answerPreview = '[Content contains non-serializable data]';
  }
  
  console.log(`[saveStaticAnswer] Saving answer for ${responseId}, ${blockId}:`, {
    answerType: typeof answer,
    isArray: Array.isArray(answer),
    mode,
    answerPreview
  });
  // Use public client for viewer mode, standard client for builder mode
  const supabase = mode === 'viewer' ? createPublicClient() : createClient();

  // Format the answer based on its type
  let formattedAnswer: string;
  if (typeof answer === 'string') {
    formattedAnswer = answer;
  } else if (typeof answer === 'number') {
    formattedAnswer = answer.toString();
  } else if (Array.isArray(answer)) {
    // If it's an array, stringify it to preserve structure
    formattedAnswer = JSON.stringify(answer);
  } else if (answer === null || answer === undefined) {
    formattedAnswer = '';
  } else {
    // If it's an object or any other type, stringify it
    formattedAnswer = JSON.stringify(answer);
  }

  // Log the conversion for debugging
  console.log('Static answer formatting:', {
    originalType: typeof answer,
    isArray: Array.isArray(answer),
    formattedAnswer: formattedAnswer.substring(0, 100) + (formattedAnswer.length > 100 ? '...' : '')
  });

  // Upsert to avoid duplicate answers (unique on response_id+block_id)
  const payload = {
    response_id: responseId,
    block_id: blockId,
    type: "answer", content: formattedAnswer,
    answered_at: new Date().toISOString()
  };
  const { data, error } = await supabase
    .from('static_block_answers')
    // Use comma-separated string for onConflict to satisfy TS signature
    .upsert(payload, { onConflict: 'response_id,block_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving static type: "answer", content:', error);
    throw error;
  }

  return dbToApiStaticBlockAnswer(data as DbStaticBlockAnswer);
}

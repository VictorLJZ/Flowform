import { createClient } from '@/lib/supabase/client';
import { ApiDynamicBlockAnalytics } from '@/types/analytics';
import { queueEvent } from '@/lib/analytics/eventQueue';

/**
 * Track analytics for AI conversation blocks
 * 
 * @param dynamicResponseId - The ID of the dynamic block response
 * @param blockId - The ID of the block
 * @param questionIndex - The index of the question in the conversation
 * @param questionText - The text of the question
 * @param answer - The user's answer to the question
 * @param timeToAnswerSeconds - How long the user took to answer
 * @returns The created analytics record
 */
export async function trackDynamicBlockAnalytics(
  dynamicResponseId: string,
  blockId: string,
  questionIndex: number,
  questionText: string,
  answer: string,
  timeToAnswerSeconds?: number
): Promise<ApiDynamicBlockAnalytics> {
  const supabase = createClient();
  const timestamp = new Date().toISOString();
  
  // Calculate answer length
  const answerLength = answer ? answer.length : 0;
  
  // Queue the event for batch processing
  queueEvent({
    type: 'dynamic_block_analytics',
    timestamp,
    properties: {
      dynamic_response_id: dynamicResponseId,
      block_id: blockId,
      question_index: questionIndex,
      question_text: questionText,
      time_to_answer_seconds: timeToAnswerSeconds,
      answer_length: answerLength
    }
  });
  
  // Create the analytics record directly
  const { data, error } = await supabase
    .from('dynamic_block_analytics')
    .insert({
      dynamic_response_id: dynamicResponseId,
      block_id: blockId,
      question_index: questionIndex,
      question_text: questionText,
      time_to_answer_seconds: timeToAnswerSeconds || null,
      answer_length: answerLength,
      sentiment_score: null, // Will be filled by background process
      topics: null // Will be filled by background process
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error tracking dynamic block analytics:', error);
    throw error;
  }
  
  return data;
}

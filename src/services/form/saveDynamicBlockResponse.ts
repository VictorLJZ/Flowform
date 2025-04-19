import { createClient } from '@/lib/supabase/client';
import { QAPair } from '@/types/supabase-types';
import { processConversation } from '@/services/ai/processConversation';
import { getFormContextClient } from './getFormContextClient';

type SaveResponseInput = {
  responseId: string;   // form_responses.id
  blockId: string;      // form_blocks.id
  formId: string;       // forms.form_id
  question: string;     // The current question
  answer: string;       // The user's answer
  isStarterQuestion?: boolean; // Whether this is the first question
};

type SaveResponseResult = {
  success: boolean;
  data?: {
    conversation: QAPair[];
    nextQuestion?: string;
    isComplete: boolean;
  };
  error?: string;
};

/**
 * Save a response to a dynamic block and generate the next question if needed
 * 
 * @param input - Object containing response data
 * @returns Success status with conversation data and next question (if available)
 */
export async function saveDynamicBlockResponse(input: SaveResponseInput): Promise<SaveResponseResult> {
  const supabase = createClient();
  
  try {
    // Check if a response already exists for this block
    const { data: existingResponse, error: fetchError } = await supabase
      .from('dynamic_block_responses')
      .select('*')
      .eq('response_id', input.responseId)
      .eq('block_id', input.blockId)
      .single();
    
    // Get block config to determine max questions
    const { data: config, error: configError } = await supabase
      .from('dynamic_block_configs')
      .select('*')
      .eq('block_id', input.blockId)
      .single();
      
    if (configError) {
      console.error('Error fetching dynamic block config:', configError);
      return { success: false, error: 'Failed to retrieve block configuration' };
    }
    
    // Create new QAPair for current interaction
    const newQAPair: QAPair = {
      question: input.question,
      answer: input.answer,
      timestamp: new Date().toISOString(),
      is_starter: !!input.isStarterQuestion
    };
    
    let conversation: QAPair[] = [];
    let isNew = false;
    
    // If response exists, append to conversation
    if (existingResponse && !fetchError) {
      conversation = [...existingResponse.conversation, newQAPair];
    } else {
      // Create new conversation
      conversation = [newQAPair];
      isNew = true;
    }
    
    // Determine if we've reached max questions
    const isComplete = conversation.length >= config.max_questions;
    
    let nextQuestion: string | undefined;
    
    // Generate next question unless we've reached the limit
    if (!isComplete) {
      // Extract previous questions and answers for AI processing
      const prevQuestions = conversation.map(pair => pair.question);
      const prevAnswers = conversation.map(pair => pair.answer);
      
      // Get form context to help AI avoid redundant questions
      const formContext = await getFormContextClient(input.formId, input.blockId);
      
      const result = await processConversation({
        prevQuestions,
        prevAnswers,
        instructions: config.ai_instructions || 'You are an interviewer asking follow-up questions based on previous responses.',
        temperature: config.temperature,
        formContext // Pass form context to AI
      });
      
      if (result.success) {
        nextQuestion = result.data;
      } else {
        console.error('Error generating next question:', result.error);
        return { success: false, error: 'Failed to generate next question' };
      }
    }
    
    // Save or update the response
    if (isNew) {
      // Create new response
      const { error: insertError } = await supabase
        .from('dynamic_block_responses')
        .insert({
          response_id: input.responseId,
          block_id: input.blockId,
          conversation,
          started_at: new Date().toISOString(),
          completed_at: isComplete ? new Date().toISOString() : null
        });
        
      if (insertError) {
        console.error('Error creating dynamic block response:', insertError);
        return { success: false, error: 'Failed to save response' };
      }
    } else {
      // Update existing response
      const { error: updateError } = await supabase
        .from('dynamic_block_responses')
        .update({
          conversation,
          completed_at: isComplete ? new Date().toISOString() : null
        })
        .eq('response_id', input.responseId)
        .eq('block_id', input.blockId);
        
      if (updateError) {
        console.error('Error updating dynamic block response:', updateError);
        return { success: false, error: 'Failed to update response' };
      }
    }
    
    return {
      success: true,
      data: {
        conversation,
        nextQuestion,
        isComplete
      }
    };
    
  } catch (error: unknown) {
    console.error('Error saving dynamic block response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

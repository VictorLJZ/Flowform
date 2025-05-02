import { createClient } from '@/lib/supabase/client';
import { createPublicClient } from '@/lib/supabase/publicClient';
import { QAPair } from '@/types/supabase-types';
import { SaveDynamicResponseInput, SaveDynamicResponseResult, DynamicResponseData } from '@/types/form-service-types';
import { processConversation } from '@/services/ai/processConversation';
import { getFormContextClient } from './getFormContextClient';

/**
 * Save a response to a dynamic block and generate the next question if needed
 * 
 * @param input - Object containing response data
 * @returns Success status with conversation data and next question (if available)
 */
export async function saveDynamicBlockResponse(input: SaveDynamicResponseInput): Promise<SaveDynamicResponseResult> {
  // Allow public access for viewer mode
  const mode = input.mode || 'viewer';
  const supabase = mode === 'viewer' ? createPublicClient() : createClient();
  
  try {
    // Check if a response already exists for this block
    const { data: existingResponse, error: fetchError } = await supabase
      .from('dynamic_block_responses')
      .select('*')
      .eq('response_id', input.responseId)
      .eq('block_id', input.blockId)
      .single();
    
    // Log exact block ID format for debugging
    console.log('Fetching dynamic block config for block ID:', {
      blockId: input.blockId,
      blockIdType: typeof input.blockId,
      blockIdLength: input.blockId.length,
      trimmedIdLength: input.blockId.trim().length // Check for whitespace issues
    });
    
    // Define a default config in case we can't retrieve the actual one
    let config = {
      max_questions: 5,
      temperature: 0.7,
      ai_instructions: 'You are an interviewer asking follow-up questions based on previous responses.'
    };
    
    // Try to get the actual config
    try {
      // First try with a simpler query to check if the table has any records
      const { data: allConfigs, error: listError } = await supabase
        .from('dynamic_block_configs')
        .select('block_id')
        .limit(5);
        
      if (listError) {
        console.error('Error accessing dynamic_block_configs table:', listError);
      } else {
        console.log('Sample block configs available:', allConfigs);
      }
      
      // Get block config to determine max questions
      const { data: configData, error: configError } = await supabase
        .from('dynamic_block_configs')
        .select('*')
        .eq('block_id', input.blockId.trim()) // Trim any potential whitespace
        .single();
        
      if (configError) {
        console.error('Error fetching dynamic block config:', configError);
        console.log('Using default configuration as fallback');
      } else if (configData) {
        // If we successfully got the config, use it
        config = configData;
        console.log('Retrieved block configuration:', {
          blockId: input.blockId,
          maxQuestions: config.max_questions,
          temperature: config.temperature
        });
      }
    } catch (queryError) {
      console.error('Unexpected error querying block config:', queryError);
      console.log('Using default configuration due to error');
      // Continue with default config
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
    
    // Determine if we've reached max questions or if completion is explicitly set
    // If isComplete is provided in the input, use that value; otherwise calculate based on max_questions
    const isComplete = input.isComplete !== undefined ? input.isComplete : conversation.length >= config.max_questions;
    
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
    
    const responseData: DynamicResponseData = {
      conversation,
      nextQuestion,
      isComplete
    };

    return {
      success: true,
      data: responseData
    };
    
  } catch (error: unknown) {
    console.error('Error saving dynamic block response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

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
 * @param input.questionIndex - Optional index of the question being answered (for truncating the conversation)
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
    
    // We'll determine completion state later
    
    // If response exists, handle the conversation based on questionIndex
    if (existingResponse && !fetchError) {
      // Deep log the existing conversation for debugging
      console.log('Current conversation state:', {
        existingLength: existingResponse.conversation.length,
        questionIndex: input.questionIndex,
        isDefinedIndex: typeof input.questionIndex === 'number',
        isValidIndex: typeof input.questionIndex === 'number' && input.questionIndex < existingResponse.conversation.length
      });
      
      if (typeof input.questionIndex === 'number' && input.questionIndex < existingResponse.conversation.length) {
        // TRUNCATION MODE: We're answering a previous question, truncate the conversation at that index
        // This is critical for ensuring the QA flow remains coherent when earlier answers change
        console.log(`TRUNCATION MODE: Truncating conversation at index ${input.questionIndex} (out of ${existingResponse.conversation.length} items)`);
        
        // Get the slice of the conversation up to but not including the questionIndex
        const previousConversation = existingResponse.conversation.slice(0, input.questionIndex);
        
        // Log each item being retained for debugging
        previousConversation.forEach((item: QAPair, idx: number) => {
          console.log(`Keeping QA pair ${idx}:`, {
            question: item.question.substring(0, 30) + '...',
            answer: item.answer.substring(0, 30) + '...'
          });
        });
        
        // Log what we're truncating for debugging
        const truncatedItems = existingResponse.conversation.slice(input.questionIndex);
        console.log(`Truncating ${truncatedItems.length} items:`);
        truncatedItems.forEach((item: QAPair, idx: number) => {
          const questionIndex = typeof input.questionIndex === 'number' ? input.questionIndex : 0;
          console.log(`Truncated QA pair ${questionIndex + idx}:`, {
            question: item.question.substring(0, 30) + '...',
            answer: item.answer.substring(0, 30) + '...'
          });
        });
        
        // Create the new conversation array with previous items plus the new QA pair
        conversation = [...previousConversation, newQAPair];
        console.log(`New conversation has ${conversation.length} items. Explicitly forcing regeneration of next question.`);
        
        // CRITICAL FIX: Make a note that we need to regenerate questions
        // We will use this later to ensure isComplete is false
        console.log('Marking for question regeneration after truncation');
      } else {
        // APPEND MODE: Normal case - append to the conversation
        console.log('APPEND MODE: Adding new QA pair to the end of conversation');
        conversation = [...existingResponse.conversation, newQAPair];
      }
    } else {
      // CREATE MODE: Create new conversation
      console.log('CREATE MODE: Creating new conversation with first QA pair');
      conversation = [newQAPair];
      isNew = true;
    }
    
    // Process the conversation to generate the next question
    let nextQuestion = '';
    let isComplete = false;
    
    // Force isComplete to false if explicitly requested by the frontend
    if (input.isComplete === false) {
      isComplete = false;
    }
    // Check if we've reached the maximum number of questions
    // FIXED: Set isComplete before generating a next question to prevent unnecessary AI calls
    else if (conversation.length >= config.max_questions) {
      console.log(`Conversation has reached maximum questions (${config.max_questions}). Marking as complete.`);
      isComplete = true;
      // FIXED: Don't generate a new question when we're at max questions
      nextQuestion = '';
      return {
        success: true,
        data: {
          conversation,
          nextQuestion: '', // Explicitly set to empty
          isComplete: true
        }
      };
    }
    
    // Only generate a next question if we haven't reached max questions
    if (!isComplete) {
      // Generate next question if we're not yet complete
      const context = await getFormContextClient(input.formId, input.blockId);
      
      // Extract questions and answers for the API
      const prevQuestions = conversation.map(qa => qa.question);
      const prevAnswers = conversation.map(qa => qa.answer);
      
      try {
        // Process the conversation to generate a next question
        const result = await processConversation({
          prevQuestions,
          prevAnswers,
          formContext: context,
          instructions: config.ai_instructions || 'You are an interviewer asking follow-up questions based on previous responses.',
          temperature: config.temperature
        });
      
        if (result.success && result.data) {
          nextQuestion = result.data;
          console.log('Generated next question:', nextQuestion);
          
          // Set isComplete based on having a next question - if we have a next question we're definitely not complete
          isComplete = false;
        } else {
          console.log('Failed to generate next question or no next question returned');
          // Only mark as complete if we're at the max questions
          isComplete = conversation.length >= config.max_questions;
          
          // Log the complete state
          console.log(`Setting isComplete to ${isComplete} based on conversation length ${conversation.length} vs max ${config.max_questions}`);
        }
      } catch (aiError) {
        console.error('Error generating next question:', aiError);
        // If we can't generate a question, consider this complete to allow moving forward
        isComplete = true;
        nextQuestion = '';
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

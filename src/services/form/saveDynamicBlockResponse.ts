import { createClient } from '@/lib/supabase/client';
import { createPublicClient } from '@/lib/supabase/publicClient';
import { QAPair } from '@/types/supabase-types';
import { SaveDynamicResponseInput, SaveDynamicResponseResult, DynamicResponseData } from '@/types/form-service-types';
import { processConversation } from '@/services/ai/processConversation';
import { getFormContextClient } from './getFormContextClient';
import { ProcessConversationParams } from '@/types/ai-types';
import { formatFormContext } from './getFormContext';

/**
 * Save a response to a dynamic block and generate the next question if needed
 * 
 * @param input - Object containing response data
 * @returns Success status with conversation data and next question (if available)
 */
export async function saveDynamicBlockResponse(input: SaveDynamicResponseInput): Promise<SaveDynamicResponseResult> {
  const { 
    responseId, 
    blockId, 
    formId,
    answer,
    question,
    mode = 'viewer'
  } = input;

  // Generate request ID for tracing logs
  const requestId = Math.random().toString(36).substring(2, 9);
  console.log(`[${requestId}] saveDynamicBlockResponse called with:`, { 
    responseId, blockId, formId, 
    answerLength: typeof answer === 'string' ? answer.length : 'not-string',
    mode,
    isComplete: input.isComplete,
    questionIndex: input.questionIndex
  });

  try {
    // Input validation 
    if (!responseId || !blockId || !formId) {
      console.error(`[${requestId}] Missing required fields:`, { responseId, blockId, formId });
      return {
        success: false,
        error: 'Missing required fields: responseId, blockId, or formId'
      };
    }

    if (typeof answer !== 'string') {
      console.error(`[${requestId}] Invalid answer type:`, typeof answer);
      return {
        success: false,
        error: 'Answer value must be a string'
      };
    }

    // Select client based on mode
    const supabase = mode === 'viewer' ? createPublicClient() : createClient();
    console.log(`[${requestId}] Using ${mode} mode supabase client`);

    // Get current conversation from the database
    console.log(`[${requestId}] Fetching current conversation`);
    const { data: currentQAPairs, error: fetchError } = await supabase
      .from('dynamic_block_responses')
      .select('conversation')
      .eq('response_id', responseId)
      .eq('block_id', blockId)
      .single();

    if (fetchError) {
      console.error(`[${requestId}] Error fetching conversation:`, fetchError);
      
      // If the error is not found, it's a new conversation
      if (fetchError.code === 'PGRST116') {
        console.log(`[${requestId}] No existing conversation found, creating new conversation`);
      } else {
        return {
          success: false,
          error: `Database error: ${fetchError.message}`
        };
      }
    }

    // Use the existing conversation or initialize a new one
    let conversation: QAPair[] = currentQAPairs?.conversation || [];
    console.log(`[${requestId}] Current conversation length:`, conversation.length);

    // Check if we need to truncate the conversation
    const questionIndex = input.questionIndex ?? null;
    if (questionIndex !== null && questionIndex >= 0 && questionIndex < conversation.length) {
      console.log(`[${requestId}] Truncating conversation at index ${questionIndex}`);
      conversation = conversation.slice(0, questionIndex);
    }

    // Add the new answer to the conversation
    // Note: When answering the starter question, there's no existing question to respond to
    if (input.isStarterQuestion) {
      console.log(`[${requestId}] Processing starter question answer`);
      conversation.push({
        question: question || "What's your answer?", // Default question text
        answer: answer,
        timestamp: new Date().toISOString(),
        is_starter: true
      });
    } else {
      // For regular questions, there should be an existing question to respond to
      // This is typically the previous "nextQuestion" that was presented to the user
      console.log(`[${requestId}] Adding answer to existing conversation`);
      conversation.push({
        question: question || (conversation.length > 0 ? 'Follow-up question' : 'Initial question'),
        answer: answer,
        timestamp: new Date().toISOString(),
        is_starter: false
      });
    }

    let nextQuestion = '';
    let isComplete = input.isComplete || false;
    
    // Get form context for AI - we need this to check max_questions
    const context = await getFormContextClient(formId, blockId);
    
    // Fetch block configuration to get maxQuestions limit
    const { data: blockConfig } = await supabase
      .from('dynamic_block_configs')
      .select('max_questions')
      .eq('block_id', blockId)
      .single();
    
    const maxQuestions = blockConfig?.max_questions || 5;
    
    // Check if we've reached max questions - if so, mark as complete
    const hasReachedMaxQuestions = maxQuestions > 0 && conversation.length >= maxQuestions;
    
    if (hasReachedMaxQuestions) {
      console.log(`[${requestId}] Reached maximum questions (${maxQuestions}), marking conversation as complete`);
      isComplete = true;
      nextQuestion = ''; // Clear next question when max questions is reached
    }
    
    // Process the conversation to generate the next question if not marked as complete
    if (!isComplete) {
      try {
        console.log(`[${requestId}] Generating next question`);
        
        // Double-check maxQuestions limit before generating a new question
        if (hasReachedMaxQuestions) {
          console.log(`[${requestId}] Skipping question generation as max questions (${maxQuestions}) reached`);
        } else {
          // Process the conversation to generate a next question
          // Extract questions and answers for the AI
          const prevQuestions = conversation.map(qa => qa.question);
          const prevAnswers = conversation.map(qa => qa.answer);
          
          const params: ProcessConversationParams = {
            prevQuestions,
            prevAnswers,
            instructions: 'You are an interviewer asking follow-up questions based on previous responses.',
            temperature: 0.7,
            formContext: context
          };
        
          // Generate the next question from the AI
          const result = await processConversation(params);
          if (result.success && result.data) {
            nextQuestion = result.data;
            console.log(`[${requestId}] Generated next question (length: ${nextQuestion.length})`);
          } else {
            console.error(`[${requestId}] Failed to generate next question:`, result.error);
            return {
              success: false,
              error: `AI processing error: ${result.error || 'Unknown error'}`
            };
          }
        }
      } catch (aiError) {
        console.error(`[${requestId}] Error processing conversation with AI:`, aiError);
        return {
          success: false,
          error: `AI processing error: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`
        };
      }
    } else {
      console.log(`[${requestId}] Conversation marked as complete, skipping next question generation`);
    }

    // Update the database with the new conversation
    console.log(`[${requestId}] Updating database with updated conversation`);
    const { error: updateError } = await supabase
      .from('dynamic_block_responses')
      .upsert({
        response_id: responseId,
        block_id: blockId,
        conversation: conversation,
        next_question: nextQuestion,
        updated_at: new Date().toISOString()
      }, { onConflict: 'response_id,block_id' });

    if (updateError) {
      console.error(`[${requestId}] Error updating conversation:`, updateError);
      return {
        success: false,
        error: `Database update error: ${updateError.message}`
      };
    }

    // Return success result with the updated conversation and next question
    console.log(`[${requestId}] Successfully saved response`);
    return {
      success: true,
      data: {
        conversation: conversation,
        nextQuestion: nextQuestion || '',
        isComplete: Boolean(isComplete)
      }
    };
  } catch (error) {
    // Catch any unexpected errors
    console.error(`[${requestId}] Unexpected error in saveDynamicBlockResponse:`, error);
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

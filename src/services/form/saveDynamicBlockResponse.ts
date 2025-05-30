import { createClient } from '@/lib/supabase/client';
import { createPublicClient } from '@/lib/supabase/publicClient';
import { ApiQAPair, DbQAPair } from '@/types/response';
import { SaveDynamicResponseInput, SaveDynamicResponseResult } from '@/types/form-service-types';
import { processConversation } from '@/services/ai/processConversation';
import { getFormContextClient } from './getFormContextClient';
import { ProcessConversationParams } from '@/types/ai-types';
import type { DbDynamicBlockResponse } from '@/types/response/DbResponse';

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
    questionContent,
    answerContent,
    mode = 'viewer'
  } = input;

  // Generate request ID for tracing logs
  const requestId = Math.random().toString(36).substring(2, 9);
  console.log(`[${requestId}] saveDynamicBlockResponse called with:`, { 
    responseId, blockId, formId, 
    answerLength: typeof answerContent === 'string' ? answerContent.length : 'not-string',
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

    if (!answerContent) {
      console.error(`[${requestId}] Answer is required`);
      return { success: false, error: 'Answer is required' };
    }

    // Select client based on mode
    const supabase = mode === 'viewer' ? createPublicClient() : createClient();
    console.log(`[${requestId}] Using ${mode} mode supabase client`);

    // Get current conversation from the database
    console.log(`[${requestId}] Fetching current conversation`);
    const { data: currentResponse, error: fetchError } = await supabase
      .from('dynamic_block_responses')
      .select('*')
      .eq('id', responseId)
      .single();

    if (fetchError || !currentResponse) {
      console.error(`[${requestId}] Error fetching current response:`, fetchError);
      // If no existing response, create a new one with the first question-answer pair
      const newResponse: DbDynamicBlockResponse = {
        id: responseId,
        response_id: responseId,
        block_id: blockId,
        started_at: new Date().toISOString(),
        updated_at: null,
        completed_at: null,
        conversation: [
          {
            type: 'question',
            content: questionContent,
            timestamp: new Date().toISOString(),
            is_starter: true
          } as DbQAPair,
          {
            type: 'answer',
            content: answerContent,
            timestamp: new Date().toISOString(),
            is_starter: true
          } as DbQAPair
        ],
        next_type: "question", content: null
      };

      const { error: insertError } = await supabase
        .from('dynamic_block_responses')
        .insert(newResponse);

      if (insertError) {
        console.error(`[${requestId}] Error creating new response:`, insertError);
        return { success: false, error: insertError.message };
      }

      // Get the form context for AI processing
      const formContext = await getFormContextClient(formId, blockId);
      if (!formContext) {
        console.error(`[${requestId}] Form context not found for form ${formId}`);
        return { 
          success: true, 
          data: { 
            conversation: [{ 
              type: 'question', 
              content: questionContent, 
              timestamp: new Date().toISOString(),
              isStarter: true 
            }, { 
              type: 'answer', 
              content: answerContent, 
              timestamp: new Date().toISOString(),
              isStarter: true 
            }],
            nextQuestion: '',
            isComplete: false
          } 
        };
      }

      // Initialize isComplete from input
      let isComplete = input.isComplete || false;

      // Check if we need to truncate the conversation
      const questionIndex = input.questionIndex ?? null;
      if (questionIndex !== null && questionIndex >= 0 && questionIndex < 1) {
        console.log(`[${requestId}] Truncating conversation at index ${questionIndex}`, {
          originalLength: 1,
          truncatingAt: questionIndex,
          isEditingPrevious: questionIndex < 1 - 1,
          willKeep: questionIndex,
          willRemove: 1 - questionIndex
        });
        
        // When editing a previous answer, we need to truncate the conversation and regenerate
        const conversation: DbQAPair[] = [{
          type: 'question',
          content: questionContent,
          timestamp: new Date().toISOString(),
          is_starter: true
        }, {
          type: 'answer',
          content: answerContent,
          timestamp: new Date().toISOString(),
          is_starter: true
        }];
        
        // Force isComplete to false when editing ANY previous answer to ensure regeneration
        isComplete = false;
        
        // Log the truncation
        console.log(`[${requestId}] Conversation truncated to length ${conversation.length}, isComplete set to ${isComplete}`);
      } else {
      }

      let nextQuestion = '';
      
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
      const hasReachedMaxQuestions = maxQuestions > 0 && 1 >= maxQuestions;
      
      // Enhanced logging around maxQuestions to debug the issue
      console.log(`[${requestId}] MaxQuestions check:`, {
        maxQuestions,
        conversationLength: 1, 
        hasReachedMaxQuestions,
        isComplete,
        isCompleteBefore: input.isComplete,
        shouldSkipGeneration: hasReachedMaxQuestions || isComplete,
        isExactlyAtMax: 1 === maxQuestions
      });
      
      if (hasReachedMaxQuestions) {
        console.log(`[${requestId}] Reached maximum questions (${maxQuestions}), marking conversation as complete`);
        isComplete = true;
        nextQuestion = ''; // Clear next question when max questions is reached
      }
      
      // Process the conversation to generate the next question if not marked as complete
      // AND we haven't reached max questions (double-check to prevent the extra question bug)
      if (!isComplete && !hasReachedMaxQuestions) {
        try {
          console.log(`[${requestId}] Generating next question`);
          
          // Process the conversation to generate a next question
          // Extract questions and answers for the AI
          const prevQuestions: string[] = [];
          const prevAnswers: string[] = [];
          
          // Process the conversation to extract questions and answers
          const conversation = [{
            type: 'question' as const,
            content: questionContent,
            timestamp: new Date().toISOString(),
            isStarter: true
          }, {
            type: 'answer' as const,
            content: answerContent,
            timestamp: new Date().toISOString(),
            isStarter: true
          }];
          
          for (let i = 0; i < conversation.length; i++) {
            const item = conversation[i];
            if (item.type === 'question' && i + 1 < conversation.length && conversation[i + 1].type === 'answer') {
              prevQuestions.push(item.content);
              prevAnswers.push(conversation[i + 1].content);
            }
          }
          
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
            console.error(`[${requestId}] Failed to generate next type: "question", content:`, result.error);
            return {
              success: false,
              error: `AI processing error: ${result.error || 'Unknown error'}`
            };
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
      // Convert the API format back to DB format for storage
      const dbConversationToSave: DbQAPair[] = [{
        type: 'question',
        content: questionContent,
        timestamp: new Date().toISOString(),
        is_starter: true
      }, {
        type: 'answer',
        content: answerContent,
        timestamp: new Date().toISOString(),
        is_starter: true
      }];
      
      console.log(`[${requestId}] Updating database with updated conversation`, {
        conversationLength: 1,
        isComplete,
        hasNextQuestion: !!nextQuestion,
        nextQuestionLength: nextQuestion?.length || 0
      });
      const { error: updateError } = await supabase
        .from('dynamic_block_responses')
        .upsert({
          response_id: responseId,
          block_id: blockId,
          conversation: dbConversationToSave,
          next_type: "question", content: nextQuestion,
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
          conversation: [{
            type: 'question' as const,
            content: questionContent,
            timestamp: new Date().toISOString(),
            isStarter: true
          }, {
            type: 'answer' as const,
            content: answerContent,
            timestamp: new Date().toISOString(),
            isStarter: true
          }],
          nextQuestion: nextQuestion || '',
          isComplete: Boolean(isComplete)
        }
      };
    } else {
      // Use the existing conversation or initialize a new one
      // Convert DB format to API format if necessary
      const dbConversation: DbQAPair[] = currentResponse.conversation || [];
      let conversation: ApiQAPair[] = dbConversation.map(item => ({
        type: item.type,
        content: item.content,
        timestamp: item.timestamp,
        isStarter: item.is_starter
      }));
      console.log(`[${requestId}] Current conversation length:`, conversation.length);

      // Initialize isComplete from input
      let isComplete = input.isComplete || false;

      // Check if we need to truncate the conversation
      const questionIndex = input.questionIndex ?? null;
      if (questionIndex !== null && questionIndex >= 0 && questionIndex < conversation.length) {
        console.log(`[${requestId}] Truncating conversation at index ${questionIndex}`, {
          originalLength: conversation.length,
          truncatingAt: questionIndex,
          isEditingPrevious: questionIndex < conversation.length - 1,
          willKeep: questionIndex,
          willRemove: conversation.length - questionIndex
        });
        
        // When editing a previous answer, we need to truncate the conversation and regenerate
        conversation = conversation.slice(0, questionIndex);
        
        // Force isComplete to false when editing ANY previous answer to ensure regeneration
        isComplete = false;
        
        // Log the truncation
        console.log(`[${requestId}] Conversation truncated to length ${conversation.length}, isComplete set to ${isComplete}`);
      }

      // Add the new answer to the conversation
      // Note: When answering the starter question, there's no existing question to respond to
      if (input.isStarterQuestion) {
        const originalQuestion = questionContent;
        console.log(`[${requestId}] Processing starter question type: "answer", content:`, { 
          originalQuestion, 
          questionLength: questionContent?.length || 0,
          isEmpty: !questionContent || questionContent.length === 0,
          isStarterQuestion: input.isStarterQuestion,
          fallbackUsed: !questionContent
        });
        
        // Only use the fallback if question is completely missing, not just empty
        const finalQuestion = questionContent !== undefined ? questionContent : "What's your starter question?";
        
        // Prepare the new QA pair
        const isFirstQuestion = conversation.length === 0;
        const timestamp = new Date().toISOString();
        
        // Create new question and answer pairs with the provided data
        const newQuestion: ApiQAPair = {
          type: 'question',
          content: finalQuestion,
          timestamp: timestamp,
          isStarter: isFirstQuestion
        };
        
        const newAnswer: ApiQAPair = {
          type: 'answer',
          content: answerContent,
          timestamp: timestamp,
          isStarter: isFirstQuestion
        };
        
        // Add the new question and answer to the conversation
        conversation.push(newQuestion);
        conversation.push(newAnswer);
        console.log(`[${requestId}] Added new Q&A pair, conversation now has ${conversation.length} entries`);
      } else {
        // For regular questions, there should be an existing question to respond to
        // This is typically the previous "nextQuestion" that was presented to the user
        console.log(`[${requestId}] Adding answer to existing conversation:`, { question: questionContent });
        
        // Prepare the new QA pair
        const isFirstQuestion = conversation.length === 0;
        const timestamp = new Date().toISOString();
        
        // Create new question and answer pairs with the provided data
        const newQuestion: ApiQAPair = {
          type: 'question',
          content: questionContent || (conversation.length > 0 ? 'Follow-up question' : 'Initial question'),
          timestamp: timestamp,
          isStarter: isFirstQuestion
        };
        
        const newAnswer: ApiQAPair = {
          type: 'answer',
          content: answerContent,
          timestamp: timestamp,
          isStarter: isFirstQuestion
        };
        
        // Add the new question and answer to the conversation
        conversation.push(newQuestion);
        conversation.push(newAnswer);
        console.log(`[${requestId}] Added new Q&A pair, conversation now has ${conversation.length} entries`);
      }

      let nextQuestion = '';
      
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
      
      // Enhanced logging around maxQuestions to debug the issue
      console.log(`[${requestId}] MaxQuestions check:`, {
        maxQuestions,
        conversationLength: conversation.length, 
        hasReachedMaxQuestions,
        isComplete,
        isCompleteBefore: input.isComplete,
        shouldSkipGeneration: hasReachedMaxQuestions || isComplete,
        isExactlyAtMax: conversation.length === maxQuestions
      });
      
      if (hasReachedMaxQuestions) {
        console.log(`[${requestId}] Reached maximum questions (${maxQuestions}), marking conversation as complete`);
        isComplete = true;
        nextQuestion = ''; // Clear next question when max questions is reached
      }
      
      // Process the conversation to generate the next question if not marked as complete
      // AND we haven't reached max questions (double-check to prevent the extra question bug)
      if (!isComplete && !hasReachedMaxQuestions) {
        try {
          console.log(`[${requestId}] Generating next question`);
          
          // Process the conversation to generate a next question
          // Extract questions and answers for the AI
          const prevQuestions: string[] = [];
          const prevAnswers: string[] = [];
          
          // Process the conversation to extract questions and answers
          for (let i = 0; i < conversation.length; i++) {
            const item = conversation[i];
            if (item.type === 'question' && i + 1 < conversation.length && conversation[i + 1].type === 'answer') {
              prevQuestions.push(item.content);
              prevAnswers.push(conversation[i + 1].content);
            }
          }
          
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
            console.error(`[${requestId}] Failed to generate next type: "question", content:`, result.error);
            return {
              success: false,
              error: `AI processing error: ${result.error || 'Unknown error'}`
            };
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
      // Convert the API format back to DB format for storage
      const dbConversationToSave: DbQAPair[] = conversation.map(item => ({
        type: item.type,
        content: item.content,
        timestamp: item.timestamp,
        is_starter: item.isStarter
      }));
      
      console.log(`[${requestId}] Updating database with updated conversation`, {
        conversationLength: conversation.length,
        isComplete,
        hasNextQuestion: !!nextQuestion,
        nextQuestionLength: nextQuestion?.length || 0
      });
      const { error: updateError } = await supabase
        .from('dynamic_block_responses')
        .upsert({
          response_id: responseId,
          block_id: blockId,
          conversation: dbConversationToSave,
          next_type: "question", content: nextQuestion,
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
          conversation: conversation, // This is now properly typed as ApiQAPair[]
          nextQuestion: nextQuestion || '',
          isComplete: Boolean(isComplete)
        }
      };
    }
  } catch (error) {
    // Catch any unexpected errors
    console.error(`[${requestId}] Unexpected error in saveDynamicBlockResponse:`, error);
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

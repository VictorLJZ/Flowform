import { createClient } from '@/lib/supabase/client';
import { createPublicClient } from '@/lib/supabase/publicClient';
import { DbQAPair, ApiQAPair, DbDynamicBlockResponse } from '@/types/response';
import { generateQuestion } from '@/services/ai/generateQuestion';

/**
 * Save a dynamic response and generate the next question
 * 
 * @param responseId - The ID of the form response
 * @param blockId - The ID of the dynamic block
 * @param currentQuestion - The current question that was answered
 * @param answer - The user's answer to the current question
 * @param isFirstQuestion - Whether this is the first question in the conversation
 * @param mode - Optional mode flag ('builder' or 'viewer') - uses public client when in viewer mode
 * @returns The updated conversation and next question (if any)
 */
export async function saveDynamicResponse(
  responseId: string,
  blockId: string,
  currentQuestion: string,
  answer: string,
  isFirstQuestion = false,
  mode: 'builder' | 'viewer' = 'viewer' // Default to viewer mode for public access
): Promise<{ 
  conversation: ApiQAPair[]; 
  nextQuestion: string | null;
  isComplete: boolean;
}> {
  // Use public client for viewer mode, standard client for builder mode
  const supabase = mode === 'viewer' ? createPublicClient() : createClient();
  
  // First, get the existing conversation or create a new one
  let existingConversation: DbDynamicBlockResponse | null = null;
  
  if (!isFirstQuestion) {
    // Try to fetch existing conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('dynamic_block_responses')
      .select('*')
      .eq('response_id', responseId)
      .eq('block_id', blockId)
      .single();
    
    if (conversationError && conversationError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching dynamic response:', conversationError);
      throw conversationError;
    }
    
    existingConversation = conversation;
  }
  
  // Get the block data for settings
  const { data: blockData, error: blockError } = await supabase
    .from('form_blocks')
    .select('*')
    .eq('id', blockId)
    .single();
  
  if (blockError) {
    console.error('Error fetching block data:', blockError);
    throw blockError;
  }
  
  // Extract settings from block data
  const temperature = blockData.settings?.temperature || 0.7;
  const maxQuestions = blockData.settings?.maxQuestions || 3;
  const contextInstructions = blockData.settings?.contextInstructions || '';
  
  // Create the new Q&A pair
  const newQAPair: DbQAPair = {
    type: 'question',
    content: currentQuestion,
    timestamp: new Date().toISOString(),
    is_starter: isFirstQuestion
  };
  
  // Create the corresponding answer pair
  const newAnswerPair: DbQAPair = {
    type: 'answer',
    content: answer,
    timestamp: new Date().toISOString(),
    is_starter: isFirstQuestion
  };
  
  // Legacy format types for conversion - using specific types instead of any
  type OldQAPairFormat = {
    question?: string;
    answer?: string;
    timestamp?: string;
    isStarter?: boolean;
  };
  
  type ApiLikeQAPairFormat = { 
    type: 'question' | 'answer'; 
    content: string; 
    timestamp?: string; 
    isStarter?: boolean 
  };
  
  // Helper function to convert old QAPair format to new DbQAPair format
  const convertOldQAPairsToNew = (oldConversation: unknown[]): DbQAPair[] => {
    const newConversation: DbQAPair[] = [];
    
    for (let i = 0; i < oldConversation.length; i += 1) {
      const item = oldConversation[i];
      
      // Skip non-object items
      if (!item || typeof item !== 'object') continue;
      
      // Handle legacy format with question/answer properties
      if ('question' in item || 'answer' in item) {
        const qaPair = item as OldQAPairFormat;
        if (qaPair.question) {
          newConversation.push({
            type: 'question',
            content: qaPair.question,
            timestamp: qaPair.timestamp || new Date().toISOString(),
            is_starter: qaPair.isStarter || false
          });
        }
        if (qaPair.answer) {
          newConversation.push({
            type: 'answer',
            content: qaPair.answer,
            timestamp: qaPair.timestamp || new Date().toISOString(),
            is_starter: qaPair.isStarter || false
          });
        }
      } 
      // Handle API-like format with type property
      else if ('type' in item && 'content' in item) {
        const qaPair = item as ApiLikeQAPairFormat;
        newConversation.push({
          type: qaPair.type,
          content: qaPair.content,
          timestamp: qaPair.timestamp || new Date().toISOString(),
          is_starter: qaPair.isStarter || false
        });
      }
    }
    
    return newConversation;
  };
  
  // Prepare the conversation array
  let conversation: DbQAPair[] = [];
  
  if (existingConversation) {
    // Add to existing conversation - but check if answer is already a QAPair array
    if (Array.isArray(answer) && answer.length > 0 && 
        typeof answer[0] === 'object' && ('type' in answer[0] || 'question' in answer[0])) {
      console.log('Detected conversation being passed as answer, ignoring to prevent duplication');
      // Convert existing conversation to new format if needed
      conversation = convertOldQAPairsToNew(existingConversation.conversation);
    } else {
      // Normal case - add new QA pairs to conversation
      // Convert existing conversation to new format if needed
      const existingInNewFormat = convertOldQAPairsToNew(existingConversation.conversation);
      conversation = [...existingInNewFormat, newQAPair, newAnswerPair];
    }
  } else {
    // Start new conversation
    conversation = [newQAPair, newAnswerPair];
  }
  
  // Check if we've reached the maximum number of questions
  const isComplete = conversation.length >= maxQuestions;
  
  // Generate the next question if we haven't reached the maximum
  let nextQuestion: string | null = null;
  
  if (!isComplete) {
    // Format conversation for AI
    const aiConversation = [];
    
    // Process pairs in order
    for (let i = 0; i < conversation.length; i += 2) {
      const questionPair = conversation[i];
      const answerPair = conversation[i + 1];
      
      if (questionPair && questionPair.type === 'question') {
        aiConversation.push({ role: 'assistant', content: questionPair.content });
      }
      
      if (answerPair && answerPair.type === 'answer') {
        aiConversation.push({ role: 'user', content: answerPair.content });
      }
    }
    
    // Add the AI instructions as a system message
    aiConversation.unshift({ 
      role: 'developer', 
      content: contextInstructions || 'Generate a follow-up question based on the previous conversation.'
    });
    
    // Generate the next question
    try {
      const result = await generateQuestion(
        aiConversation, 
        contextInstructions,
        temperature
      );
      
      if (result.success) {
        nextQuestion = result.data || null; // Ensure null instead of undefined
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error generating next type: "question", content:', error);
      throw error;
    }
  }
  
  // Save the updated conversation
  if (existingConversation) {
    // Update existing record
    const { error: updateError } = await supabase
      .from('dynamic_block_responses')
      .update({
        conversation: conversation,
        completed_at: isComplete ? new Date().toISOString() : null
      })
      .eq('id', existingConversation.id);
    
    if (updateError) {
      console.error('Error updating dynamic response:', updateError);
      throw updateError;
    }
  } else {
    // Create new record
    const { error: insertError } = await supabase
      .from('dynamic_block_responses')
      .insert({
        response_id: responseId,
        block_id: blockId,
        conversation: conversation,
        completed_at: isComplete ? new Date().toISOString() : null
      });
    
    if (insertError) {
      console.error('Error creating dynamic response:', insertError);
      throw insertError;
    }
  }
  
  // Convert DbQAPair[] to ApiQAPair[] for the return value
  const apiConversation: ApiQAPair[] = conversation.map(dbPair => ({
    type: dbPair.type,
    content: dbPair.content,
    timestamp: dbPair.timestamp,
    isStarter: dbPair.is_starter
  }));
  
  return {
    conversation: apiConversation,
    nextQuestion,
    isComplete
  };
}

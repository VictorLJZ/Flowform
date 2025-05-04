import { createClient } from '@/lib/supabase/client';
import { createPublicClient } from '@/lib/supabase/publicClient';
import { DynamicBlockResponse, DynamicBlockConfig, QAPair } from '@/types/supabase-types';
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
  conversation: QAPair[]; 
  nextQuestion: string | null;
  isComplete: boolean;
}> {
  // Use public client for viewer mode, standard client for builder mode
  const supabase = mode === 'viewer' ? createPublicClient() : createClient();
  
  // First, get the existing conversation or create a new one
  let existingConversation: DynamicBlockResponse | null = null;
  let dynamicConfig: DynamicBlockConfig | null = null;
  
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
  
  // Get the dynamic block configuration
  const { data: config, error: configError } = await supabase
    .from('dynamic_block_configs')
    .select('*')
    .eq('block_id', blockId)
    .single();
  
  if (configError) {
    console.error('Error fetching dynamic block config:', configError);
    throw configError;
  }
  
  dynamicConfig = config;
  
  // Create the new Q&A pair
  const newQAPair: QAPair = {
    question: currentQuestion,
    answer: answer,
    timestamp: new Date().toISOString(),
    is_starter: isFirstQuestion
  };
  
  // Prepare the conversation array
  let conversation: QAPair[] = [];
  
  if (existingConversation) {
    // Add to existing conversation
    conversation = [...existingConversation.conversation, newQAPair];
  } else {
    // Start new conversation
    conversation = [newQAPair];
  }
  
  // Check if we've reached the maximum number of questions
  const isComplete = conversation.length >= (dynamicConfig?.max_questions || 5); // Default to 5 if not set
  
  // Generate the next question if we haven't reached the maximum
  let nextQuestion: string | null = null;
  
  if (!isComplete) {
    // Format conversation for AI
    const aiConversation = conversation.map(qa => [
      { role: 'assistant', content: qa.question },
      { role: 'user', content: qa.answer }
    ]).flat();
    
    // Add the AI instructions as a system message
    aiConversation.unshift({ 
      role: 'developer', 
      content: dynamicConfig?.ai_instructions || 'Generate a follow-up question based on the previous conversation.'
    });
    
    // Generate the next question
    try {
      const result = await generateQuestion(
        aiConversation, 
        dynamicConfig?.ai_instructions || '',
        dynamicConfig?.temperature || 0.7 // Default temperature if not set
      );
      
      if (result.success) {
        nextQuestion = result.data || null; // Ensure null instead of undefined
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error generating next question:', error);
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
  
  return {
    conversation,
    nextQuestion,
    isComplete
  };
}

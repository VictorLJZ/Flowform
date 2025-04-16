import { createClient } from '@/lib/supabase/client';

type GetQuestionResult = {
  success: boolean;
  data?: {
    question: string;
    blockId: string;
    temperature: number;
    maxQuestions: number;
    aiInstructions: string | null;
  };
  error?: string;
};

/**
 * Get the starter question for a dynamic block
 * 
 * @param blockId - The ID of the dynamic block
 * @returns Success status with the question and configuration data
 */
export async function getDynamicBlockQuestion(blockId: string): Promise<GetQuestionResult> {
  const supabase = createClient();
  
  try {
    // First, verify this is a dynamic block
    const { data: block, error: blockError } = await supabase
      .from('form_blocks')
      .select('*')
      .eq('id', blockId)
      .single();
      
    if (blockError) {
      console.error('Error fetching block:', blockError);
      return { success: false, error: 'Block not found' };
    }
    
    if (block.type !== 'dynamic') {
      return { success: false, error: 'Not a dynamic block' };
    }
    
    // Get the dynamic block configuration
    const { data: config, error: configError } = await supabase
      .from('dynamic_block_configs')
      .select('*')
      .eq('block_id', blockId)
      .single();
      
    if (configError) {
      console.error('Error fetching dynamic block config:', configError);
      return { success: false, error: 'Failed to retrieve block configuration' };
    }
    
    return {
      success: true,
      data: {
        question: config.starter_question,
        blockId,
        temperature: config.temperature,
        maxQuestions: config.max_questions,
        aiInstructions: config.ai_instructions
      }
    };
    
  } catch (error: unknown) {
    console.error('Error getting dynamic block question:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

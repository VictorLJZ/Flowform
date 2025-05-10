import { createClient } from '@/lib/supabase/client';
import { GetQuestionResult } from '@/types/form-service-types';

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
    
    // Use settings from the block itself instead of dynamic_block_configs
    // Extract settings from block data
    const temperature = block.settings?.temperature || 0.7;
    const maxQuestions = block.settings?.maxQuestions || 3;
    const contextInstructions = block.settings?.contextInstructions || '';
    
    return {
      success: true,
      data: {
        question: block.title, // Use block title as the starter question
        blockId,
        temperature,
        maxQuestions,
        aiInstructions: contextInstructions
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

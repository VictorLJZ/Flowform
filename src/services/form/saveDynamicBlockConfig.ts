import { createClient } from '@/lib/supabase/client';
import { mapToDynamicBlockConfig } from '@/utils/dynamicBlockMapping';
import { SaveDynamicConfigResult } from '@/types/form-service-types';

/**
 * Save dynamic block configuration directly to the form_blocks table settings
 * This should be called when a dynamic block is created or updated
 * 
 * @param blockId The ID of the dynamic block
 * @param settings The block settings from the form builder
 * @returns Success status
 */
export async function saveDynamicBlockConfig(
  blockId: string,
  settings: Record<string, unknown>
): Promise<SaveDynamicConfigResult> {
  const supabase = createClient();
  
  try {
    // Convert frontend settings to the appropriate format
    const dynamicConfig = mapToDynamicBlockConfig(settings);
    
    // Get existing block to update its settings
    const { data: existingBlock, error: blockError } = await supabase
      .from('form_blocks')
      .select('settings')
      .eq('id', blockId)
      .single();
    
    if (blockError) {
      console.error('Error fetching block:', blockError);
      throw blockError;
    }
    
    // Create updated settings by merging with existing settings
    const updatedSettings = {
      ...(existingBlock.settings || {}),
      temperature: dynamicConfig.temperature,
      maxQuestions: dynamicConfig.max_questions,
      contextInstructions: dynamicConfig.starter_question
    };
    
    // Update the form_blocks table directly
    const { data: updatedBlock, error: updateError } = await supabase
      .from('form_blocks')
      .update({ settings: updatedSettings })
      .eq('id', blockId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating block settings:', updateError);
      throw updateError;
    }
    
    return { 
      success: true, 
      data: {
        block_id: blockId,
        starter_question: dynamicConfig.starter_question,
        temperature: dynamicConfig.temperature,
        max_questions: dynamicConfig.max_questions,
        ai_instructions: dynamicConfig.ai_instructions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } 
    };
  } catch (error) {
    console.error('Failed to save dynamic block config:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

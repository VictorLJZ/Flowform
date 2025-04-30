import { createClient } from '@/lib/supabase/client';
import { mapToDynamicBlockConfig } from '@/utils/dynamicBlockMapping';
import { SaveDynamicConfigInput, SaveDynamicConfigResult, ServiceResponse } from '@/types/form-service-types';

/**
 * Save dynamic block configuration after a form block is saved
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
    // Convert frontend settings to database format
    const dynamicConfig = mapToDynamicBlockConfig(settings);
    
    // Check if config already exists for this block
    const { data: existingConfig, error: fetchError } = await supabase
      .from('dynamic_block_configs')
      .select('*')
      .eq('block_id', blockId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found, which is fine
      console.error('Error checking for existing dynamic block config:', fetchError);
      throw fetchError;
    }
    
    // Update or insert config
    if (existingConfig) {
      // Update existing config
      const { error: updateError } = await supabase
        .from('dynamic_block_configs')
        .update({
          starter_question: dynamicConfig.starter_question,
          temperature: dynamicConfig.temperature,
          max_questions: dynamicConfig.max_questions,
          ai_instructions: dynamicConfig.ai_instructions,
          updated_at: new Date().toISOString()
        })
        .eq('block_id', blockId);
      
      if (updateError) {
        console.error('Error updating dynamic block config:', updateError);
        throw updateError;
      }
    } else {
      // Insert new config
      const { error: insertError } = await supabase
        .from('dynamic_block_configs')
        .insert({
          block_id: blockId,
          starter_question: dynamicConfig.starter_question,
          temperature: dynamicConfig.temperature,
          max_questions: dynamicConfig.max_questions,
          ai_instructions: dynamicConfig.ai_instructions
        });
      
      if (insertError) {
        console.error('Error creating dynamic block config:', insertError);
        throw insertError;
      }
    }
    
    return { success: true, data: existingConfig || dynamicConfig };
  } catch (error) {
    console.error('Failed to save dynamic block config:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

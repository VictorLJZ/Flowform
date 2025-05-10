import { createClient } from '@/lib/supabase/client';
import { FormBlockInput, DynamicConfigInput, FormBlockCreationResult } from '@/types/form-service-types';
import { invalidateFormCache } from './invalidateCache';

/**
 * Create a new form block
 * 
 * @param blockData - The block data to create
 * @param dynamicConfig - Optional dynamic block configuration (required if type is 'dynamic')
 * @returns The newly created block with dynamic config if applicable
 */
export async function createFormBlock(
  blockData: FormBlockInput,
  dynamicConfig?: DynamicConfigInput
): Promise<FormBlockCreationResult> {
  const supabase = createClient();

  // Validate that dynamic blocks have config
  if (blockData.type === 'dynamic' && !dynamicConfig) {
    throw new Error('Dynamic blocks require configuration');
  }

  // Create the form block
  const { data: block, error: blockError } = await supabase
    .from('form_blocks')
    .insert(blockData)
    .select()
    .single();

  if (blockError) {
    console.error('Error creating form block:', blockError);
    throw blockError;
  }

  // If this is a dynamic block, create the configuration
  if (block.type === 'dynamic' && dynamicConfig) {
    // Instead of creating a separate config entry, add the configuration to the block settings
    const updatedSettings = {
      ...block.settings,
      temperature: dynamicConfig.temperature || 0.7,
      maxQuestions: dynamicConfig.max_questions || 3,
      contextInstructions: dynamicConfig.ai_instructions || ''
    };
    
    // Update the block with dynamic settings
    const { data: updatedBlock, error: updateError } = await supabase
      .from('form_blocks')
      .update({ settings: updatedSettings })
      .eq('id', block.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating block with dynamic settings:', updateError);
      throw updateError;
    }
    
    // Invalidate form cache after successful dynamic block creation
    invalidateFormCache(block.form_id);
    
    return updatedBlock;
  }

  // Invalidate form cache after successful static block creation
  invalidateFormCache(block.form_id);

  return block;
}

import { createClient } from '@/lib/supabase/client';
import { DynamicBlockConfig } from '@/types/supabase-types';
import { FormBlockUpdateInput, FormBlockCreationResult } from '@/types/form-service-types';
import { invalidateFormCache } from './invalidateCache';

// Define this one here as it was not included in our centralized types
type DynamicConfigUpdateInput = Partial<Pick<DynamicBlockConfig,
  'starter_question' |
  'temperature' |
  'max_questions' |
  'ai_instructions'
>>;

/**
 * Update an existing form block
 * 
 * @param blockId - The ID of the block to update
 * @param blockData - The block data to update
 * @param dynamicConfig - Optional dynamic block configuration updates
 * @returns The updated block with dynamic config if applicable
 */
export async function updateFormBlock(
  blockId: string,
  blockData: Omit<FormBlockUpdateInput, 'id'>,
  dynamicConfig?: DynamicConfigUpdateInput
): Promise<FormBlockCreationResult> {
  const supabase = createClient();

  // First, fetch the current block to check its type
  const { data: existingBlock, error: fetchError } = await supabase
    .from('form_blocks')
    .select('*')
    .eq('id', blockId)
    .single();

  if (fetchError) {
    console.error('Error fetching form block:', fetchError);
    throw fetchError;
  }

  // Update the form block
  const { data: updatedBlock, error: updateError } = await supabase
    .from('form_blocks')
    .update({
      ...blockData,
      updated_at: new Date().toISOString()
    })
    .eq('id', blockId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating form block:', updateError);
    throw updateError;
  }

  // If this is a dynamic block and we have config updates, apply them
  if (existingBlock.type === 'dynamic' && dynamicConfig) {
    const { data: config, error: configError } = await supabase
      .from('dynamic_block_configs')
      .update(dynamicConfig)
      .eq('block_id', blockId)
      .select()
      .single();

    if (configError) {
      console.error('Error updating dynamic block config:', configError);
      throw configError;
    }

    return {
      ...updatedBlock,
      dynamic_config: config
    };
  }

  // If it's a dynamic block, fetch the current config
  if (existingBlock.type === 'dynamic') {
    const { data: config, error: configError } = await supabase
      .from('dynamic_block_configs')
      .select('*')
      .eq('block_id', blockId)
      .single();

    if (configError) {
      console.error('Error fetching dynamic block config:', configError);
      throw configError;
    }

    return {
      ...updatedBlock,
      dynamic_config: config
    };
  }

  // Invalidate form cache after successful update
  invalidateFormCache(updatedBlock.form_id);

  return updatedBlock;
}

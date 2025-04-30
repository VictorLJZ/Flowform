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
    const { data: config, error: configError } = await supabase
      .from('dynamic_block_configs')
      .insert({
        block_id: block.id,
        starter_question: dynamicConfig.starter_question,
        temperature: dynamicConfig.temperature || 0.7,
        max_questions: dynamicConfig.max_questions || 5,
        ai_instructions: dynamicConfig.ai_instructions
      })
      .select()
      .single();

    if (configError) {
      console.error('Error creating dynamic block config:', configError);
      
      // Attempt to clean up the block if config creation fails
      await supabase
        .from('form_blocks')
        .delete()
        .eq('id', block.id);
        
      throw configError;
    }

    // Invalidate form cache after successful dynamic block creation
    invalidateFormCache(block.form_id);

    return {
      ...block,
      dynamic_config: config
    };
  }

  // Invalidate form cache after successful static block creation
  invalidateFormCache(block.form_id);

  return block;
}

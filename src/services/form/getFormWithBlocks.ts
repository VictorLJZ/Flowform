import { createClient } from '@/lib/supabase/client';
import { CompleteForm, Form, FormBlock, DynamicBlockConfig, BlockOption } from '@/types/supabase-types';

/**
 * Get a complete form with all its blocks, configs, and options
 * 
 * @param formId - The ID of the form to retrieve
 * @returns The complete form with blocks or null if not found
 */
export async function getFormWithBlocks(formId: string): Promise<CompleteForm | null> {
  const supabase = createClient();

  // First get the form
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('form_id', formId)
    .single();

  if (formError) {
    if (formError.code === 'PGRST116') {
      // Form not found
      return null;
    }
    console.error('Error fetching form:', formError);
    throw formError;
  }

  // Get blocks for this form
  const { data: blocks, error: blocksError } = await supabase
    .from('form_blocks')
    .select('*')
    .eq('form_id', formId)
    .order('order_index');

  if (blocksError) {
    console.error('Error fetching form blocks:', blocksError);
    throw blocksError;
  }

  // Fetch dynamic blocks configurations
  const dynamicBlocks = blocks.filter(block => block.type === 'dynamic');
  
  let dynamicConfigs: DynamicBlockConfig[] = [];
  if (dynamicBlocks.length > 0) {
    const dynamicBlockIds = dynamicBlocks.map(block => block.id);
    const { data: configs, error: configsError } = await supabase
      .from('dynamic_block_configs')
      .select('*')
      .in('block_id', dynamicBlockIds);

    if (configsError) {
      console.error('Error fetching dynamic block configs:', configsError);
      throw configsError;
    }

    dynamicConfigs = configs || [];
  }
  
  // Fetch block options for blocks with options
  const optionsBlocks = blocks.filter(block => 
    block.type === 'static' && 
    ['multiple_choice', 'scale', 'yes_no'].includes(block.subtype as string)
  );
  
  let blockOptions: BlockOption[] = [];
  if (optionsBlocks.length > 0) {
    const optionsBlockIds = optionsBlocks.map(block => block.id);
    const { data: options, error: optionsError } = await supabase
      .from('block_options')
      .select('*')
      .in('block_id', optionsBlockIds)
      .order('order_index');

    if (optionsError) {
      console.error('Error fetching block options:', optionsError);
      throw optionsError;
    }

    blockOptions = options || [];
  }

  // Assemble the complete form with blocks, their configs and options
  const blocksWithDetails = blocks.map(block => {
    const blockWithDetails: FormBlock & { 
      dynamic_config?: DynamicBlockConfig;
      options?: BlockOption[];
    } = { ...block };

    // Add dynamic config if this is a dynamic block
    if (block.type === 'dynamic') {
      blockWithDetails.dynamic_config = dynamicConfigs.find(
        config => config.block_id === block.id
      );
    }

    // Add options if this block has options
    const opts = blockOptions.filter(opt => opt.block_id === block.id);
    if (opts.length > 0) {
      blockWithDetails.options = opts;
    }

    return blockWithDetails;
  });

  // Return the complete form
  return {
    ...form,
    blocks: blocksWithDetails
  };
}

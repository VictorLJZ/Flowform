import { createClient } from '@/lib/supabase/server';
import { CompleteForm } from '@/types/form';
import type { DbBlock, DbBlockOption, DbDynamicBlockConfig } from '@/types/block/DbBlock';

/**
 * Get the latest version of a form with all its blocks, configs, and options
 * This is optimized for the form viewer to always show the most recent version
 * 
 * @param formId - The ID of the form to retrieve
 * @returns The complete form with blocks or null if not found
 */
export async function getLatestFormVersionWithBlocks(formId: string): Promise<CompleteForm | null> {
  const supabase = await createClient();

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

  // Get the latest form version if it exists
  const { data: latestVersion, error: versionError } = await supabase
    .from('form_versions')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let blocks;
  let versionId = null;

  // If we have a version, get the blocks from form_block_versions
  if (!versionError && latestVersion) {
    versionId = latestVersion.id;
    const { data: versionedBlocks, error: blocksError } = await supabase
      .from('form_block_versions')
      .select('*')
      .eq('form_version_id', versionId)
      .order('order_index');

    if (blocksError) {
      console.error('Error fetching versioned form blocks:', blocksError);
      throw blocksError;
    }

    blocks = versionedBlocks.map(vb => ({
      id: vb.block_id,
      form_id: formId,
      type: vb.type,
      subtype: vb.subtype,
      title: vb.title,
      description: vb.description,
      required: vb.required,
      order_index: vb.orderIndex,
      settings: vb.settings || {}
    }));
  } else {
    // Otherwise get the current blocks directly
    const { data: currentBlocks, error: blocksError } = await supabase
      .from('form_blocks')
      .select('*')
      .eq('form_id', formId)
      .order('order_index');

    if (blocksError) {
      console.error('Error fetching form blocks:', blocksError);
      throw blocksError;
    }

    blocks = currentBlocks;
  }

  // Fetch dynamic blocks configurations
  const dynamicBlocks = blocks.filter(block => block.type === 'dynamic');
  
  let dynamicConfigs: DbDynamicBlockConfig[] = [];
  if (dynamicBlocks.length > 0) {
    // Instead of querying a separate table, extract config from block settings
    dynamicConfigs = dynamicBlocks.map(block => {
      const settings = block.settings || {};
      return {
        block_id: block.id,
        starter_question: block.title || 'Ask me anything',
        starter_type: "question",
        temperature: settings.temperature || 0.7,
        max_questions: settings.maxQuestions || 5,
        ai_instructions: settings.contextInstructions || '',
        created_at: block.created_at,
        updated_at: block.updated_at
      } as DbDynamicBlockConfig;
    });
  }
  
  // Fetch block options for blocks with options
  const optionsBlocks = blocks.filter(block => 
    block.type === 'static' && 
    ['multiple_choice', 'checkbox_group', 'dropdown'].includes(block.subtype as string)
  );
  
  let blockOptions: DbBlockOption[] = [];
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
    const blockWithDetails: DbBlock & { 
      dynamic_config?: DbDynamicBlockConfig;
      options?: DbBlockOption[];
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

  // Return the complete form with the version ID if available
  return {
    ...form,
    blocks: blocksWithDetails,
    version_id: versionId
  };
}

import { createClient } from '@/lib/supabase/server';
import { CompleteForm, FormBlock, DynamicBlockConfig, BlockOption } from '@/types/supabase-types';

/**
 * Get a complete form with all its blocks, configs, and options
 * 
 * @param formId - The ID of the form to retrieve
 * @returns The complete form with blocks or null if not found
 */
export async function getFormWithBlocks(formId: string): Promise<CompleteForm | null> {
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

  // Define proper interface for workflow edges
  interface WorkflowEdge {
    id: string;
    form_id: string;
    source_block_id: string;
    target_block_id: string;
    order_index: number;
    condition_type?: string;
    condition_field?: string;
    condition_operator?: string;
    condition_value?: string | number | boolean | null;
    condition_json?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  // Fetch workflow connections for this form
  let workflowEdges: WorkflowEdge[] = [];
  try {
    const { data: edges, error: edgesError } = await supabase
      .from('workflow_edges')
      .select('*')
      .eq('form_id', formId)
      .order('order_index');

    if (edgesError) {
      console.error('Error fetching workflow edges:', edgesError);
      // Don't throw here to allow form to load without connections
    } else {
      workflowEdges = edges || [];
      console.log(`Fetched ${workflowEdges.length} workflow edges for form ${formId}`);
    }
  } catch (edgesError) {
    console.error('Error fetching workflow edges:', edgesError);
    // Don't throw here to allow form to load without connections
  }

  // Return the complete form with workflow edges
  return {
    ...form,
    blocks: blocksWithDetails,
    workflow_edges: workflowEdges
  };
}

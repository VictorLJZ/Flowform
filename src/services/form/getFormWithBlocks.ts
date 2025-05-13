import { createClient } from '@/lib/supabase/server';
import { CompleteForm, FormBlock, DynamicBlockConfig, BlockOption, WorkflowEdge } from '@/types/supabase-types';


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

  // We no longer need to fetch dynamic block configs from a separate table
  // Instead, we'll extract the information from the settings field in each block
  
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

    // Add dynamic config if this is a dynamic block - derived from block settings
    if (block.type === 'dynamic') {
      // Extract configuration from settings
      const settings = block.settings || {};
      blockWithDetails.dynamic_config = {
        block_id: block.id,
        starter_question: block.title || '',
        temperature: settings.temperature || 0.7,
        max_questions: settings.maxQuestions || 5,
        ai_instructions: settings.contextInstructions || '',
        created_at: block.created_at,
        updated_at: block.updated_at
      };
    }

    // Add options if this block has options
    const opts = blockOptions.filter(opt => opt.block_id === block.id);
    if (opts.length > 0) {
      blockWithDetails.options = opts;
    }

    return blockWithDetails;
  });

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

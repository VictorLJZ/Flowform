import { createClient } from '@/lib/supabase/server';
import { FormWithBlocks, WorkflowEdge } from '@/types/supabase-types';
import { DbBlock, DbDynamicBlockConfig, DbBlockOption } from '@/types/block/DbBlock';

/**
 * Get the latest published version of a form with all its blocks from form_block_versions
 * 
 * @param formId - The ID of the form to retrieve
 * @returns The complete versioned form with blocks or null if not found
 */
export async function getVersionedFormWithBlocks(formId: string): Promise<FormWithBlocks | null> {
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

  // Get the latest form version
  const { data: formVersion, error: versionError } = await supabase
    .from('form_versions')
    .select('*')
    .eq('form_id', formId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single();

  if (versionError) {
    if (versionError.code === 'PGRST116') {
      console.log(`No published version found for form ${formId}`);
      return null;
    }
    console.error('Error fetching form version:', versionError);
    throw versionError;
  }

  // Get versioned blocks for this form
  const { data: versionedBlocks, error: blocksError } = await supabase
    .from('form_block_versions')
    .select('*')
    .eq('form_version_id', formVersion.id)
    .order('order_index');

  if (blocksError) {
    console.error('Error fetching form block versions:', blocksError);
    throw blocksError;
  }

  // Filter out deleted blocks
  const activeBlocks = versionedBlocks.filter(block => !block.is_deleted);

  // Map from versioned blocks structure to the expected DbBlock structure
  const blocks: DbBlock[] = activeBlocks.map(vBlock => ({
    id: vBlock.block_id,
    form_id: formId,
    type: vBlock.type,
    subtype: vBlock.subtype,
    title: vBlock.title,
    description: vBlock.description,
    required: vBlock.required,
    order_index: vBlock.orderIndex,
    settings: vBlock.settings,
    created_at: vBlock.created_at,
    updated_at: vBlock.created_at // Use created_at as updated_at for versioned blocks
  }));

  // Fetch dynamic blocks configurations
  const dynamicBlocks = blocks.filter(block => block.type === 'dynamic');
  
  let dynamicConfigs: DbDynamicBlockConfig[] = [];
  if (dynamicBlocks.length > 0) {
    // Instead of querying a separate table, extract config from block settings
    dynamicConfigs = dynamicBlocks.map(block => {
      const settings = block.settings || {};
      return {
        block_id: block.id,
        starter_question: block.title || '',
        temperature: typeof settings.temperature === 'number' ? settings.temperature : 0.7,
        max_questions: typeof settings.maxQuestions === 'number' ? settings.maxQuestions : 5,
        ai_instructions: (settings.contextInstructions as string) || null,
        created_at: block.created_at,
        updated_at: block.updated_at
      };
    });
  }
  
  // Fetch block options for blocks with options
  const optionsBlocks = blocks.filter(block => 
    block.type === 'static' && 
    ['multiple_choice', 'scale', 'yes_no'].includes(block.subtype as string)
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

  // Using the WorkflowEdge type we imported
  
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

  // Return the complete form with the version ID if available
  return {
    ...form,
    blocks: blocksWithDetails,
    workflow_edges: workflowEdges,
    version_id: formVersion.id
  };
}

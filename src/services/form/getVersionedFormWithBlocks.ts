import { createClient } from '@/lib/supabase/server';
import { CompleteForm, FormBlock, DynamicBlockConfig, BlockOption } from '@/types/supabase-types';

/**
 * Get the latest published version of a form with all its blocks from form_block_versions
 * 
 * @param formId - The ID of the form to retrieve
 * @returns The complete versioned form with blocks or null if not found
 */
export async function getVersionedFormWithBlocks(formId: string): Promise<CompleteForm | null> {
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

  // Map from versioned blocks structure to the expected FormBlock structure
  const blocks: FormBlock[] = activeBlocks.map(vBlock => ({
    id: vBlock.block_id,
    form_id: formId,
    type: vBlock.type,
    subtype: vBlock.subtype,
    title: vBlock.title,
    description: vBlock.description,
    required: vBlock.required,
    order_index: vBlock.order_index,
    settings: vBlock.settings,
    created_at: vBlock.created_at,
    updated_at: vBlock.created_at // Use created_at as updated_at for versioned blocks
  }));

  // Fetch dynamic blocks configurations
  const dynamicBlocks = blocks.filter(block => block.type === 'dynamic');
  
  let dynamicConfigs: DynamicBlockConfig[] = [];
  if (dynamicBlocks.length > 0) {
    // Instead of querying a separate table, extract config from block settings
    dynamicConfigs = dynamicBlocks.map(block => {
      const settings = block.settings || {};
      return {
        block_id: block.id,
        starter_question: block.title || '',
        temperature: settings.temperature || 0.7,
        max_questions: settings.maxQuestions || 5,
        ai_instructions: settings.contextInstructions || '',
        created_at: block.created_at,
        updated_at: block.updated_at
      } as DynamicBlockConfig;
    });
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
    default_target_id?: string | null;
    rules?: string;
    is_explicit: boolean;
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

  // Return the complete form with the version ID if available
  return {
    ...form,
    blocks: blocksWithDetails,
    workflow_edges: workflowEdges,
    version_id: formVersion.id
  };
}

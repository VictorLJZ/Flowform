import { getVersionedFormWithBlocksClient } from '../form/getVersionedFormWithBlocksClient';
import { transformVersionedFormData } from '../form/transformVersionedFormData';
import { validateConnections } from '../connection/validateConnections';
import { preserveRules } from '../connection/preserveRules';
import { UiBlock } from '@/types/block';
import { Connection } from '@/types/workflow-types';
import { defaultFormTheme } from '@/types/theme-types';
import { defaultFormData } from '@/stores/slices/formCore';
import { v4 as uuidv4 } from 'uuid';
import type { CompleteForm as ApiCompleteForm } from '@/types/form/ApiFormResponse';
import type { CompleteForm } from '@/types/form-types';
import { CustomFormData } from '@/types/form-builder-types';

/**
 * Format form data with defaults
 * Keeping UI formatting consistent between regular and versioned forms
 */
function formatFormData(formData: ApiCompleteForm): CustomFormData {
  return {
    form_id: formData.form_id,
    title: formData.title || 'Untitled Form',
    description: formData.description || undefined,
    workspace_id: formData.workspace_id,
    created_by: formData.created_by,
    status: formData.status || 'published',
    theme: formData.theme ? { 
      ...defaultFormTheme, 
      ...(typeof formData.theme === 'object' ? formData.theme : {}) 
    } : defaultFormTheme,
    settings: formData.settings ? {
      ...defaultFormData.settings,
      ...(typeof formData.settings === 'object' ? formData.settings : {})
    } : { ...defaultFormData.settings }
  };
}

/**
 * Create default linear connections between blocks if none exist
 */
function createDefaultConnections(blocks: UiBlock[]): Connection[] {
  const connections: Connection[] = [];
  // Sort blocks by order to ensure proper sequence
  const sortedBlocks = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);
  
  // Create a linear workflow with properly typed connections
  for (let i = 0; i < sortedBlocks.length - 1; i++) {
    const block = sortedBlocks[i];
    const nextBlock = sortedBlocks[i + 1];
    
    connections.push({
      id: uuidv4(),
      sourceId: block.id,
      defaultTargetId: nextBlock.id,
      rules: [],
      order_index: i,
      is_explicit: false
    });
  }
  
  return connections;
}

/**
 * Convert ApiCompleteForm to CompleteForm
 */
function toCompleteForm(apiForm: ApiCompleteForm): CompleteForm {
  
  // Transform workflow edges to match the CompleteForm interface
  const workflowEdges = (apiForm.workflow_edges || []).map(edge => {
    // Create edge with all required properties for CompleteForm.workflow_edges
    const workflowEdge = {
      // Required properties for CompleteForm.workflow_edges
      id: edge.id,
      source_id: edge.source_block_id || '',
      target_id: edge.default_target_id || '',
      
      // Optional properties for CompleteForm.workflow_edges
      source_block_id: edge.source_block_id,
      target_block_id: edge.default_target_id || undefined,
      source_handle: undefined as string | undefined,
      target_handle: undefined as string | undefined,
      default_target_id: edge.default_target_id || undefined,
      is_explicit: edge.is_explicit || false,
      order_index: edge.order_index || 0,
      rules: edge.rules || '[]'
    };
    
    return workflowEdge;
  });

  // Create the complete form object with all required properties
  return {
    form_id: apiForm.form_id,
    title: apiForm.title || '',
    description: apiForm.description || null,
    workspace_id: apiForm.workspace_id,
    created_by: apiForm.created_by,
    status: apiForm.status || 'draft',
    published_at: apiForm.published_at || null,
    settings: apiForm.settings || {},
    theme: apiForm.theme || {},
    blocks: apiForm.blocks || [],
    workflow_edges: workflowEdges
  };
}

/**
 * Load a complete versioned form with all its components
 * @param formId The ID of the form to load
 * @returns An object containing formData, blocks, connections, and nodePositions
 */
export async function loadVersionedFormComplete(formId: string): Promise<{
  formData: CustomFormData;
  blocks: UiBlock[];
  connections: Connection[];
  nodePositions: Record<string, {x: number, y: number}>;
}> {
  // Fetch versioned form with blocks
  const result = await getVersionedFormWithBlocksClient(formId);
  
  if (!result) {
    throw new Error(`Published version of form with ID ${formId} not found`);
  }

  // Ensure settings is always an object
  const formWithSettings = {
    ...result,
    settings: result.settings || {}
  };

  // Convert to CompleteForm type
  const completeForm = toCompleteForm(formWithSettings as unknown as ApiCompleteForm);

  // Use the helper function to transform the form data with proper typing
  const { blocks, connections: initialConnections } = transformVersionedFormData(completeForm);
  
  // Extract node positions from form settings if available
  const nodePositions = completeForm.settings && 
    typeof completeForm.settings === 'object' &&
    'nodePositions' in completeForm.settings &&
    typeof completeForm.settings.nodePositions === 'object'
      ? completeForm.settings.nodePositions as Record<string, {x: number, y: number}>
      : {};
  
  // Initialize connections variable that will be modified
  let connections = initialConnections;
  
  // Apply connection validation to ensure all blocks exist
  connections = validateConnections(connections, blocks);
  
  // Apply rule preservation to ensure rules are maintained
  // @ts-expect-error - preserveRules has incorrect type definition
  connections = preserveRules(connections, blocks);
  
  // Create default linear connections if needed
  if (connections.length === 0 && blocks.length > 1) {
    connections = createDefaultConnections(blocks);
    // Re-validate to ensure all connections are valid
    connections = validateConnections(connections, blocks);
  }
  
  // Create an object with the minimum properties needed by formatFormData
  // Skip complex type checking by using a focused approach
  const formInput = {
    form_id: completeForm.form_id,
    title: completeForm.title || '',
    description: completeForm.description || null,
    workspace_id: completeForm.workspace_id,
    created_by: completeForm.created_by,
    status: completeForm.status || 'published',
    theme: completeForm.theme || {},
    settings: completeForm.settings || {}
  };
  
  // Use type assertion to pass to formatFormData
  // This is safe because formatFormData only uses these specific properties
  const formattedData = formatFormData(formInput as unknown as ApiCompleteForm);
  
  return {
    formData: formattedData,
    blocks,
    connections,
    nodePositions
  };
}

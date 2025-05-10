import { getVersionedFormWithBlocksClient } from '../form/getVersionedFormWithBlocksClient';
import { transformVersionedFormData } from '../form/transformVersionedFormData';
import { validateConnections } from '../connection/validateConnections';
import { preserveRules } from '../connection/preserveRules';
import { FormBlock } from '@/types/block-types';
import { Connection } from '@/types/workflow-types';
import { defaultFormTheme } from '@/types/theme-types';
import { defaultFormData } from '@/stores/slices/formCore';
import { v4 as uuidv4 } from 'uuid';
import { CompleteForm } from '@/types/supabase-types';
import { CustomFormData } from '@/types/form-builder-types';

/**
 * Format form data with defaults
 * Keeping UI formatting consistent between regular and versioned forms
 */
function formatFormData(formData: CompleteForm): CustomFormData {
  return {
    form_id: formData.form_id,
    title: formData.title || 'Untitled Form',
    description: formData.description || undefined, // Use undefined instead of empty string to match FormData type
    workspace_id: formData.workspace_id,
    created_by: formData.created_by,
    status: formData.status || 'published',
    // Always use defaultFormTheme as the base and merge with any available theme properties
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
function createDefaultConnections(blocks: FormBlock[]): Connection[] {
  const connections: Connection[] = [];
  // Sort blocks by order to ensure proper sequence
  const sortedBlocks = [...blocks].sort((a, b) => a.order_index - b.order_index);
  
  // Create a linear workflow with properly typed connections
  for (let i = 0; i < sortedBlocks.length - 1; i++) {
    const block = sortedBlocks[i];
    const nextBlock = sortedBlocks[i + 1];
    
    connections.push({
      id: uuidv4(),
      sourceId: block.id,
      defaultTargetId: nextBlock.id,
      rules: [], // Add empty rules array to satisfy the Connection type
      order_index: i,
      is_explicit: false // Mark as auto-generated
    });
  }
  
  return connections;
}

/**
 * Load a complete versioned form with all its components
 * @param formId The ID of the form to load
 * @returns An object containing formData, blocks, connections, and nodePositions
 */
export async function loadVersionedFormComplete(formId: string): Promise<{
  formData: CustomFormData;
  blocks: FormBlock[];
  connections: Connection[];
  nodePositions: Record<string, {x: number, y: number}>;
}> {
  // Fetch versioned form with blocks
  const result = await getVersionedFormWithBlocksClient(formId);
  
  if (!result) {
    throw new Error(`Published version of form with ID ${formId} not found`);
  }

  // Use the helper function to transform the form data with proper typing
  const { blocks, connections: initialConnections, nodePositions } = transformVersionedFormData(result);
  
  // Initialize connections variable that will be modified
  let connections = initialConnections;
  
  // Apply connection validation to ensure all blocks exist
  connections = validateConnections(connections, blocks);
  
  // Apply rule preservation to ensure rules are maintained
  connections = preserveRules(connections);
  
  // Create default linear connections if needed
  if (connections.length === 0 && blocks.length > 1) {
    connections = createDefaultConnections(blocks);
    // Re-validate to ensure all connections are valid
    connections = validateConnections(connections, blocks);
  }
  
  // Format the form data with defaults
  const formattedData = formatFormData(result);
  
  return {
    formData: formattedData,
    blocks,
    connections,
    nodePositions
  };
}

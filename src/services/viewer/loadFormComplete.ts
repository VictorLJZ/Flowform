import { getFormWithBlocksClient } from '../form/getFormWithBlocksClient';
import { createClient } from '@/lib/supabase/client';
import { transformConnections } from '../connection/transformConnections';
import { validateConnections } from '../connection/validateConnections';
import { preserveRules } from '../connection/preserveRules';
import { FormBlock, BlockType } from '@/types/block-types';
import { Connection } from '@/types/workflow-types';
import { migrateAllBlockLayouts } from '../form/layoutMigration';
import { mapFromDbBlockType } from '@/utils/blockTypeMapping';
import { defaultFormTheme } from '@/types/theme-types';
import { defaultFormData } from '@/stores/slices/formCore';

// Define types for database records
interface DbFormBlock {
  id: string;
  form_id: string;
  type: string;
  subtype: string;
  title: string;
  description: string | null;
  required: boolean;
  order_index: number;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

interface DbForm {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  workspace_id: string;
  settings: Record<string, unknown> | null;
  blocks?: DbFormBlock[];
  workflow_edges?: Record<string, unknown>[];
  version_id?: string;
  version_number?: number;
  [key: string]: unknown;
}

/**
 * Convert backend blocks to frontend block format
 * Extracted from formPersistence.ts
 */
function convertBackendBlocks(backendBlocks: DbFormBlock[]): FormBlock[] {
  return backendBlocks.map((block) => {
    // Map database type/subtype to frontend blockTypeId
    // This is critical - blockTypeId must match exactly what the registry expects
    let blockTypeId = block.subtype;
    
    // Special case for dynamic blocks
    if (block.type === 'dynamic' && block.subtype === 'dynamic') {
      blockTypeId = 'ai_conversation';
    }
    
    // Special case for layout blocks
    else if (block.type === 'layout') {
      if (block.subtype === 'short_text') {
        // Try to determine if this is a page_break or redirect based on settings
        if (block.settings && typeof block.settings === 'object') {
          if ('url' in block.settings) {
            blockTypeId = 'redirect';
          } else {
            blockTypeId = 'page_break';
          }
        } else {
          blockTypeId = 'page_break'; // Default for layout blocks
        }
      }
    }
    
    // For other cases where block.subtype might be different from what registry expects
    // Use our mapFromDbBlockType utility as a backup
    if (!blockTypeId || blockTypeId === '') {
      blockTypeId = mapFromDbBlockType(block.type as BlockType, block.subtype);
    }
    
    // Determine block type (static, dynamic, etc)
    // This is the database "type" value, not to be confused with blockTypeId
    let blockType = block.type as BlockType;
    
    // Ensure blockType is valid (defensive programming)
    if (!['static', 'dynamic', 'layout', 'integration'].includes(blockType)) {
      blockType = 'static';
    }
    
    // Create the transformed block with correct typing
    const transformedBlock: FormBlock = {
      id: block.id,
      blockTypeId: String(blockTypeId), // Ensure blockTypeId is the mapped value from subtype and is a string
      type: blockType,
      title: block.title || '',
      description: block.description || '',
      required: block.required || false,
      order_index: block.order_index,
      settings: block.settings || {}
    };
    
    // Extra validation to ensure we NEVER set blockTypeId to the block's type
    if (transformedBlock.blockTypeId === transformedBlock.type && ['static', 'dynamic', 'layout', 'integration'].includes(transformedBlock.blockTypeId)) {
      // Emergency fallback: If for some reason blockTypeId ended up as 'static', use the subtype as a fallback
      if (block.subtype && block.subtype !== transformedBlock.type) {
        transformedBlock.blockTypeId = String(block.subtype);
      }
    }
    
    return transformedBlock;
  });
}

/**
 * Extract node positions from form settings
 * Extracted from formPersistence.ts
 */
function extractNodePositions(formData: DbForm): Record<string, {x: number, y: number}> {
  try {
    if (formData.settings?.workflow && typeof formData.settings.workflow === 'object') {
      const workflow = formData.settings.workflow as { nodePositions?: Record<string, {x: number, y: number}> };
      if (workflow.nodePositions && typeof workflow.nodePositions === 'object') {
        return workflow.nodePositions;
      }
    }
  } catch (error) {
    console.error('Error extracting node positions:', error);
  }
  return {};
}

/**
 * Format form data with defaults
 * Extracted from formPersistence.ts
 */
function formatFormData(formData: DbForm, isVersioned: boolean = false): DbForm {
  return {
    id: formData.id,
    form_id: formData.id, // Use id as form_id for compatibility
    title: formData.title || 'Untitled Form',
    description: formData.description || '',
    workspace_id: formData.workspace_id,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    created_by: formData.created_by || '',
    status: formData.status || (isVersioned ? 'published' : 'draft'),
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
 * Loads a complete form with blocks and connections for the viewer
 * 
 * This combines all functionality from getFormWithBlocksClient
 * and the form loading logic from formPersistence.ts into a clean service
 * 
 * @param formId The ID of the form to load
 * @returns An object containing formData, blocks, connections, and nodePositions
 */
export async function loadFormComplete(formId: string): Promise<{
  formData: DbForm;
  blocks: FormBlock[];
  connections: Connection[];
  nodePositions: Record<string, {x: number, y: number}>;
}> {
  // Get form with blocks from API
  const result = await getFormWithBlocksClient(formId);
  
  if (!result) {
    throw new Error(`Form with ID ${formId} not found`);
  }
  
  // Extract core data and ensure proper type conversion
  // Convert CompleteForm to DbForm by explicitly mapping properties
  const formData: DbForm = {
    id: result.form_id,
    title: result.title,
    description: result.description,
    created_at: result.created_at,
    updated_at: result.updated_at,
    workspace_id: result.workspace_id,
    settings: result.settings,
    blocks: result.blocks as DbFormBlock[],
    workflow_edges: result.workflow_edges as unknown as Record<string, unknown>[],
    version_id: result.version_id,
    version_number: result.version_number
  };
  
  const backendBlocks = result.blocks as DbFormBlock[];
  
  // Convert blocks to frontend format
  const blocks: FormBlock[] = convertBackendBlocks(backendBlocks);
  
  // Extract node positions from form settings
  const nodePositions: Record<string, {x: number, y: number}> = extractNodePositions(formData);
  
  // Load connections from workflow_edges table
  let workflowConnections: Connection[] = [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('workflow_edges')
      .select('*')
      .eq('form_id', formId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error loading workflow connections:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      const sbData = data || []; // Use empty array if data is null

      workflowConnections = transformConnections(sbData);
      
      // Validate connections to remove those with invalid block references
      workflowConnections = validateConnections(workflowConnections, blocks);
      
      // Ensure rules are preserved across connections with same source->target
      workflowConnections = preserveRules(workflowConnections);
    }
  } catch (error) {
    console.error('Error loading workflow connections:', error);
    workflowConnections = [];
  }
  
  // Migrate block layouts from legacy format
  const migratedBlocks = migrateAllBlockLayouts(blocks);
  
  // Format the form data with defaults
  const formattedData = formatFormData(formData);
  
  return {
    formData: formattedData,
    blocks: migratedBlocks,
    connections: workflowConnections,
    nodePositions
  };
}

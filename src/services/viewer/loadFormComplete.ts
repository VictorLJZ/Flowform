import { getFormWithBlocksClient } from '../form/getFormWithBlocksClient';
import { createClient } from '@/lib/supabase/client';
import { transformConnections } from '../connection/transformConnections';
import { validateConnections } from '../connection/validateConnections';
import { preserveRules } from '../connection/preserveRules';
import { FormBlock } from '@/types/block-types';
import { Connection } from '@/types/workflow-types';
import { migrateAllBlockLayouts } from '../form/layoutMigration';
import { mapFromDbBlockType } from '@/utils/blockTypeMapping';
import { defaultFormTheme } from '@/types/theme-types';
import { defaultFormData } from '@/stores/slices/formCore';
import { BlockType } from '@/types/block-types';

/**
 * Convert backend blocks to frontend block format
 * Extracted from formPersistence.ts
 */
function convertBackendBlocks(backendBlocks: any[]): FormBlock[] {
  return backendBlocks.map((block) => {
    // Map database type/subtype to frontend blockTypeId
    const blockTypeId = mapFromDbBlockType(block.type, block.subtype);
    
    // Determine block type (static, dynamic, etc)
    const blockType = (block.type === 'dynamic' || blockTypeId === 'ai_conversation') 
      ? 'dynamic' 
      : (block.type as BlockType) || 'static';
    
    // Create properly typed FormBlock object
    return {
      id: block.id,
      blockTypeId,
      type: blockType,
      title: block.title,
      description: block.description || '',
      required: block.required,
      order_index: block.order_index,
      settings: block.settings || {}
    };
  });
}

/**
 * Extract node positions from form settings
 * Extracted from formPersistence.ts
 */
function extractNodePositions(formData: any): Record<string, {x: number, y: number}> {
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
function formatFormData(formData: any, isVersioned: boolean = false) {
  return {
    form_id: formData.form_id,
    title: formData.title || 'Untitled Form',
    description: formData.description || '',
    workspace_id: formData.workspace_id,
    created_by: formData.created_by,
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
  formData: any;
  blocks: FormBlock[];
  connections: Connection[];
  nodePositions: Record<string, {x: number, y: number}>;
}> {
  // Get form with blocks from API
  const result = await getFormWithBlocksClient(formId);
  
  if (!result) {
    throw new Error(`Form with ID ${formId} not found`);
  }
  
  // Extract core data
  const formData = result;
  const backendBlocks = result.blocks;
  
  // Convert blocks to frontend format
  const blocks = convertBackendBlocks(backendBlocks);
  
  // Extract node positions from form settings
  const nodePositions = extractNodePositions(formData);
  
  // Load connections from workflow_edges table
  let workflowConnections: Connection[] = [];
  try {
    const supabase = createClient();
    const { data: edges, error } = await supabase
      .from('workflow_edges')
      .select('*')
      .eq('form_id', formId)
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error(`❌ WORKFLOW LOAD ERROR: Failed to fetch workflow edges:`, error);
      throw error;
    }
    
    if (edges && edges.length > 0) {
      // Transform connections from DB format to app format
      workflowConnections = transformConnections(edges, blocks);
      
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

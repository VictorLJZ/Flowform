import { transformConnections } from '../connection/transformConnections';
import { validateConnections } from '../connection/validateConnections';
import { preserveRules } from '../connection/preserveRules';
import { Connection } from '@/types/workflow-types';
import { migrateAllBlockLayouts } from '../form/layoutMigration';
import { mapFromDbBlockType } from '@/utils/blockTypeMapping';
import type { UiBlock, ApiBlockSubtype } from '@/types/block';
import { defaultFormTheme } from '@/types/theme-types';
import { defaultFormData } from '@/stores/slices/formCore';
import { getFormWithBlocksClient } from '../form/getFormWithBlocksClient';
import type { 
  DbBlock, 
  DbBlockSubtype
} from '@/types/block/DbBlock';
import type { CompleteForm } from '@/types/form-types';
import type { WorkflowEdge } from '@/types/supabase-types';

// Local type for the transformed block with blockTypeId
interface TransformedBlock extends Omit<UiBlock, 'blockTypeId'> {
  blockTypeId: string;
}

function isDbBlockSubtype(value: unknown): value is DbBlockSubtype {
  if (typeof value !== 'string') return false;
  const validSubtypes: string[] = [
    // Static blocks
    'short_text', 'long_text', 'email', 'date', 'multiple_choice',
    'checkbox_group', 'dropdown', 'number', 'scale', 'yes_no',
    // Dynamic blocks
    'ai_conversation',
    // Integration blocks
    'hubspot',
    // Layout blocks
    'page_break', 'redirect'
  ];
  return validSubtypes.includes(value);
}

/**
 * Convert backend blocks to frontend block format
 */
const convertBackendBlocks = (blocks: DbBlock[]): UiBlock[] => {
  return blocks.map(block => {
    // Ensure block.subtype is a valid DbBlockSubtype or default to 'short_text'
    const validSubtype: DbBlockSubtype = 
      block.subtype && isDbBlockSubtype(block.subtype)
        ? block.subtype
        : 'short_text';
        
    // Map database type/subtype to frontend blockTypeId
    let blockTypeId = validSubtype;
    
    // Special case for dynamic blocks
    if (block.type === 'dynamic' && validSubtype === 'ai_conversation') {
      blockTypeId = 'ai_conversation';
    }
    
    // Special case for layout blocks
    else if (block.type === 'layout') {
      if (block.subtype === 'page_break' || block.subtype === 'redirect') {
        blockTypeId = block.subtype;
      } else if (block.settings && typeof block.settings === 'object') {
        // Try to determine if this is a page_break or redirect based on settings
        if ('url' in block.settings) {
          blockTypeId = 'redirect';
        } else {
          blockTypeId = 'page_break';
        }
      } else {
        blockTypeId = 'page_break'; // Default for layout blocks
      }
    }
    
    // For other cases where block.subtype might be different from what registry expects
    if (!blockTypeId) {
      const mappedType = mapFromDbBlockType(block.type, block.subtype || 'short_text');
      blockTypeId = isDbBlockSubtype(mappedType) ? mappedType : 'short_text';
    }
    
    // Determine block type (static, dynamic, etc)
    let blockType = block.type;
    
    // Ensure blockType is valid
    if (!['static', 'dynamic', 'layout', 'integration'].includes(blockType)) {
      blockType = 'static';
    }
    
    // Create the transformed block with correct typing
    const transformedBlock: TransformedBlock = {
      id: block.id,
      formId: block.form_id,
      blockTypeId: blockTypeId,
      type: blockType as DbBlock['type'],
      title: block.title || '',
      description: block.description || '',
      required: Boolean(block.required),
      orderIndex: block.order_index || 0,
      settings: block.settings || {},
      subtype: (isDbBlockSubtype(block.subtype) ? block.subtype : 'short_text') as ApiBlockSubtype,
      createdAt: block.created_at || new Date().toISOString(),
      updatedAt: block.updated_at || new Date().toISOString()
    };
    
    return transformedBlock;
  });
}

/**
 * Extract node positions from form settings
 */
function extractNodePositions(formData: CompleteForm): Record<string, {x: number, y: number}> {
  try {
    // Try to get node positions from form settings
    const nodePositions = formData.settings?.nodePositions;
    
    // If we have valid node positions, return them
    if (nodePositions && typeof nodePositions === 'object' && !Array.isArray(nodePositions)) {
      return nodePositions as Record<string, {x: number, y: number}>;
    }
  } catch (error) {
    console.error('Error extracting node positions:', error);
  }
  
  // Return empty object if no valid positions found
  return {};
}

/**
 * Format form data with defaults
 */
function formatFormData(formData: CompleteForm): CompleteForm {
  return {
    ...formData,
    title: formData.title || 'Untitled Form',
    description: formData.description || null,
    settings: {
      ...defaultFormData.settings,
      ...(formData.settings || {})
    } as Record<string, unknown>,
    theme: defaultFormTheme as unknown as Record<string, unknown>,
    blocks: formData.blocks || [],
    workflow_edges: formData.workflow_edges || []
  };
}

/**
 * Loads a complete form with blocks and connections for the viewer
 */
export async function loadFormComplete(formId: string): Promise<{
  formData: CompleteForm;
  blocks: UiBlock[];
  connections: Connection[];
  nodePositions: Record<string, {x: number, y: number}>;
}> {
  try {
    // 1. Fetch the form with its blocks and workflow edges
    const formWithBlocks = await getFormWithBlocksClient(formId);
    
    if (!formWithBlocks) {
      throw new Error('Form not found');
    }
    
    // 2. Format the form data with defaults
    const formData = formatFormData(formWithBlocks);
    
    // 3. Convert backend blocks to frontend format
    const blocks = formWithBlocks.blocks ? convertBackendBlocks(formWithBlocks.blocks) : [];
    
    // 4. Process connections - ensure we pass an array of WorkflowEdge to transformConnections
    const workflowEdges: WorkflowEdge[] = [];
    if (Array.isArray(formWithBlocks.workflow_edges)) {
      workflowEdges.push(...formWithBlocks.workflow_edges.map((edge: unknown) => {
        const typedEdge = edge as Partial<WorkflowEdge>;
        return {
          id: typedEdge.id || '',
          form_id: typedEdge.form_id || '', // Default to empty string as fallback
          source_block_id: typedEdge.source_block_id || '',
          default_target_id: typedEdge.default_target_id || null,
          condition_type: typedEdge.condition_type || 'always',
          rules: typeof typedEdge.rules === 'string' ? typedEdge.rules : '[]',
          order_index: typedEdge.order_index || 0,
          is_explicit: typedEdge.is_explicit || false,
          created_at: typedEdge.created_at || new Date().toISOString(),
          updated_at: typedEdge.updated_at || new Date().toISOString()
        } as WorkflowEdge;
      }));
    }
    const connections = transformConnections(workflowEdges);
    
    // 5. Extract node positions
    const nodePositions = extractNodePositions(formWithBlocks);
    
    // 6. Migrate block layouts if needed
    if (blocks.length > 0) {
      migrateAllBlockLayouts(blocks);
    }
    
    // 7. Validate connections after all transformations
    if (connections.length > 0) {
      validateConnections(connections, blocks);
      // @ts-expect-error - preserveRules has incorrect type definition
      preserveRules(connections, blocks);
    }
    
    return {
      formData,
      blocks,
      connections,
      nodePositions
    };
  } catch (error) {
    console.error('Error loading form:', error);
    throw error;
  }
}

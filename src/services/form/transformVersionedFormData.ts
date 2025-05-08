import { CompleteForm } from '@/types/supabase-types';
import { FormBlock, BlockType } from '@/types/block-types';
import { Connection, Rule, ConditionRule } from '@/types/workflow-types';
import { v4 as uuidv4 } from 'uuid';
import { mapFromDbBlockType } from '@/utils/blockTypeMapping';

/**
 * Transforms versioned form data from the database format to the application format
 * with proper typing to avoid TypeScript errors
 */
export function transformVersionedFormData(formData: CompleteForm): {
  blocks: FormBlock[];
  connections: Connection[];
  nodePositions: Record<string, { x: number; y: number }>;
} {
  // 1. Transform blocks
  const blocks: FormBlock[] = formData.blocks.map((block) => {
    // Map database type/subtype to frontend blockTypeId
    const blockTypeId = mapFromDbBlockType(block.type, block.subtype);
    
    // Determine the block type (static, dynamic, etc.)
    const blockType: BlockType = (block.type === 'dynamic' || blockTypeId === 'ai_conversation') 
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
      created_at: block.created_at || new Date().toISOString(),
      updated_at: block.updated_at || block.created_at || new Date().toISOString(),
      settings: block.settings || {}
    };
  });

  // 2. Transform workflow connections
  const connections: Connection[] = formData.workflow_edges ? 
    formData.workflow_edges.map((edge) => {
      let parsedRules: Rule[] = [];
      if (edge.rules) { 
        try {
          const rulesFromEdge = JSON.parse(edge.rules);
          if (Array.isArray(rulesFromEdge)) {
            parsedRules = rulesFromEdge.filter(
              (r: any) => r.id && r.target_block_id && r.condition_group
            ) as Rule[]; 
          } else {
            console.warn(`Parsed edge.rules for edge ${edge.id} is not an array:`, rulesFromEdge);
          }
        } catch (e) {
          console.warn(`Failed to parse edge.rules JSON for edge ${edge.id}:`, e, "Raw edge.rules:", edge.rules);
        }
      }

      return {
        id: edge.id,
        sourceId: edge.source_block_id,
        defaultTargetId: edge.default_target_id, 
        rules: parsedRules, 
        order_index: edge.order_index || 0,
      };
    })
    : [];

  // 3. Extract node positions from form settings
  let nodePositions: Record<string, { x: number; y: number }> = {};
  try {
    if (formData.settings?.workflow && typeof formData.settings.workflow === 'object') {
      const workflow = formData.settings.workflow as { nodePositions?: Record<string, { x: number; y: number }> };
      if (workflow.nodePositions && typeof workflow.nodePositions === 'object') {
        nodePositions = workflow.nodePositions;
      }
    }
  } catch (error) {
    console.error('Error extracting node positions:', error);
    nodePositions = {};
  }

  return {
    blocks,
    connections,
    nodePositions
  };
}

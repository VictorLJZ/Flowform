import { CompleteForm } from '@/types/form-types';
import { UiBlock } from '@/types/block';
import { ApiBlockType } from '@/types/block/ApiBlock';
import { Connection, Rule } from '@/types/workflow-types';

/**
 * Transforms versioned form data from the database format to the application format
 * with proper typing to avoid TypeScript errors
 */
export function transformVersionedFormData(formData: CompleteForm): {
  blocks: UiBlock[];
  connections: Connection[];
  nodePositions: Record<string, { x: number; y: number }>;
} {
  // 1. Transform blocks
  const blocks: UiBlock[] = formData.blocks.map(block => {
    // Map database block to UiBlock
    const blockType = block.type as ApiBlockType;
    const blockTypeId = block.type; // Assuming type is the block type ID
    
    return {
      id: block.id,
      formId: formData.form_id,
      blockTypeId,
      type: blockType,
      title: block.title || '',
      description: block.description || '',
      required: block.required || false,
      orderIndex: block.order_index || 0,
      createdAt: block.created_at || new Date().toISOString(),
      updatedAt: block.updated_at || new Date().toISOString(),
      settings: block.settings || {},
      // Determine a valid subtype based on block type
      subtype: (block as { block_subtype?: string }).block_subtype || 
        // Use different defaults based on the block type
        (blockType === 'dynamic' ? 'ai_conversation' :
         blockType === 'layout' ? 'page_break' :
         blockType === 'integration' ? 'hubspot' :
         'short_text') // Default to short_text for static blocks
    } as UiBlock;
  });

  // 2. Transform workflow connections
  const connections: Connection[] = (formData.workflow_edges || [])
    .filter(edge => {
      const isValid = edge && edge.id && edge.source_block_id;
      if (!isValid) {
        console.warn('Skipping invalid edge:', edge);
      }
      return isValid;
    })
    .map(edge => {
      let parsedRules: Rule[] = [];
      if (edge.rules) { 
        try {
          const rulesFromEdge = typeof edge.rules === 'string' 
            ? JSON.parse(edge.rules) 
            : edge.rules;
          
          if (Array.isArray(rulesFromEdge)) {
            parsedRules = rulesFromEdge.filter(
              (r: Partial<Rule> & { target_block_id?: string; condition_group?: unknown }) => 
                r.id && r.target_block_id && r.condition_group
            ) as Rule[]; 
          } else {
            console.warn(`Parsed edge.rules for edge ${edge.id} is not an array:`, rulesFromEdge);
          }
        } catch (e) {
          console.warn(`Failed to parse edge.rules JSON for edge ${edge.id}:`, e, "Raw edge.rules:", edge.rules);
        }
      }

      return {
        id: edge.id!,
        sourceId: edge.source_block_id!,
        defaultTargetId: edge.default_target_id || null,
        rules: parsedRules,
        order_index: edge.order_index || 0, // Provide default value
        is_explicit: edge.is_explicit || false,
      } as Connection; // Type assertion to ensure we match the Connection type
    });

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

import { UiBlock } from '@/types/block';
import { Connection } from '@/types/workflow-types';

/**
 * Validate connections by ensuring they reference existing blocks
 * This removes connections that reference missing blocks and
 * rules that reference missing target blocks
 */
export function validateConnections(
  connections: Connection[],
  blocks: UiBlock[]
): Connection[] {
  return connections.filter(conn => {
    // Check source and target blocks exist
    const sourceExists = blocks.some(block => block.id === conn.sourceId);
    const defaultTargetExists = blocks.some(block => block.id === conn.defaultTargetId);
    
    if (!sourceExists) {
      console.warn(`⚠️ WORKFLOW LOAD: Source block not found for connection: source=${conn.sourceId}, defaultTarget=${conn.defaultTargetId}`);
      return false;
    }
    
    if (!defaultTargetExists) {
      console.warn(`⚠️ WORKFLOW LOAD: Default target block not found for connection: source=${conn.sourceId}, defaultTarget=${conn.defaultTargetId}`);
      return false;
    }
    
    // Validate rule targets also exist
    if (conn.rules && conn.rules.length > 0) {
      conn.rules = conn.rules.filter(rule => {
        const ruleTargetExists = blocks.some(block => block.id === rule.target_block_id);
        if (!ruleTargetExists) {
          console.warn(`⚠️ WORKFLOW LOAD: Rule target block not found, removing rule: ${rule.id}, target=${rule.target_block_id}`);
        }
        return ruleTargetExists;
      });
    }
    
    return true;
  });
}

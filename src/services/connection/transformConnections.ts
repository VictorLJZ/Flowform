import { Connection, Rule } from '@/types/workflow-types';
import type { WorkflowEdge } from '@/types/supabase-types';

/**
 * Transform connection data from database format to application format
 * Extracts and parses rules from database connections
 */
export function transformConnections(
  edges: WorkflowEdge[]
): Connection[] {
  if (!edges || !Array.isArray(edges) || edges.length === 0) {
    return [];
  }
  
  return edges.map((edge, index) => {
    let rules: Rule[] = [];
    
    // Always attempt to parse rules from edge.rules
    if (edge.rules) {
      try {
        // The 'rules' column from the DB might be:
        // 1. A JSON string that needs parsing
        // 2. Already an array of Rule objects if client handled JSON parsing
        if (typeof edge.rules === 'string') {
          // Explicit handling for JSON string
          const parsedRules = JSON.parse(edge.rules);
          rules = parsedRules;
        } else if (Array.isArray(edge.rules)) {
          // Rules already parsed into an array
          rules = edge.rules;
        } else {
        }
        
        // Log the parsed rules structure
      } catch (error) {
        console.error('Error parsing rules JSON from DB for edge:', edge.id, error);
        rules = []; // Default to empty array on error
      }
    }
    
    const transformedConnection = {
      id: edge.id,
      sourceId: edge.source_block_id,
      defaultTargetId: edge.default_target_id || null, // Ensure it's never undefined
      order_index: edge.order_index ?? index, // Default to index if order_index is null
      is_explicit: !!edge.is_explicit, // Coerce to boolean; null/undefined become false
      rules // Assign the parsed or default empty rules array
    };

    return transformedConnection;
  });
}

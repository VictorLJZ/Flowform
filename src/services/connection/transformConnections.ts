import { Connection, Rule, DbWorkflowEdgeWithOldConditions } from '@/types/workflow-types';

/**
 * Transform connection data from database format to application format
 * Extracts and parses rules from database connections
 */
export function transformConnections(
  edges: DbWorkflowEdgeWithOldConditions[]
): Connection[] {
  if (!edges || !Array.isArray(edges) || edges.length === 0) {
    return [];
  }
  
  return edges.map((edge, index) => {
    let rules: Rule[] = [];
    
    // Enhanced debug logging for rules parsing
    console.log(`🔍🔧 [RULES_DEBUG] Parsing rules for edge ${edge.id}:`, {
      rulesType: typeof edge.rules,
      rulesValue: edge.rules,
      isArray: Array.isArray(edge.rules),
      sourceBlock: edge.source_block_id
    });
    
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
          console.log(`✅ [RULES_DEBUG] Successfully parsed rules string for edge ${edge.id}, found ${rules.length} rules`);
        } else if (Array.isArray(edge.rules)) {
          // Rules already parsed into an array
          rules = edge.rules;
          console.log(`✅ [RULES_DEBUG] Rules already parsed as array for edge ${edge.id}, found ${rules.length} rules`);
        } else {
          console.warn(`⚠️ [RULES_DEBUG] Unexpected rules format for edge ${edge.id}:`, typeof edge.rules);
        }
        
        // Log the parsed rules structure
        if (rules.length > 0) {
          console.log(`🔍 [RULES_DEBUG] First rule for edge ${edge.id}:`, {
            id: rules[0].id,
            target_block_id: rules[0].target_block_id,
            has_condition_group: !!rules[0].condition_group,
            condition_count: rules[0].condition_group?.conditions?.length || 0
          });
        }
      } catch (error) {
        console.error('Error parsing rules JSON from DB for edge:', edge.id, error);
        rules = []; // Default to empty array on error
      }
    }
    
    return {
      id: edge.id,
      sourceId: edge.source_block_id,
      defaultTargetId: edge.default_target_id || null, // Ensure it's never undefined
      order_index: edge.order_index ?? index, // Default to index if order_index is null
      rules // Assign the parsed or default empty rules array
    };
  });
}

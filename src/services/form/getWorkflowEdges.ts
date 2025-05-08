import { createClient } from '@/lib/supabase/client';
import type { Connection, ConditionRule, Rule } from '@/types/workflow-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetch workflow edges from the database for a specific form
 * Maps the database records to frontend Connection objects
 * 
 * @param formId - ID of the form
 * @returns Array of Connection objects
 */
export async function getWorkflowEdges(formId: string): Promise<Connection[]> {
  const supabase = createClient();
  
  if (!formId) {
    console.error('[getWorkflowEdges] Error: formId is undefined or empty');
    return [];
  }
  
  try {
    // Fetch edges from the database
    const { data: edges, error } = await supabase
      .from('workflow_edges')
      .select('*')
      .eq('form_id', formId)
      .order('order_index', { ascending: true });
      
    if (error) {
      console.error('[getWorkflowEdges] Error fetching workflow edges:', error);
      return [];
    }
    
    // If no edges found, return empty array
    if (!edges || edges.length === 0) {
      return [];
    }
    
    // Map database records to frontend Connection objects
    const connections: Connection[] = edges
      .filter(edge => edge.source_block_id && edge.target_block_id) // Ensure essential IDs are present
      .map(edge => {
        let defaultTargetId: string | null = null;
        const rules: Rule[] = [];

        if (edge.condition_field && edge.condition_operator) {
          // This edge represents a conditional path, forming a rule
          rules.push({
            id: uuidv4(), // Rule gets its own ID
            target_block_id: edge.target_block_id,
            condition_group: {
              logical_operator: 'AND', // Assuming AND for single condition, adjust if DB supports OR
              conditions: [
                {
                  id: edge.condition_id || uuidv4(), // Condition gets its own ID
                  field: edge.condition_field,
                  operator: edge.condition_operator as 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than',
                  value: edge.condition_value
                }
              ]
            }
          });
          // For a conditional rule, defaultTargetId is typically null unless a specific fallback is defined elsewhere
          // Assuming no separate fallback mechanism in the current DB structure for this edge row.
          defaultTargetId = null; 
        } else {
          // This edge represents an "always" path or a fallback
          defaultTargetId = edge.target_block_id;
        }
        
        return {
          id: edge.id || uuidv4(),
          sourceId: edge.source_block_id,
          defaultTargetId: defaultTargetId,
          rules: rules,
          order_index: edge.order_index === null || edge.order_index === undefined ? undefined : edge.order_index,
        };
      });
    
    return connections;
  } catch (error) {
    console.error('[getWorkflowEdges] Error:', error);
    return [];
  }
} 
import { createClient } from '@/lib/supabase/client';
import type { Connection, ConditionRule } from '@/types/workflow-types';
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
    const connections = edges
      .filter(edge => edge.source_block_id && edge.target_block_id)
      .map(edge => {
        // Create condition if all required fields are present
        let condition: ConditionRule | undefined = undefined;
        
        if (edge.condition_field && edge.condition_operator) {
          condition = {
            id: edge.condition_id || uuidv4(),
            field: edge.condition_field,
            operator: edge.condition_operator as 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than',
            value: edge.condition_value
          };
        }
        
        return {
          id: edge.id || uuidv4(),
          sourceId: edge.source_block_id,
          targetId: edge.target_block_id,
          order_index: edge.order_index || 0,
          conditionType: condition ? 'conditional' as const : 'always' as const,
          conditions: condition ? [condition] : [],
          ...(condition && { condition })
        };
      });
    
    return connections;
  } catch (error) {
    console.error('[getWorkflowEdges] Error:', error);
    return [];
  }
} 
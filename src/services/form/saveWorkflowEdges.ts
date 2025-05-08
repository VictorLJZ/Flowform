import { createClient } from '@/lib/supabase/client';
import type { Connection } from '@/types/workflow-types';

/**
 * Save workflow edges to the database
 * Maps the connections from the frontend to the database schema
 * Uses upsert instead of delete/insert for better reliability
 * 
 * @param formId - ID of the form
 * @param connections - Array of workflow connections
 * @returns Object containing success status and saved edges
 */
interface WorkflowEdge {
  id: string;
  form_id: string;
  source_id: string;
  target_id: string;
  condition_type?: string;
  conditions?: object[];
  order_index: number;
}

export async function saveWorkflowEdges(
  formId: string,
  connections: Connection[]
): Promise<{ success: boolean, edges: WorkflowEdge[] }> {
  const supabase = createClient();
  
  if (!formId) {
    console.error('[saveWorkflowEdges] Error: formId is undefined or empty');
    return { success: false, edges: [] };
  }
  
  const connectionCount = connections?.length || 0;
  console.log(`[saveWorkflowEdges] Saving ${connectionCount} edges for form: ${formId}`);
  
  if (!Array.isArray(connections)) {
    console.error('[saveWorkflowEdges] Error: connections is not an array');
    return { success: false, edges: [] };
  }
  
  try {
    // Get existing edges to determine which ones to delete
    const { data: existingEdges, error: fetchError } = await supabase
      .from('workflow_edges')
      .select('id')
      .eq('form_id', formId);
      
    if (fetchError) {
      console.error('[saveWorkflowEdges] Error fetching existing edges:', fetchError);
    }
    
    // Map connections to database schema and validate
    const edgesToSave = connections
      .filter(connection => {
        // Validate connection has required fields
        if (!connection?.sourceId || !connection?.targetId) {
          console.warn('[saveWorkflowEdges] Skipping invalid connection:', connection);
          return false;
        }
        return true;
      })
      .map((connection, index) => {
        // Extract condition data using the new model (conditions array + conditionType)
        let conditionField = null;
        let conditionOperator = null;
        let conditionValue = null;
        
        // If connection is conditional and has at least one condition, use the first one for backward database compatibility
        if (connection.conditionType === 'conditional' && connection.conditions && connection.conditions.length > 0) {
          const primaryCondition = connection.conditions[0];
          conditionField = primaryCondition.field || null;
          conditionOperator = primaryCondition.operator || null;
          conditionValue = primaryCondition.value !== undefined ? primaryCondition.value : null;
        }
        
        return {
          id: connection.id, // Keep existing ID for upsert
          form_id: formId,
          source_block_id: connection.sourceId,
          target_block_id: connection.targetId,
          condition_field: conditionField,
          condition_operator: conditionOperator,
          condition_value: conditionValue,
          condition_type: connection.conditionType || 'always',
          condition_json: connection.conditions && connection.conditions.length > 0 ? JSON.stringify(connection.conditions) : null,
          order_index: connection.order_index || index
        };
      });
    
    // If we have existing edges, identify which ones need to be deleted
    // (those that exist in DB but not in the current connections array)
    if (existingEdges && existingEdges.length > 0) {
      const currentEdgeIds = new Set(connections.map(c => c.id));
      const edgesToDelete = existingEdges
        .filter(edge => !currentEdgeIds.has(edge.id))
        .map(edge => edge.id);
      
      if (edgesToDelete.length > 0) {
        console.log(`[saveWorkflowEdges] Removing ${edgesToDelete.length} obsolete edges`);
        
        // Delete edges that are no longer needed
        const { error: deleteError } = await supabase
          .from('workflow_edges')
          .delete()
          .in('id', edgesToDelete);
          
        if (deleteError) {
          console.error('[saveWorkflowEdges] Error deleting edges:', deleteError);
        }
      }
    }
    
    // If no edges to save, we're done
    if (edgesToSave.length === 0) {
      return { success: true, edges: [] };
    }
    
    // Use upsert to update existing edges or insert new ones
    const { data: savedEdges, error: upsertError } = await supabase
      .from('workflow_edges')
      .upsert(edgesToSave, { 
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select('*');
    
    if (upsertError) {
      console.error('[saveWorkflowEdges] Error upserting edges:', upsertError);
      
      // Despite the error, try to fetch the current state to return
      const { data: currentEdges } = await supabase
        .from('workflow_edges')
        .select('*')
        .eq('form_id', formId);
        
      return { success: false, edges: currentEdges || [] };
    }
    
    console.log(`[saveWorkflowEdges] Successfully saved ${edgesToSave.length} edges`);
    return { success: true, edges: savedEdges || [] };
  } catch (error) {
    console.error('[saveWorkflowEdges] Unhandled error:', error);
    return { success: false, edges: [] };
  }
} 
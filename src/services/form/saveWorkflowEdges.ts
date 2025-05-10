import { createClient } from '@/lib/supabase/client';
import type { Connection, Rule } from '@/types/workflow-types';
import type { WorkflowEdge } from '@/types/supabase-types';

/**
 * Save workflow edges to the database
 * Maps the connections from the frontend to the database schema
 * Uses upsert instead of delete/insert for better reliability
 * 
 * @param formId - ID of the form
 * @param connections - Array of workflow connections
 * @returns Object containing success status and saved edges
 */
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
      // Continue, but deletions might not be accurate
    }
    
    // Map connections to database schema and validate
    const edgesToSave: Partial<WorkflowEdge>[] = connections
      .filter(connection => {
        // Filter out connections missing essential IDs. defaultTargetId can be null.
        if (!connection?.id || !connection?.sourceId) {
          console.warn('[saveWorkflowEdges] Skipping invalid connection (missing id or sourceId):', connection);
          return false;
        }
        return true;
      })
      .map((connection, index) => {
        const rulesArray: Rule[] = connection.rules && Array.isArray(connection.rules) ? connection.rules : [];
        const rulesJson = JSON.stringify(rulesArray);
        
        // Note: condition_type was removed as it doesn't exist in the database schema

        return {
          id: connection.id,
          form_id: formId,
          source_block_id: connection.sourceId,
          default_target_id: connection.defaultTargetId, // This is now string | null, matching the global type
          rules: rulesJson,
          order_index: connection.order_index || index,
          is_explicit: connection.is_explicit
          // created_at and updated_at will be handled by Supabase
        };
      });
    
    // If we have existing edges, identify which ones need to be deleted
    if (existingEdges && existingEdges.length > 0) {
      const currentEdgeIds = new Set(edgesToSave.map(c => c.id)); // Use edgesToSave which are validated
      const edgesToDelete = existingEdges
        .filter(edge => !currentEdgeIds.has(edge.id))
        .map(edge => edge.id);
      
      if (edgesToDelete.length > 0) {
        console.log(`[saveWorkflowEdges] Removing ${edgesToDelete.length} obsolete edges:`, edgesToDelete);
        
        const { error: deleteError } = await supabase
          .from('workflow_edges')
          .delete()
          .in('id', edgesToDelete);
          
        if (deleteError) {
          console.error('[saveWorkflowEdges] Error deleting edges:', deleteError);
          // Potentially return failure or log and continue
        }
      }
    }
    
    // If no edges to save (e.g., all connections were invalid or array was empty after filtering),
    // and no deletions were made, we can consider it a success but with no operations.
    // If deletions happened, they were logged. If edgesToSave is empty now, no upsert needed.
    if (edgesToSave.length === 0) {
      console.log('[saveWorkflowEdges] No valid edges to save.');
      return { success: true, edges: [] };
    }
    
    const { data: savedEdges, error: upsertError } = await supabase
      .from('workflow_edges')
      .upsert(edgesToSave, { 
        onConflict: 'id',
        ignoreDuplicates: false // This is the default, but explicit for clarity
      })
      .select('*'); // Select all columns to match WorkflowEdge interface
    
    if (upsertError) {
      console.error('[saveWorkflowEdges] Error upserting edges:', upsertError);
      
      const { data: currentEdgesAfterError } = await supabase
        .from('workflow_edges')
        .select('*')
        .eq('form_id', formId);
        
      return { success: false, edges: currentEdgesAfterError || [] };
    }
    
    console.log(`[saveWorkflowEdges] Successfully saved/updated ${savedEdges?.length || 0} edges`);
    return { success: true, edges: savedEdges || [] };
  } catch (error) {
    console.error('[saveWorkflowEdges] Unhandled error:', error);
    // Attempt to fetch current state even on unhandled error, though likely to fail if DB issue
    try {
      const { data: currentEdgesOnFail } = await supabase
        .from('workflow_edges')
        .select('*')
        .eq('form_id', formId);
      return { success: false, edges: currentEdgesOnFail || [] };
    } catch (finalError) {
      console.error('[saveWorkflowEdges] Error fetching edges after unhandled error:', finalError);
      return { success: false, edges: [] };
    }
  }
}
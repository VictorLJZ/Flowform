import { createClient } from '@/lib/supabase/client';
import type { Connection } from '@/types/workflow-types';
import type { WorkflowEdge } from '@/types/supabase-types';
import { transformConnections } from '@/services/connection/transformConnections';

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
    const { data: edgesData, error } = await supabase
      .from('workflow_edges')
      .select('*')
      .eq('form_id', formId)
      .order('order_index', { ascending: true });
    
    const workflowEdges = edgesData as WorkflowEdge[] | null;

    if (error) {
      console.error('[getWorkflowEdges] Error fetching workflow edges:', error);
      return [];
    }
    
    // If no edges found, return empty array
    if (!workflowEdges || workflowEdges.length === 0) {
      return [];
    }
    
    // Use the centralized transformConnections function
    const connections: Connection[] = transformConnections(workflowEdges);
    
    return connections;
  } catch (error) {
    console.error('[getWorkflowEdges] Error:', error);
    return [];
  }
}
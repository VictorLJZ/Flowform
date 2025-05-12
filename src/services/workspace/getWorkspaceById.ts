import { createClient } from '@/lib/supabase/client';
import { DbWorkspace, ApiWorkspace } from '@/types/workspace';
import { dbToApiWorkspace } from '@/utils/type-utils';

/**
 * Fetch workspace data by ID
 * 
 * @param workspaceId - The ID of the workspace to fetch
 * @returns The workspace or null if not found
 */
export async function getWorkspaceById(workspaceId: string): Promise<ApiWorkspace | null> {
  if (!workspaceId) {
    console.error('[getWorkspaceById] No workspace ID provided');
    return null;
  }

  console.log('[getWorkspaceById] Fetching workspace:', workspaceId);
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();
    
    if (error) {
      console.error('[getWorkspaceById] Error fetching workspace:', error);
      return null;
    }
    
    const dbWorkspace = data as DbWorkspace;
    return dbToApiWorkspace(dbWorkspace);
  } catch (error) {
    console.error('[getWorkspaceById] Unexpected error:', error);
    return null;
  }
}

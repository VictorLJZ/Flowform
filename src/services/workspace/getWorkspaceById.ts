import { createClient } from '@/lib/supabase/client';
import { Workspace } from '@/types/supabase-types';

/**
 * Fetch workspace data by ID
 * 
 * @param workspaceId - The ID of the workspace to fetch
 * @returns The workspace or null if not found
 */
export async function getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
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
    
    return data as Workspace;
  } catch (error) {
    console.error('[getWorkspaceById] Unexpected error:', error);
    return null;
  }
}

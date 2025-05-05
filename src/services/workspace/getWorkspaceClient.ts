import { createClient } from '@/lib/supabase/client';
import type { Workspace } from '@/types/supabase-types';

/**
 * Get a single workspace by ID - client-side implementation
 * 
 * @param workspaceId - ID of the workspace
 * @returns The workspace or null if not found
 */
export async function getWorkspaceClient(workspaceId: string): Promise<Workspace | null> {
  if (!workspaceId) {
    console.warn('[getWorkspaceClient] No workspace ID provided');
    return null;
  }
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();
      
    // Handle the case where workspace doesn't exist (PGRST116 error)
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('rows returned')) {
        console.warn(`[getWorkspaceClient] Workspace not found: ${workspaceId}`);
        // Clear this invalid workspace from localStorage
        try {
          const store = JSON.parse(localStorage.getItem('workspace-state-storage') || '{}');
          if (store.state?.currentWorkspaceId === workspaceId) {
            store.state.currentWorkspaceId = null;
            localStorage.setItem('workspace-state-storage', JSON.stringify(store));
            console.log('[getWorkspaceClient] Removed invalid workspace from localStorage');
          }
        } catch (e) {
          // Ignore localStorage errors
        }
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('[getWorkspaceClient] Error fetching workspace:', error);
    return null;
  }
}

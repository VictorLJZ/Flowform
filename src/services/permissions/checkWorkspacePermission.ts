import { createClient } from '@/lib/supabase/server';
import { networkLog } from '@/lib/debug-logger';

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

/**
 * Check if user has permission to perform operations on a workspace
 * 
 * @param workspaceId - ID of the workspace to check permissions for
 * @param userId - ID of the user to check permissions for
 * @param requiredRoles - Array of roles that have permission (defaults to owner and admin)
 * @returns Object with hasPermission boolean and user's role if found
 */
export async function checkWorkspacePermission(
  workspaceId: string,
  userId: string,
  requiredRoles: WorkspaceRole[] = ['owner', 'admin']
): Promise<{hasPermission: boolean, role?: string}> {
  const supabase = await createClient();
  
  if (!userId) {
    networkLog('Permission check failed - no userId provided', { workspaceId });
    return { hasPermission: false };
  }
  
  // Check membership and role with a single query
  const { data, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();
    
  if (error || !data) {
    return { hasPermission: false };
  }
  
  return { 
    hasPermission: requiredRoles.includes(data.role as WorkspaceRole),
    role: data.role
  };
}

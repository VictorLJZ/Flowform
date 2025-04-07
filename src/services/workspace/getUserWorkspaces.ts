import { createClient } from '@/lib/supabase/client';
import { Workspace, WorkspaceMember } from '@/types/supabase-types';

/**
 * Get all workspaces where the user is a member
 * 
 * @param userId - The ID of the user
 * @returns An array of workspaces
 */
export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  const supabase = createClient();
  
  // First get all workspace IDs where the user is a member
  const { data: memberships, error: membershipError } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId);
  
  if (membershipError) {
    console.error('Error fetching workspace memberships:', membershipError);
    throw membershipError;
  }
  
  if (!memberships || memberships.length === 0) {
    return [];
  }

  // Get all workspaces by their IDs
  const workspaceIds = memberships.map((m) => m.workspace_id);
  const { data: workspaces, error: workspacesError } = await supabase
    .from('workspaces')
    .select('*')
    .in('id', workspaceIds);
  
  if (workspacesError) {
    console.error('Error fetching workspaces:', workspacesError);
    throw workspacesError;
  }
  
  return workspaces || [];
}

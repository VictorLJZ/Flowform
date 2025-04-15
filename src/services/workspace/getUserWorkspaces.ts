import { createClient } from '@/lib/supabase/client';
import { Workspace, WorkspaceMember } from '@/types/supabase-types';

/**
 * Get all workspaces where the user is a member
 * 
 * @param userId - The ID of the user
 * @returns An array of workspaces
 */
export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  console.log('[getUserWorkspaces] Starting with userId:', userId);
  
  try {
    // Create Supabase client
    const supabase = createClient();
    console.log('[getUserWorkspaces] Supabase client created');
    
    // Log session status to check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('[getUserWorkspaces] Session check:', {
      isAuthenticated: !!session,
      hasError: !!sessionError,
      error: sessionError,
      userId: session?.user?.id,
      providedUserId: userId,
      idsMatch: session?.user?.id === userId
    });
    
    // First get all workspace IDs where the user is a member
    console.log('[getUserWorkspaces] Fetching workspace_members table data');
    const membershipResponse = await supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', userId);
      
    const { data: memberships, error: membershipError, status: membershipStatus } = membershipResponse;
    
    console.log('[getUserWorkspaces] Membership query details:', {
      status: membershipStatus,
      query: `workspace_members where user_id = ${userId}`,
      count: memberships?.length || 0,
      error: membershipError,
      rawError: JSON.stringify(membershipError),
      rawData: memberships ? JSON.stringify(memberships.slice(0, 2)) + (memberships.length > 2 ? '...' : '') : 'null'
    });
    
    if (membershipError) {
      console.error('[getUserWorkspaces] Error fetching workspace memberships:', membershipError);
      throw membershipError;
    }
    
    if (!memberships || memberships.length === 0) {
      console.log('[getUserWorkspaces] No workspace memberships found for user');
      return [];
    }

    // Get all workspaces by their IDs
    const workspaceIds = memberships.map((m) => m.workspace_id);
    console.log('[getUserWorkspaces] Found workspace IDs:', workspaceIds);
    
    console.log('[getUserWorkspaces] Fetching workspaces table data');
    const workspacesResponse = await supabase
      .from('workspaces')
      .select('*')
      .in('id', workspaceIds);
    
    const { data: workspaces, error: workspacesError, status: workspacesStatus } = workspacesResponse;
    
    console.log('[getUserWorkspaces] Workspaces query details:', {
      status: workspacesStatus,
      query: `workspaces where id in (${workspaceIds.join(', ')})`,
      count: workspaces?.length || 0,
      error: workspacesError,
      rawError: JSON.stringify(workspacesError),
      rawData: workspaces ? JSON.stringify(workspaces.slice(0, 2)) + (workspaces.length > 2 ? '...' : '') : 'null'
    });
    
    if (workspacesError) {
      console.error('[getUserWorkspaces] Error fetching workspaces:', workspacesError);
      throw workspacesError;
    }
    
    console.log('[getUserWorkspaces] Successfully fetched workspaces:', {
      count: workspaces?.length || 0,
      names: workspaces?.map(w => w.name) || []
    });
    
    return workspaces || [];
  } catch (error) {
    console.error('[getUserWorkspaces] Unexpected error:', error);
    throw error;
  }
}

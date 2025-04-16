import { createClient } from '@/lib/supabase/server';
import { Workspace, WorkspaceMember } from '@/types/supabase-types';

// Interface for the specific fields returned by the workspace_members query
interface WorkspaceMemberBasic {
  workspace_id: string;
  role: string;
}

/**
 * Get all workspaces where the user is a member
 * 
 * @param userId - The ID of the user
 * @returns An array of workspaces
 */
export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  console.log('[getUserWorkspaces] Starting with userId:', userId);
  
  try {
    // Use the server-side Supabase client
    const supabase = await createClient();
    console.log('[getUserWorkspaces] Using server-side Supabase client');
    console.log('[getUserWorkspaces] Proceeding with workspace fetch for userId:', userId);
    
    // FIRST QUERY: Get workspace memberships with timeout protection
    console.log('📍 [QUERY_TRACKING] Step 1: About to execute workspace_members query');
    
    // Create promise that will reject after timeout
    const membershipTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Workspace members query timed out after 5 seconds'));
      }, 5000);
    });
    
    console.log('📍 [QUERY_TRACKING] Step 2: Query created, awaiting execution');
    
    // Use Promise.race to implement timeout
    const membershipResponse = await Promise.race([
      supabase
        .from('workspace_members')
        .select('workspace_id, role')
        .eq('user_id', userId),
      membershipTimeout
    ]);
    
    console.log('📍 [QUERY_TRACKING] Step 3: First query completed!');
    
    // Extract data from the response
    const { data: memberships, error: membershipError } = membershipResponse;
    
    // Log membership query details
    console.log('[getUserWorkspaces] Membership query details:', {
      count: memberships?.length || 0,
      error: membershipError ? membershipError.message : null
    });
    
    // Check for errors
    if (membershipError) {
      console.error('[getUserWorkspaces] Error fetching workspace memberships:', membershipError);
      throw membershipError;
    }
    
    // Check for empty results
    if (!memberships || memberships.length === 0) {
      console.log('[getUserWorkspaces] No workspace memberships found for user');
      return [];
    }
    
    // Get workspace IDs from memberships
    const workspaceIds = memberships.map((m: WorkspaceMemberBasic) => m.workspace_id);
    console.log('[getUserWorkspaces] Found workspace IDs:', workspaceIds);
    
    // SECOND QUERY: Get workspaces with timeout protection
    console.log('📍 [QUERY_TRACKING] Step 4: About to execute workspaces query');
    
    // Create promise that will reject after timeout
    const workspacesTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Workspaces query timed out after 5 seconds'));
      }, 5000);
    });
    
    console.log('📍 [QUERY_TRACKING] Step 5: Second query created, awaiting execution');
    
    // Use Promise.race to implement timeout
    const workspacesResponse = await Promise.race([
      supabase
        .from('workspaces')
        .select('*')
        .in('id', workspaceIds),
      workspacesTimeout
    ]);
    
    console.log('📍 [QUERY_TRACKING] Step 6: Second query completed!');
    
    // Extract data from the response
    const { data: workspaces, error: workspacesError } = workspacesResponse;
    
    // Log workspaces query details
    console.log('[getUserWorkspaces] Workspaces query details:', {
      count: workspaces?.length || 0,
      error: workspacesError ? workspacesError.message : null
    });
    
    // Check for errors
    if (workspacesError) {
      console.error('[getUserWorkspaces] Error fetching workspaces:', workspacesError);
      throw workspacesError;
    }
    
    // Log success
    console.log('[getUserWorkspaces] Successfully fetched workspaces:', {
      count: workspaces?.length || 0,
      names: workspaces?.map((w: Workspace) => w.name) || []
    });
    
    // Return workspaces or empty array
    return workspaces || [];
  } catch (error) {
    // Log any unexpected errors with proper type handling
    console.error('[getUserWorkspaces] ERROR in workspace fetch:', 
      error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

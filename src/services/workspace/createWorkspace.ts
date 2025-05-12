import { createClient } from '@/lib/supabase/client';
import { ApiWorkspace, ApiWorkspaceInput } from '@/types/workspace';
import { dbToApiWorkspace, workspaceInputToDb } from '@/utils/type-utils';

/**
 * Create a new workspace and automatically add the creator as an owner
 * 
 * @param workspaceData - The workspace data to create (API layer format)
 * @returns The newly created workspace (API layer format)
 */
export async function createWorkspace(workspaceData: ApiWorkspaceInput): Promise<ApiWorkspace> {
  console.log('[createWorkspace] Starting with data:', {
    name: workspaceData.name,
    userId: workspaceData.createdBy,
  });

  // Create a fresh client for this operation
  const supabase = createClient();

  // Verify session is active before proceeding
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('[createWorkspace] Session validation failed:', sessionError || 'No session found');
      throw new Error('Authentication required. Please refresh the page and try again.');
    }

    console.log('[createWorkspace] Session validated, proceeding with workspace creation');
  } catch (error) {
    console.error('[createWorkspace] Error validating session:', error);
    throw new Error('Authentication error. Please refresh the page and try again.');
  }

  // Start a transaction by using a single connection
  // Create the workspace
  try {
    // Transform API input to DB format
    const dbWorkspaceData = workspaceInputToDb(workspaceData);
    
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert(dbWorkspaceData)
      .select('*')

    if (workspaceError) {
      console.error('[createWorkspace] Error creating workspace:', workspaceError);
      throw workspaceError;
    }

    if (!workspace || workspace.length === 0) {
      console.error('[createWorkspace] No workspace data returned after creation');
      throw new Error('Failed to create workspace: No data returned');
    }

    // Use the first item in the array instead of .single() which can cause errors
    const newWorkspace = workspace[0];

    // Add the creator as an owner
    console.log('[createWorkspace] Adding creator as owner:', {
      workspaceId: newWorkspace.id,
      userId: workspaceData.createdBy
    });
    
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: newWorkspace.id,
        user_id: workspaceData.createdBy,
        role: 'owner',
      });

    if (memberError) {
      console.error('[createWorkspace] Error adding workspace owner:', memberError);
      // Consider rolling back the workspace creation here if supported
      throw memberError;
    }

    // Set a flag to ensure this workspace remains selected
    if (typeof window !== 'undefined') {
      console.log('[createWorkspace] Setting manual workspace switch flag for new workspace:', newWorkspace.id);
      window.sessionStorage.setItem('manual_workspace_switch', 'true');
      window.sessionStorage.setItem('workspace_last_switched', Date.now().toString());
    }

    console.log('[createWorkspace] Successfully created workspace:', newWorkspace.id);
    
    // Transform DB workspace to API workspace before returning
    return dbToApiWorkspace(newWorkspace);
  } catch (error) {
    console.error('[createWorkspace] Unexpected error:', error);
    
    // Rethrow with a user-friendly message
    if (error instanceof Error) {
      // If it's already a structured error, rethrow it
      throw error;
    } else {
      throw new Error('Failed to create workspace. Please try again later.');
    }
  }
}

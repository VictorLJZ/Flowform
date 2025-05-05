import { createClient } from '@/lib/supabase/client';
import { Workspace } from '@/types/supabase-types';
import { WorkspaceInput } from '@/types/workspace-types';

/**
 * Create a new workspace and automatically add the creator as an owner
 * 
 * @param workspaceData - The workspace data to create
 * @returns The newly created workspace
 */
export async function createWorkspace(workspaceData: WorkspaceInput): Promise<Workspace> {
  console.log('[createWorkspace] Starting with data:', {
    name: workspaceData.name,
    userId: workspaceData.created_by,
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
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: workspaceData.name,
        description: workspaceData.description,
        created_by: workspaceData.created_by,
        logo_url: workspaceData.logo_url || null,
        settings: workspaceData.settings || null,
      })
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
      userId: workspaceData.created_by
    });
    
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: newWorkspace.id,
        user_id: workspaceData.created_by,
        role: 'owner',
      });

    if (memberError) {
      console.error('[createWorkspace] Error adding workspace owner:', memberError);
      // Consider rolling back the workspace creation here if supported
      throw memberError;
    }

    console.log('[createWorkspace] Successfully created workspace:', newWorkspace.id);
    return newWorkspace;
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

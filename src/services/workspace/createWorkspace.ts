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
  const supabase = createClient();

  // Start a transaction by using a single connection
  // Create the workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      name: workspaceData.name,
      description: workspaceData.description,
      created_by: workspaceData.created_by,
      logo_url: workspaceData.logo_url,
      settings: workspaceData.settings,
    })
    .select()
    .single();

  if (workspaceError) {
    console.error('Error creating workspace:', workspaceError);
    throw workspaceError;
  }

  // Add the creator as an owner
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspace.id,
      user_id: workspaceData.created_by,
      role: 'owner',
    });

  if (memberError) {
    console.error('Error adding workspace owner:', memberError);
    // Consider rolling back the workspace creation here if supported
    throw memberError;
  }

  return workspace;
}

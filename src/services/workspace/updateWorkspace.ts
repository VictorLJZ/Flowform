import { createClient } from '@/lib/supabase/client';
import { Workspace } from '@/types/supabase-types';

type WorkspaceUpdateInput = Partial<Pick<Workspace, 
  'name' | 
  'description' | 
  'logo_url' | 
  'settings'
>>;

/**
 * Update an existing workspace
 * 
 * @param workspaceId - The ID of the workspace to update
 * @param workspaceData - The workspace data to update
 * @returns The updated workspace
 */
export async function updateWorkspace(
  workspaceId: string,
  workspaceData: WorkspaceUpdateInput
): Promise<Workspace> {
  const supabase = createClient();

  // Get the current user to verify ownership/permissions
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // Check if user is a member of this workspace with owner or admin role
  const { data: memberData, error: memberError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userData.user.id)
    .single();

  if (memberError || !memberData) {
    throw new Error('User does not have permission to update this workspace');
  }

  if (memberData.role !== 'owner' && memberData.role !== 'admin') {
    throw new Error('User does not have permission to update this workspace');
  }

  // Add updated_at timestamp
  const updateData = {
    ...workspaceData,
    updated_at: new Date().toISOString()
  };

  // Update the workspace
  const { data, error } = await supabase
    .from('workspaces')
    .update(updateData)
    .eq('id', workspaceId)
    .select()
    .single();

  if (error) {
    console.error('Error updating workspace:', error);
    throw error;
  }

  return data;
}

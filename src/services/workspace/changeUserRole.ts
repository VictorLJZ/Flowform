import { createClient } from '@/lib/supabase/server';
import { WorkspaceRole } from '@/types/workspace-types';

/**
 * Change the role of a workspace member
 * 
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user to update
 * @param role - The new role to assign
 * @returns Success status
 */
export async function changeUserRole(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole
): Promise<boolean> {
  const supabase = await createClient();

  // First, check if this would remove the last owner
  if (role !== 'owner') {
    const { data: owners, error: ownersError } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', workspaceId)
      .eq('role', 'owner');

    if (ownersError) {
      console.error('Error checking workspace owners:', ownersError);
      throw ownersError;
    }

    // If this is the only owner, prevent the role change
    if (owners.length === 1 && owners[0].user_id === userId) {
      throw new Error('Cannot change role of the last workspace owner');
    }
  }

  // Update the member's role
  const { error } = await supabase
    .from('workspace_members')
    .update({ role })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error changing user role:', error);
    throw error;
  }

  return true;
}

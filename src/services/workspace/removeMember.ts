import { createClient } from '@/lib/supabase/server';

/**
 * Remove a member from a workspace
 * 
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user to remove
 * @returns Success status
 */
export async function removeMember(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  // First, check if this would remove the last owner
  const { data: owners, error: ownersError } = await supabase
    .from('workspace_members')
    .select('user_id, role')
    .eq('workspace_id', workspaceId)
    .eq('role', 'owner');

  if (ownersError) {
    console.error('Error checking workspace owners:', ownersError);
    throw ownersError;
  }

  // If this is the only owner, prevent removal
  if (owners.length === 1 && owners[0].user_id === userId) {
    throw new Error('Cannot remove the last workspace owner');
  }

  // Delete the workspace membership
  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing workspace member:', error);
    throw error;
  }

  return true;
}

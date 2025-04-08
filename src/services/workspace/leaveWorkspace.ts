import { createClient } from '@/lib/supabase/client';

/**
 * Allows a user to leave a workspace
 * 
 * @param workspaceId - The ID of the workspace to leave
 * @returns Success status
 */
export async function leaveWorkspace(workspaceId: string): Promise<{ success: boolean }> {
  const supabase = createClient();

  // Get the current user
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const userId = userData.user.id;

  // Check if user is a member of this workspace
  const { data: memberData, error: memberError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (memberError || !memberData) {
    throw new Error('User is not a member of this workspace');
  }

  // Check if the user is the owner and if they're the only owner
  if (memberData.role === 'admin') {
    // Count other owners
    const { data: ownersData, error: ownersError } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', workspaceId)
      .eq('role', 'admin');

    if (ownersError) {
      console.error('Error checking workspace owners:', ownersError);
      throw ownersError;
    }

    // If this is the only owner, prevent leaving
    if (!ownersData || ownersData.length <= 1) {
      throw new Error('Cannot leave workspace as the only owner. Transfer ownership or delete workspace instead.');
    }
  }

  // Remove user from workspace_members
  const { error: deleteError } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);

  if (deleteError) {
    console.error('Error leaving workspace:', deleteError);
    throw deleteError;
  }

  return { success: true };
}

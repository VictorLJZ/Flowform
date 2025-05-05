import { createClient } from '@/lib/supabase/client';
import { useWorkspaceStore } from '@/stores/workspaceStore';

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

  // Different checks based on role
  if (memberData.role === 'owner') {
    // If the user is an owner, check if they're the only owner
    const { data: ownersData, error: ownersError } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', workspaceId)
      .eq('role', 'owner');

    if (ownersError) {
      console.error('Error checking workspace owners:', ownersError);
      throw ownersError;
    }

    // If this is the only owner, prevent leaving
    if (!ownersData || ownersData.length <= 1) {
      throw new Error('Cannot leave workspace as the only owner. Transfer ownership or delete workspace instead.');
    }
  } else if (memberData.role === 'admin') {
    // If the user is an admin, check if they're the only admin AND there are no owners
    const { data: adminsData, error: adminsError } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', workspaceId)
      .eq('role', 'admin');

    if (adminsError) {
      console.error('Error checking workspace admins:', adminsError);
      throw adminsError;
    }

    // Also check if there are any owners
    const { data: ownersData, error: ownersError } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', workspaceId)
      .eq('role', 'owner');

    if (ownersError) {
      console.error('Error checking workspace owners:', ownersError);
      throw ownersError;
    }

    // Only prevent leaving if this is the only admin AND there are no owners
    if ((!adminsData || adminsData.length <= 1) && (!ownersData || ownersData.length === 0)) {
      throw new Error('Cannot leave workspace as the only admin when there are no owners. Transfer admin rights first.');
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

  // Update workspace store
  const workspaceStore = useWorkspaceStore.getState();
  const currentWorkspaceId = workspaceStore.currentWorkspaceId;
  const workspaces = workspaceStore.workspaces.filter(w => w.id !== workspaceId);
  
  // Set workspaces without the one we just left
  workspaceStore.setWorkspaces(workspaces);
  
  // If we left the currently selected workspace, select a new one
  if (currentWorkspaceId === workspaceId) {
    // If there are other workspaces, select the first one
    if (workspaces.length > 0) {
      workspaceStore.setCurrentWorkspaceId(workspaces[0].id);
    } else {
      // If no workspaces left, set to null
      workspaceStore.setCurrentWorkspaceId(null);
    }
  }

  return { success: true };
}

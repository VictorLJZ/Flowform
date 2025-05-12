import { createClient } from '@/lib/supabase/client';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { getUserWorkspacesClient } from './getUserWorkspacesClient';

/**
 * Allows a user to leave a workspace
 * 
 * @param workspaceId - The ID of the workspace to leave
 * @returns Success status
 */
export async function leaveWorkspace(workspaceId: string): Promise<{ 
  success: boolean; 
  isWorkspaceDeleted?: boolean;
  message?: string; 
}> {
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

  // First, check total number of members in the workspace
  const { data: allMembersData, error: allMembersError } = await supabase
    .from('workspace_members')
    .select('user_id, role')
    .eq('workspace_id', workspaceId);

  if (allMembersError) {
    console.error('Error checking workspace members:', allMembersError);
    throw allMembersError;
  }

  // If user is the sole member of the workspace
  if (!allMembersData || allMembersData.length <= 1) {
    console.log('User is the sole member of this workspace - signaling for workspace deletion');
    
    // Instead of deleting here, just signal that the workspace should be deleted
    // The calling component will handle the actual deletion with UI updates
    return { success: true, isWorkspaceDeleted: true };
  }

  // Different checks based on role
  if (memberData.role === 'owner') {
    // If the user is an owner, check if they're the only owner
    const ownersData = allMembersData.filter(member => member.role === 'owner');
    
    // If this is the only owner and there are other members, prevent leaving but don't throw an error
    if (ownersData.length <= 1 && allMembersData.length > 1) {
      return { 
        success: false, 
        message: 'Cannot leave workspace as the only owner when other members exist. Transfer ownership first.' 
      };
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

  // Update selection state if needed
  const workspaceStore = useWorkspaceStore.getState();
  const currentWorkspaceId = workspaceStore.currentWorkspaceId;
  
  // If we left the currently selected workspace, select a new one
  if (currentWorkspaceId === workspaceId) {
    // Get user's remaining workspaces from the database
    try {
      const remainingWorkspaces = await getUserWorkspacesClient(userId);
      
      // If there are other workspaces, select the first one
      if (remainingWorkspaces && remainingWorkspaces.length > 0) {
        workspaceStore.selectWorkspace(remainingWorkspaces[0].id);
      } else {
        // If no workspaces left, clear the selection
        workspaceStore.selectWorkspace(null);
      }
    } catch (error) {
      console.error('Error fetching remaining workspaces:', error);
      // Clear the selection if we can't fetch workspaces
      workspaceStore.selectWorkspace(null);
    }
  }

  return { success: true, isWorkspaceDeleted: false };
}

import { createClient } from '@/lib/supabase/client';

/**
 * Delete a workspace and all associated data
 * 
 * @param workspaceId - The ID of the workspace to delete
 * @returns Success status
 */
export async function deleteWorkspace(workspaceId: string): Promise<{ success: boolean }> {
  const supabase = createClient();

  // Get the current user to verify ownership
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // Check if user is an owner of this workspace
  const { data: memberData, error: memberError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userData.user.id)
    .single();

  if (memberError || !memberData) {
    throw new Error('User is not a member of this workspace');
  }
  
  // Allow both owners and admins to delete workspaces
  if (memberData.role !== 'owner' && memberData.role !== 'admin') {
    throw new Error('Only workspace owners and admins can delete workspaces');
  }

  // Delete the workspace directly - database CASCADE will handle related records
  const { data: deletedData, error: deleteError } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId)
    .select();

  if (deleteError) {
    console.error('Error deleting workspace:', deleteError);
    throw deleteError;
  }
  
  // Verify the workspace was actually deleted
  console.log('Delete operation result:', { deletedData });
  
  // Double-check if the workspace was deleted
  const { data: checkData, error: checkError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .maybeSingle();
    
  if (checkError) {
    console.error('Error verifying workspace deletion:', checkError);
  }
  
  if (checkData) {
    console.error('Workspace still exists after delete operation:', checkData);
    throw new Error('Failed to delete workspace - it still exists in the database');
  }

  return { success: true };
}

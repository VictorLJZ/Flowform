import { createClient } from '@/lib/supabase/client';
import { deleteForm } from '../form/deleteForm';

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

  if (memberError || !memberData || memberData.role !== 'owner') {
    throw new Error('Only workspace owners can delete workspaces');
  }

  // First, get all forms associated with this workspace
  const { data: forms, error: formsError } = await supabase
    .from('forms')
    .select('form_id')
    .eq('workspace_id', workspaceId);

  if (formsError) {
    console.error('Error fetching workspace forms:', formsError);
    throw formsError;
  }

  // Delete each form and its associated data
  if (forms && forms.length > 0) {
    for (const form of forms) {
      await deleteForm(form.form_id);
    }
  }

  // Delete workspace invitations
  const { error: invitationsError } = await supabase
    .from('workspace_invitations')
    .delete()
    .eq('workspace_id', workspaceId);

  if (invitationsError) {
    console.error('Error deleting workspace invitations:', invitationsError);
    throw invitationsError;
  }

  // Delete workspace members
  const { error: membersError } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId);

  if (membersError) {
    console.error('Error deleting workspace members:', membersError);
    throw membersError;
  }

  // Finally delete the workspace itself
  const { error: deleteError } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId);

  if (deleteError) {
    console.error('Error deleting workspace:', deleteError);
    throw deleteError;
  }

  return { success: true };
}

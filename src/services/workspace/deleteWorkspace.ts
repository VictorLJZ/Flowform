import { createClient } from '@/lib/supabase/client';
import type { ApiWorkspace } from '@/types/workspace';
import { dbToApiWorkspace } from '@/utils/type-utils';

/**
 * Delete a workspace and all associated data
 * 
 * @param workspaceId - The ID of the workspace to delete
 * @returns Success status and remaining workspaces
 */
export async function deleteWorkspace(workspaceId: string): Promise<{ 
  success: boolean;
  remainingWorkspaces?: ApiWorkspace[];
}> {
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
  
  // Log membership details
  console.log('[deleteWorkspace] Checking workspace membership:', {
    workspaceId,
    userId: userData.user.id,
    role: memberData.role
  });
  
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
  console.log('[deleteWorkspace] Workspace delete operation completed', {
    deletedWorkspaceId: workspaceId,
    deleteResult: deletedData
  });
  
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

  // After successful deletion, fetch the remaining workspaces for the user
  // This will be used for client-side workspace selection
  const { data: remainingWorkspaces, error: fetchError } = await supabase
    .from('workspaces')
    .select('*')
    .in(
      'id', 
      (await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userData.user.id)
      ).data?.map(m => m.workspace_id) || []
    );
      
  if (fetchError) {
    console.error('Error fetching remaining workspaces after deletion:', fetchError);
  }
  
  // Log remaining workspaces after deletion
  console.log('[deleteWorkspace] Remaining workspaces after deletion:', {
    count: remainingWorkspaces?.length || 0,
    ids: remainingWorkspaces?.map(w => w.id)
  });

  // Transform DB workspaces to API format before returning
  const apiWorkspaces = remainingWorkspaces ? 
    remainingWorkspaces.map(dbToApiWorkspace) : 
    [];
    
  return { 
    success: true,
    remainingWorkspaces: apiWorkspaces
  };
}

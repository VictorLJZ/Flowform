import { createClient } from '@/lib/supabase/server';
import { DbWorkspaceRole } from '@/types/workspace';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Helper to check permissions for removing a member
 * 
 * @param supabase - Supabase client
 * @param workspaceId - The ID of the workspace
 * @param initiatorUserId - The ID of the user initiating the removal
 * @param targetUserId - The ID of the user being removed
 * @returns The roles of the initiator and target users
 */
async function checkRemovePermissions(
  supabase: SupabaseClient,
  workspaceId: string,
  initiatorUserId: string,
  targetUserId: string
): Promise<{ initiatorRole: DbWorkspaceRole; targetRole: DbWorkspaceRole }> {
  // Define expected shape inline
  type MemberRoleInfo = { user_id: string; role: DbWorkspaceRole };
  
  const { data: members, error } = await supabase
    .from('workspace_members')
    .select('user_id, role')
    .eq('workspace_id', workspaceId)
    .in('user_id', [initiatorUserId, targetUserId])
    .returns<MemberRoleInfo[]>();

  if (error) {
    console.error('Error fetching member roles for permission check:', error);
    throw new Error('Could not verify permissions for removal.');
  }

  const initiator = members?.find((m: MemberRoleInfo) => m.user_id === initiatorUserId);
  const target = members?.find((m: MemberRoleInfo) => m.user_id === targetUserId);

  if (!initiator || !target) {
    throw new Error('Initiator or target member not found in workspace for removal.');
  }

  const initiatorRole = initiator.role as DbWorkspaceRole;
  const targetRole = target.role as DbWorkspaceRole;

  // Permission Logic for Removal
  if (initiatorRole === 'owner') {
    // Owner can remove anyone EXCEPT themselves (implicitly disallowed by UI/flow)
    // And cannot remove the last owner (checked separately)
    if (targetRole !== 'owner') { // Owners cannot be removed directly, only transfer+demote
      return { initiatorRole, targetRole };
    }
  } else if (initiatorRole === 'admin') {
    // Admin can only remove editors and viewers
    if (targetRole === 'editor' || targetRole === 'viewer') {
      return { initiatorRole, targetRole };
    }
  }
  // Editors and viewers cannot remove anyone
  
  throw new Error('You do not have permission to remove this member.');
}

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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // --- Permission Check --- 
  const { targetRole } = await checkRemovePermissions(
    supabase,
    workspaceId,
    user.id, // Initiator
    userId   // Target
  );

  // --- Last Owner Check --- 
  // Re-check specifically if the target IS the last owner
  if (targetRole === 'owner') {
    const { data: owners, error: ownersError } = await supabase
      .from('workspace_members')
      .select('user_id') // Select only user_id, role already known
      .eq('workspace_id', workspaceId)
      .eq('role', 'owner');

    if (ownersError) {
      console.error('Error checking workspace owners:', ownersError);
      throw ownersError;
    }

    // If this is the only owner, prevent removal
    if (owners.length === 1 && owners[0].user_id === userId) {
      throw new Error('Cannot remove the last workspace owner. Transfer ownership first.');
    }
    // If target is an owner but NOT the last one, the permission check should already have failed unless initiator is Owner (which is disallowed by checkRemovePermissions)
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

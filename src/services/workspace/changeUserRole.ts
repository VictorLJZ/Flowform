import { createClient } from '@/lib/supabase/server';
import { WorkspaceRole } from '@/types/workspace-types';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Helper to check permissions
 * 
 * @param supabase - Supabase client
 * @param workspaceId - The ID of the workspace
 * @param initiatorUserId - The ID of the user initiating the role change
 * @param targetUserId - The ID of the user whose role is being changed
 * @returns The roles of the initiator and target users
 */
async function checkChangeRolePermissions(
  supabase: SupabaseClient,
  workspaceId: string,
  initiatorUserId: string,
  targetUserId: string
): Promise<{ initiatorRole: WorkspaceRole; targetRole: WorkspaceRole }> {
  // Define expected shape inline
  type MemberRoleInfo = { user_id: string; role: string };
  
  const { data: members, error } = await supabase
    .from('workspace_members')
    .select('user_id, role') // Fetches { user_id: string, role: string }
    .eq('workspace_id', workspaceId)
    .in('user_id', [initiatorUserId, targetUserId])
    .returns<MemberRoleInfo[]>(); // Use the inline type

  if (error) {
    console.error('Error fetching member roles for permission check:', error);
    throw new Error('Could not verify permissions.');
  }

  // Use the inline type for find callbacks
  const initiator = members?.find((m: MemberRoleInfo) => m.user_id === initiatorUserId); // Use inline type
  const target = members?.find((m: MemberRoleInfo) => m.user_id === targetUserId); // Use inline type

  if (!initiator || !target) {
    throw new Error('Initiator or target member not found in workspace.');
  }

  const initiatorRole = initiator.role as WorkspaceRole;
  const targetRole = target.role as WorkspaceRole;

  // Permission Logic
  if (initiatorRole === 'owner') {
    // Owner can manage anyone (specific owner transfer/demotion handled separately)
    return { initiatorRole, targetRole };
  } else if (initiatorRole === 'admin') {
    // Admin can only manage editors and viewers
    if (targetRole === 'editor' || targetRole === 'viewer') {
      return { initiatorRole, targetRole };
    }
  }
  // Editors and viewers cannot manage anyone
  
  throw new Error('You do not have permission to change this member\'s role.');
}

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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // --- Permission Check --- 
  const { initiatorRole, targetRole } = await checkChangeRolePermissions(
    supabase,
    workspaceId,
    user.id, // Initiator
    userId   // Target
  );
  
  // Prevent admin from promoting to admin/owner
  if (initiatorRole === 'admin' && (role === 'admin' || role === 'owner')) {
      throw new Error('Admins cannot promote users to Admin or Owner.');
  }

  // --- Last Owner Check --- 
  // Only check if demoting the *target* user who is currently an owner
  if (targetRole === 'owner' && role !== 'owner') {
    const { data: owners, error: ownersError } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', workspaceId)
      .eq('role', 'owner');

    if (ownersError) {
      console.error('Error checking workspace owners:', ownersError);
      throw ownersError;
    }

    // If the target is the only owner, prevent the role change
    if (owners.length === 1 && owners[0].user_id === userId) {
      // TODO: Handle ownership transfer initiation here later?
      throw new Error('Cannot change role of the last workspace owner. Transfer ownership first.');
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

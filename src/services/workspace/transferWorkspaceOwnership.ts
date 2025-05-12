import { createClient } from '@/lib/supabase/server';
import { DbWorkspaceRole } from '@/types/workspace';

/**
 * Transfers workspace ownership from the initiating user (current owner) to the target user.
 * The initiating owner is demoted to 'admin'.
 *
 * @param workspaceId - The ID of the workspace
 * @param targetUserId - The ID of the user to promote to owner
 * @returns Success status
 */
export async function transferWorkspaceOwnership(
  workspaceId: string,
  targetUserId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user: initiatorUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !initiatorUser) {
    console.error('Auth error during ownership transfer:', authError);
    throw new Error('User not authenticated for ownership transfer.');
  }

  const initiatorUserId = initiatorUser.id;

  // Fetch current roles of initiator and target
  const { data: members, error: fetchError } = await supabase
    .from('workspace_members')
    .select('user_id, role')
    .eq('workspace_id', workspaceId)
    .in('user_id', [initiatorUserId, targetUserId])
    .returns<{ user_id: string; role: string }[]>();

  if (fetchError) {
    console.error('Error fetching members for ownership transfer:', fetchError);
    throw new Error('Could not retrieve member roles for transfer.');
  }

  const initiator = members?.find(m => m.user_id === initiatorUserId);
  const target = members?.find(m => m.user_id === targetUserId);

  if (!initiator || !target) {
    throw new Error('Initiator or target member not found for transfer.');
  }

  // --- Verification --- 
  // 1. Ensure initiator is currently the owner
  if (initiator.role !== 'owner') {
    throw new Error('Only the current workspace owner can transfer ownership.');
  }
  // 2. Ensure target is not already the owner
  if (target.role === 'owner') {
    throw new Error('Target user is already the workspace owner.');
  }
  // 3. Ensure initiator is not transferring to themselves
  if (initiatorUserId === targetUserId) {
    throw new Error('Cannot transfer ownership to yourself.');
  }

  // --- Perform Transfer (Sequentially, consider transaction if available/needed) ---
  
  // 1. Promote target user to 'owner'
  const { error: promoteError } = await supabase
    .from('workspace_members')
    .update({ role: 'owner' as DbWorkspaceRole })
    .eq('workspace_id', workspaceId)
    .eq('user_id', targetUserId);

  if (promoteError) {
    console.error('Error promoting target user to owner:', promoteError);
    // Attempt to rollback or log inconsistency if needed
    throw new Error('Failed to promote target user during ownership transfer.');
  }

  // 2. Demote initiator user to 'admin'
  const { error: demoteError } = await supabase
    .from('workspace_members')
    .update({ role: 'admin' as DbWorkspaceRole })
    .eq('workspace_id', workspaceId)
    .eq('user_id', initiatorUserId);

  if (demoteError) {
    console.error('Error demoting initiator user to admin:', demoteError);
    // CRITICAL: Ownership transferred, but original owner not demoted.
    // Log this inconsistency. Manual intervention might be required.
    // Consider trying to revert the promotion if possible, although complex.
    throw new Error('Failed to demote original owner after transfer. Workspace state inconsistent.'); 
  }

  console.log(`Ownership of workspace ${workspaceId} transferred from ${initiatorUserId} to ${targetUserId}`);
  return true;
}

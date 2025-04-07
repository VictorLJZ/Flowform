import { createClient } from '@/lib/supabase/client';
import { WorkspaceMember } from '@/types/supabase-types';

/**
 * Accept a workspace invitation using the invitation token
 * 
 * @param token - The unique invitation token
 * @param userId - The ID of the user accepting the invitation
 * @returns The new workspace membership or null if invitation is invalid
 */
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<WorkspaceMember | null> {
  const supabase = createClient();
  
  // Find the invitation by token
  const { data: invitation, error: invitationError } = await supabase
    .from('workspace_invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single();
  
  if (invitationError || !invitation) {
    console.error('Error finding invitation:', invitationError);
    return null;
  }
  
  // Check if invitation has expired
  if (new Date(invitation.expires_at) < new Date()) {
    // Update the invitation status to expired
    await supabase
      .from('workspace_invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id);
      
    return null;
  }
  
  // Get the user's email to verify it matches the invitation
  const { data: user, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('Error fetching user:', userError);
    return null;
  }
  
  if (user.user.email !== invitation.email) {
    console.error('User email does not match invitation email');
    return null;
  }
  
  // Start a transaction by using a single connection
  // Add the user as a workspace member
  const { data: membership, error: membershipError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: invitation.workspace_id,
      user_id: userId,
      role: invitation.role,
    })
    .select()
    .single();
  
  if (membershipError) {
    console.error('Error creating workspace membership:', membershipError);
    return null;
  }
  
  // Update the invitation status to accepted
  await supabase
    .from('workspace_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitation.id);
  
  return membership;
}

import { createClient } from '@/lib/supabase/client';

/**
 * Decline a workspace invitation using the invitation token
 * 
 * @param token - The unique invitation token
 * @returns True if the invitation was successfully declined, false otherwise
 */
export async function declineInvitation(token: string): Promise<boolean> {
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
    return false;
  }
  
  // Check if invitation has expired
  if (new Date(invitation.expires_at) < new Date()) {
    // Update the invitation status to expired instead of declined
    await supabase
      .from('workspace_invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id);
      
    return false;
  }
  
  // Update the invitation status to declined
  const { error: updateError } = await supabase
    .from('workspace_invitations')
    .update({ status: 'declined' })
    .eq('id', invitation.id);
  
  if (updateError) {
    console.error('Error declining invitation:', updateError);
    return false;
  }
  
  return true;
}

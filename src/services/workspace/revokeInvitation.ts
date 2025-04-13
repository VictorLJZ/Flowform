import { createClient } from '@/lib/supabase/client';

/**
 * Revoke (cancel) a pending workspace invitation
 * 
 * @param invitationId - The ID of the invitation to revoke
 * @returns True if the invitation was successfully revoked, false otherwise
 */
export async function revokeInvitation(invitationId: string): Promise<boolean> {
  const supabase = createClient();
  
  // Check if the invitation exists and is still pending
  const { data: invitation, error: findError } = await supabase
    .from('workspace_invitations')
    .select('*')
    .eq('id', invitationId)
    .eq('status', 'pending')
    .single();
  
  if (findError || !invitation) {
    console.error('Error finding invitation:', findError);
    return false;
  }
  
  // Delete the invitation record
  const { error: deleteError } = await supabase
    .from('workspace_invitations')
    .delete()
    .eq('id', invitationId);
  
  if (deleteError) {
    console.error('Error revoking invitation:', deleteError);
    return false;
  }
  
  return true;
}

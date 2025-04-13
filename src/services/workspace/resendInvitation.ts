import { createClient } from '@/lib/supabase/client';
import { WorkspaceInvitation } from '@/types/supabase-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Resend a workspace invitation by generating a new token and resetting expiration
 * 
 * @param invitationId - The ID of the invitation to resend
 * @returns The updated invitation or null if not found
 */
export async function resendInvitation(invitationId: string): Promise<WorkspaceInvitation | null> {
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
    return null;
  }
  
  // Generate a new token and set new expiration date (7 days from now)
  const newToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // Update the invitation
  const { data: updatedInvitation, error: updateError } = await supabase
    .from('workspace_invitations')
    .update({
      token: newToken,
      expires_at: expiresAt.toISOString(),
      invited_at: new Date().toISOString(), // Reset the invitation date to now
    })
    .eq('id', invitationId)
    .select()
    .single();
  
  if (updateError) {
    console.error('Error resending invitation:', updateError);
    return null;
  }
  
  return updatedInvitation;
}

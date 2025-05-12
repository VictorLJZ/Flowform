import { createClient } from '@/lib/supabase/client';
import { DbWorkspaceMember, ApiWorkspace } from '@/types/workspace';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { getWorkspaceById } from './getWorkspaceById';

/**
 * Accept a workspace invitation using the invitation token
 * 
 * @param token - The unique invitation token
 * @param userId - The ID of the user accepting the invitation
 * @returns The new workspace membership or null if invitation is invalid
 * @throws Error with descriptive message if validation fails
 */
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<DbWorkspaceMember | null> {
  console.log('[acceptInvitation] Starting with token and userId:', { token, userId });
  const supabase = createClient();
  
  if (!token || typeof token !== 'string') {
    console.error('[acceptInvitation] Invalid token:', token);
    throw new Error('Invalid invitation token');
  }
  
  if (!userId || typeof userId !== 'string') {
    console.error('[acceptInvitation] Invalid userId:', userId);
    throw new Error('Invalid user ID');
  }
  
  try {
    // Find the invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();
    
    if (invitationError) {
      console.error('[acceptInvitation] Error finding invitation:', invitationError);
      throw new Error('This invitation could not be found or has already been used');
    }
    
    if (!invitation) {
      console.error('[acceptInvitation] No invitation found for token:', token);
      throw new Error('This invitation could not be found');
    }
    
    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Update the invitation status to expired
      await supabase
        .from('workspace_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);
        
      throw new Error('This invitation has expired');
    }
    
    // Get the user's email to verify it matches the invitation
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('[acceptInvitation] Error fetching user:', userError);
      throw new Error('Could not verify your identity. Please try logging in again.');
    }
    
    if (!user || !user.user) {
      console.error('[acceptInvitation] No user data available');
      throw new Error('You must be logged in to accept an invitation');
    }
    
    if (user.user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      console.error('[acceptInvitation] Email mismatch:', {
        userEmail: user.user.email,
        invitationEmail: invitation.email
      });
      throw new Error(`This invitation was sent to ${invitation.email}. You are logged in with a different email address.`);
    }
    
    // Use a stored procedure/RPC function to add the member
    // This bypasses RLS since the function runs with definer's privileges 
    const { data: result, error: membershipError } = await supabase
      .rpc('accept_workspace_invitation', {
        p_invitation_id: invitation.id,
        p_user_id: userId
      });
      
    // Extract the membership from the RPC result
    const membership = result as DbWorkspaceMember | null;
    
    if (membershipError) {
      console.error('[acceptInvitation] Error creating workspace membership:', membershipError);
      throw new Error('Failed to add you to the workspace. Please try again.');
    }
    
    // Update the invitation status to accepted
    const { error: updateError } = await supabase
      .from('workspace_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);
      
    if (updateError) {
      console.error('[acceptInvitation] Error updating invitation status:', updateError);
      // We still return the membership since the user was added to the workspace
      // The invitation status update is less critical
    }
    
    console.log('[acceptInvitation] Successfully accepted invitation');
    
    // Select the workspace in Zustand (following our new architecture)  
    if (membership && invitation.workspace_id) {
      try {
        // Get the workspace details
        const workspace: ApiWorkspace | null = await getWorkspaceById(invitation.workspace_id);
        
        if (workspace) {
          // Get the workspace store and select the workspace
          const workspaceStore = useWorkspaceStore.getState();
          workspaceStore.selectWorkspace(invitation.workspace_id);
          
          console.log('[acceptInvitation] Workspace selected:', invitation.workspace_id);
        } else {
          console.error('[acceptInvitation] Could not find workspace details for:', invitation.workspace_id);
        }
      } catch (syncError) {
        console.error('[acceptInvitation] Error selecting workspace:', syncError);
        // Don't throw here, we still want to return the membership even if sync fails
      }
    }
    
    return membership;
  } catch (error) {
    console.error('[acceptInvitation] Unexpected error:', error);
    if (error instanceof Error) {
      throw error; // Rethrow the already formatted errors
    }
    throw new Error('An unexpected error occurred while accepting the invitation');
  }
}

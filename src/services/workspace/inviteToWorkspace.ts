import { createClient } from '@/lib/supabase/client';
import { WorkspaceInvitation, Workspace } from '@/types/supabase-types';
import { WorkspaceRole } from '@/types/workspace-types';
import { v4 as uuidv4 } from 'uuid';
import { sendInvitationEmail } from '@/services/workspace/sendInvitationEmail';

/**
 * Send an invitation to join a workspace
 * 
 * @param workspaceId - ID of the workspace
 * @param email - Email address to invite
 * @param role - Role to assign to the user
 * @param invitedBy - ID of the user sending the invitation
 * @returns The created invitation record
 */
export async function inviteToWorkspace(
  workspaceId: string,
  email: string,
  role: WorkspaceRole,
  invitedBy: string
): Promise<WorkspaceInvitation> {
  console.log('[inviteToWorkspace] Starting with params:', { workspaceId, email, role, invitedBy });
  const supabase = createClient();
  
  try {
    // First check if the table exists
    console.log('[inviteToWorkspace] Checking if table exists');
    const { error: tableError } = await supabase
      .from('workspace_invitations')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('[inviteToWorkspace] Table check error:', JSON.stringify(tableError));
      console.error('[inviteToWorkspace] Table error code:', tableError.code);
      console.error('[inviteToWorkspace] Table error details:', tableError.details);
      console.error('[inviteToWorkspace] Table error hint:', tableError.hint);
      throw new Error(`Table check failed: ${tableError.message}`);
    }
    
    console.log('[inviteToWorkspace] Table exists, checking for existing invitation');
    
    // Check if an active invitation already exists
    const { data: existingInvitation, error: existingError } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('email', email)
      .eq('status', 'pending')
      .single();
    
    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 is the "not found" error
      console.error('[inviteToWorkspace] Error checking existing invitation:', JSON.stringify(existingError));
      throw existingError;
    }
    
    if (existingInvitation) {
      console.log('[inviteToWorkspace] Found existing invitation, returning it');
      return existingInvitation;
    }
    
    console.log('[inviteToWorkspace] No existing invitation found, creating new one');
    
    // Create a new invitation with a 7-day expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const token = uuidv4();
    console.log('[inviteToWorkspace] Generated token:', token);
    
    // Log the payload that will be inserted
    const payload = {
      workspace_id: workspaceId,
      email: email,
      role: role,
      invited_by: invitedBy,
      status: 'pending',
      invited_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      token: token
    };
    console.log('[inviteToWorkspace] Inserting invitation with payload:', JSON.stringify(payload));
    
    const { data, error } = await supabase
      .from('workspace_invitations')
      .insert(payload)
      .select()
      .single();
    
    if (error) {
      console.error('[inviteToWorkspace] Insert error:', JSON.stringify(error));
      console.error('[inviteToWorkspace] Error code:', error.code);
      console.error('[inviteToWorkspace] Error details:', error.details);
      console.error('[inviteToWorkspace] Error hint:', error.hint);
      throw error;
    }
    
    console.log('[inviteToWorkspace] Successfully created invitation with ID:', data.id);
    
    // Get workspace and inviter details to include in the email
    try {
      console.log('[inviteToWorkspace] Getting workspace and inviter details for email');
      
      // Fetch workspace details
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('name')
        .eq('id', workspaceId)
        .single();
        
      if (workspaceError) {
        console.error('[inviteToWorkspace] Error fetching workspace:', workspaceError);
        // Continue without workspace details
      }
      
      // Fetch inviter's profile
      const { data: inviter, error: inviterError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', invitedBy)
        .single();
        
      if (inviterError) {
        console.error('[inviteToWorkspace] Error fetching inviter profile:', inviterError);
        // Continue without inviter details
      }
      
      // Send invitation email
      console.log('[inviteToWorkspace] Sending invitation email');
      const emailResult = await sendInvitationEmail(data.id);
      
      console.log('[inviteToWorkspace] Email send result:', emailResult);
      
      // We don't fail the invitation if email sending fails
      // The invitation is still valid and can be accessed by the token
    } catch (emailError) {
      console.error('[inviteToWorkspace] Error sending invitation email:', emailError);
      // Continue without failing the invitation process
    }
    
    return data;
  } catch (error) {
    console.error('[inviteToWorkspace] Unexpected error:', error);
    if (error instanceof Error) {
      console.error('[inviteToWorkspace] Error message:', error.message);
      console.error('[inviteToWorkspace] Error stack:', error.stack);
    }
    throw error;
  }
}

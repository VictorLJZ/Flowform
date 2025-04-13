import { createClient } from '@/lib/supabase/client';
import { WorkspaceInvitation } from '@/types/supabase-types';
import { v4 as uuidv4 } from 'uuid';

type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

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
    const { data: tableCheck, error: tableError } = await supabase
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

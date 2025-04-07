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
  const supabase = createClient();
  
  // Check if an active invitation already exists
  const { data: existingInvitation } = await supabase
    .from('workspace_invitations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('email', email)
    .eq('status', 'pending')
    .single();
  
  if (existingInvitation) {
    // Return the existing invitation instead of creating a duplicate
    return existingInvitation;
  }
  
  // Create a new invitation with a 7-day expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  const token = uuidv4();
  
  const { data, error } = await supabase
    .from('workspace_invitations')
    .insert({
      workspace_id: workspaceId,
      email: email,
      role: role,
      invited_by: invitedBy,
      status: 'pending',
      invited_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      token: token
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating workspace invitation:', error);
    throw error;
  }
  
  return data;
}

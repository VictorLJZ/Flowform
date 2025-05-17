/**
 * Server-side workspace invitation operations
 * 
 * This file provides functions for managing workspace invitations.
 * All functions return database types with snake_case property names.
 */

import { createClient } from '@/lib/supabase/server';
import { DbWorkspaceInvitation, DbInvitationStatus } from '@/types/workspace';
import crypto from 'crypto';

/**
 * Generate a secure random token for invitations
 * 
 * @returns A random token string
 */
function generateInvitationToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Create a new workspace invitation
 * 
 * @param invitation - Invitation data (without id, invited_at and expires_at)
 * @param expirationDays - Days until invitation expires (default: 7)
 * @returns The newly created invitation
 */
export async function createInvitation(
  invitation: Omit<DbWorkspaceInvitation, 'id' | 'invited_at' | 'expires_at' | 'token'>,
  expirationDays: number = 7
): Promise<DbWorkspaceInvitation> {
  try {
    const supabase = await createClient();
    
    // Generate dates
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(now.getDate() + expirationDays);
    
    // Create complete invitation with token
    const completeInvitation = {
      ...invitation,
      invited_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      token: generateInvitationToken()
    };
    
    const { data, error } = await supabase
      .from('workspace_invitations')
      .insert([completeInvitation])
      .select()
      .single();
      
    if (error) throw error;
    
    return data as DbWorkspaceInvitation;
  } catch (error) {
    throw new Error(`Failed to create invitation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get an invitation by its token
 * 
 * @param token - The unique invitation token
 * @returns The invitation or null if not found
 */
export async function getInvitationByToken(token: string): Promise<DbWorkspaceInvitation | null> {
  if (!token) return null;
  
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('token', token)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - not found
        return null;
      }
      throw error;
    }
    
    return data as DbWorkspaceInvitation;
  } catch (error) {
    throw new Error(`Failed to get invitation by token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all invitations for a specific email address
 * 
 * @param email - Email address to search for
 * @returns Array of invitations for the email address
 */
export async function getInvitationsByEmail(email: string): Promise<DbWorkspaceInvitation[]> {
  if (!email) return [];
  
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('email', email.toLowerCase());
      
    if (error) throw error;
    
    return data as DbWorkspaceInvitation[];
  } catch (error) {
    throw new Error(`Failed to get invitations by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all invitations for a workspace
 * 
 * @param workspaceId - UUID of the workspace
 * @returns Array of invitations for the workspace
 */
export async function getInvitationsByWorkspace(workspaceId: string): Promise<DbWorkspaceInvitation[]> {
  if (!workspaceId) return [];
  
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('workspace_id', workspaceId);
      
    if (error) throw error;
    
    return data as DbWorkspaceInvitation[];
  } catch (error) {
    throw new Error(`Failed to get invitations by workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an invitation's status
 * 
 * @param invitationId - UUID of the invitation
 * @param status - New status (pending, accepted, declined, expired)
 * @returns The updated invitation
 */
export async function updateInvitationStatus(
  invitationId: string,
  status: DbInvitationStatus
): Promise<DbWorkspaceInvitation> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('workspace_invitations')
      .update({ status })
      .eq('id', invitationId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as DbWorkspaceInvitation;
  } catch (error) {
    throw new Error(`Failed to update invitation status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete an invitation
 * 
 * @param invitationId - UUID of the invitation to delete
 * @returns Object indicating success
 */
export async function deleteInvitation(invitationId: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('workspace_invitations')
      .delete()
      .eq('id', invitationId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete invitation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if an invitation is expired
 * 
 * @param invitation - The invitation to check
 * @returns true if expired, false otherwise
 */
export function isInvitationExpired(invitation: DbWorkspaceInvitation): boolean {
  const expiryDate = new Date(invitation.expires_at);
  const now = new Date();
  
  return expiryDate < now;
}

/**
 * Auto-expire any invitations that have passed their expiration date
 * 
 * @returns The count of auto-expired invitations
 */
export async function expireOldInvitations(): Promise<number> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();
    
    // Find and update all expired invitations
    const { data, error } = await supabase
      .from('workspace_invitations')
      .update({ status: 'expired' as DbInvitationStatus })
      .lt('expires_at', now)
      .eq('status', 'pending')
      .select('id');
      
    if (error) throw error;
    
    return data ? data.length : 0;
  } catch (error) {
    throw new Error(`Failed to expire old invitations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

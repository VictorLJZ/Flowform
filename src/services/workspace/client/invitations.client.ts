/**
 * Client-side workspace invitation operations
 * 
 * This file provides functions for interacting with workspace invitation API endpoints.
 * All functions return API types with camelCase property names.
 */

import { 
  ApiWorkspaceInvitation, 
  ApiWorkspaceInvitationInput,
  ApiErrorResponse 
} from '@/types/workspace';

// Create a logger for tracking the invitation process
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INVITE-CLIENT-INFO] ${new Date().toISOString()} | ${message}`, data ? data : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[INVITE-CLIENT-WARN] ${new Date().toISOString()} | ${message}`, data ? data : '');
  },
  error: (message: string, data?: any) => {
    console.error(`[INVITE-CLIENT-ERROR] ${new Date().toISOString()} | ${message}`, data ? data : '');
  }
};

/**
 * Create a new workspace invitation
 * 
 * @param workspaceId - UUID of the workspace
 * @param invitation - Invitation data
 * @returns The newly created invitation
 */
export async function createInvitation(
  workspaceId: string,
  invitation: ApiWorkspaceInvitationInput
): Promise<ApiWorkspaceInvitation> {
  logger.info('Creating new invitation', { workspaceId, email: invitation.email, role: invitation.role });
  
  try {
    const response = await fetch(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(invitation)
    });
    
    if (!response.ok) {
      const errorData = await response.json() as ApiErrorResponse;
      logger.error('Failed to create invitation', { status: response.status, error: errorData });
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    const createdInvitation = await response.json() as ApiWorkspaceInvitation;
    logger.info('Invitation created successfully', { invitationId: createdInvitation.id });
    
    return createdInvitation;
  } catch (error) {
    logger.error('Exception during invitation creation', { error });
    throw new Error(`Failed to create invitation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all invitations for a workspace
 * 
 * @param workspaceId - UUID of the workspace
 * @returns Array of invitations for the workspace
 */
export async function getWorkspaceInvitations(workspaceId: string): Promise<ApiWorkspaceInvitation[]> {
  try {
    const response = await fetch(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json() as ApiErrorResponse;
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    return await response.json() as ApiWorkspaceInvitation[];
  } catch (error) {
    throw new Error(`Failed to get workspace invitations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete an invitation
 * 
 * @param workspaceId - UUID of the workspace
 * @param invitationId - UUID of the invitation to delete
 * @returns Object indicating success
 */
export async function deleteInvitation(
  workspaceId: string,
  invitationId: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/workspaces/${workspaceId}/invitations/${invitationId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json() as ApiErrorResponse;
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete invitation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get an invitation by token (public endpoint)
 * 
 * @param token - The unique invitation token
 * @returns The invitation or null if not found
 */
export async function getInvitationByToken(token: string): Promise<ApiWorkspaceInvitation | null> {
  try {
    const response = await fetch(`/api/invitations/${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      // If not found, return null
      if (response.status === 404) {
        return null;
      }
      
      const errorData = await response.json() as ApiErrorResponse;
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    return await response.json() as ApiWorkspaceInvitation;
  } catch (error) {
    throw new Error(`Failed to get invitation by token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Accept an invitation
 * 
 * @param token - The unique invitation token
 * @returns Object containing the workspace ID and success status
 */
export async function acceptInvitation(token: string): Promise<{ 
  success: boolean; 
  workspaceId: string;
}> {
  try {
    const response = await fetch(`/api/invitations/${token}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json() as ApiErrorResponse;
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to accept invitation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decline an invitation
 * 
 * @param token - The unique invitation token
 * @returns Object indicating success
 */
export async function declineInvitation(token: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/invitations/${token}/decline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json() as ApiErrorResponse;
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to decline invitation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send an invitation email for a newly created invitation
 * 
 * @param invitationId - UUID of the invitation
 * @returns Object indicating success and any email details
 */
export async function sendInvitationEmail(
  invitationId: string
): Promise<{ success: boolean; emailData?: any }> {
  logger.info('Sending invitation email', { invitationId });
  
  try {
    const response = await fetch('/api/invitations/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ invitationId })
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      logger.error('Failed to send invitation email', { 
        status: response.status, 
        responseData 
      });
      throw new Error(responseData.error || `API returned status ${response.status}`);
    }
    
    logger.info('Invitation email sent successfully', { responseData });
    return { 
      success: true,
      emailData: responseData.emailData 
    };
  } catch (error) {
    logger.error('Exception during email sending', { error });
    throw new Error(`Failed to send invitation email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

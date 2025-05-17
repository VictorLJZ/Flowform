/**
 * Client-side workspace member operations
 * 
 * This file provides functions for interacting with workspace member API endpoints.
 * All functions return API types with camelCase property names.
 */

import { ApiWorkspaceMember, ApiWorkspaceMemberWithProfile, ApiWorkspaceRole, ApiErrorResponse } from '@/types/workspace';

/**
 * Get all members of a workspace with profile information
 * 
 * @param workspaceId - UUID of the workspace
 * @returns Array of workspace members with their profiles
 */
export async function getWorkspaceMembers(workspaceId: string): Promise<ApiWorkspaceMemberWithProfile[]> {
  try {
    const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json() as ApiErrorResponse;
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    return await response.json() as ApiWorkspaceMemberWithProfile[];
  } catch (error) {
    throw new Error(`Failed to get workspace members: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update a member's role in a workspace
 * 
 * @param workspaceId - UUID of the workspace
 * @param userId - UUID of the user
 * @param role - New role to assign
 * @returns The updated workspace member
 */
export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: ApiWorkspaceRole
): Promise<ApiWorkspaceMember> {
  try {
    const response = await fetch(`/api/workspaces/${workspaceId}/members/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role })
    });
    
    if (!response.ok) {
      const errorData = await response.json() as ApiErrorResponse;
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    return await response.json() as ApiWorkspaceMember;
  } catch (error) {
    throw new Error(`Failed to update member role: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Remove a member from a workspace
 * 
 * @param workspaceId - UUID of the workspace
 * @param userId - UUID of the user to remove
 * @returns Object indicating success
 */
export async function removeWorkspaceMember(
  workspaceId: string,
  userId: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/workspaces/${workspaceId}/members/${userId}`, {
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
    throw new Error(`Failed to remove workspace member: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Current user leaves a workspace
 * 
 * @param workspaceId - UUID of the workspace to leave
 * @returns Object indicating success and whether the workspace was deleted
 */
export async function leaveWorkspace(workspaceId: string): Promise<{ 
  success: boolean; 
  isWorkspaceDeleted?: boolean;
  message?: string;
}> {
  try {
    const response = await fetch(`/api/workspaces/${workspaceId}/leave`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json() as ApiErrorResponse;
      throw new Error(errorData.error || errorData.message || `API returned status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to leave workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

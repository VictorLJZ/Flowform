/**
 * Client-side workspace core operations
 * 
 * This file provides functions for interacting with workspace API endpoints.
 * All functions return API types with camelCase property names.
 */

import { ApiWorkspace, ApiWorkspaceInput, ApiWorkspaceUpdateInput, ApiErrorResponse } from '@/types/workspace';

// Base API configuration
const API_BASE = '/api/workspaces';

/**
 * Fetch all workspaces for the current authenticated user
 * 
 * @returns Array of workspaces
 */
export async function getUserWorkspaces(): Promise<ApiWorkspace[]> {
  try {
    const response = await fetch(API_BASE, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (!response.ok) {
      // Parse error response
      const errorData = await response.json() as ApiErrorResponse;
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    return await response.json() as ApiWorkspace[];
  } catch (error) {
    throw new Error(`Failed to get user workspaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch a specific workspace by ID
 * 
 * @param workspaceId - UUID of the workspace to retrieve
 * @returns The workspace or null if not found
 */
export async function getWorkspace(workspaceId: string): Promise<ApiWorkspace | null> {
  try {
    const response = await fetch(`${API_BASE}/${workspaceId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (!response.ok) {
      // If not found, return null
      if (response.status === 404) {
        return null;
      }
      
      // Parse other error responses
      const errorData = await response.json() as ApiErrorResponse;
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    return await response.json() as ApiWorkspace;
  } catch (error) {
    throw new Error(`Failed to get workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new workspace
 * 
 * @param input - Workspace creation input
 * @returns The newly created workspace
 */
export async function createWorkspace(input: ApiWorkspaceInput): Promise<ApiWorkspace> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input)
    });
    
    if (!response.ok) {
      const errorData = await response.json() as ApiErrorResponse;
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    return await response.json() as ApiWorkspace;
  } catch (error) {
    throw new Error(`Failed to create workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update a workspace
 * 
 * @param workspaceId - UUID of the workspace to update
 * @param data - Partial workspace data to update
 * @returns The updated workspace
 */
export async function updateWorkspace(
  workspaceId: string, 
  data: ApiWorkspaceUpdateInput
): Promise<ApiWorkspace> {
  try {
    const response = await fetch(`${API_BASE}/${workspaceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json() as ApiErrorResponse;
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    return await response.json() as ApiWorkspace;
  } catch (error) {
    throw new Error(`Failed to update workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a workspace
 * 
 * @param workspaceId - UUID of the workspace to delete
 * @returns Object indicating success
 */
export async function deleteWorkspace(workspaceId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/${workspaceId}`, {
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
    throw new Error(`Failed to delete workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

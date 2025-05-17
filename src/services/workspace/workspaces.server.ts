/**
 * Server-side workspace core operations
 * 
 * This file provides functions for basic CRUD operations on workspaces.
 * Functions return database types (DbWorkspace) with snake_case property names.
 */

import { createClient } from '@/lib/supabase/server';
import { DbWorkspace } from '@/types/workspace';

/**
 * Get a workspace by its ID
 * 
 * @param workspaceId - UUID of the workspace to retrieve
 * @returns The workspace or null if not found
 */
export async function getWorkspaceById(workspaceId: string): Promise<DbWorkspace | null> {
  if (!workspaceId) return null;
  
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();
    
    if (error) throw error;
    
    return data as DbWorkspace;
  } catch (error) {
    throw new Error(`Failed to get workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all workspaces where the user is a member
 * 
 * @param userId - UUID of the user
 * @returns Array of workspaces the user is a member of
 */
export async function getUserWorkspaces(userId: string): Promise<DbWorkspace[]> {
  if (!userId) return [];
  
  try {
    const supabase = await createClient();
    
    // First get the workspace IDs the user is a member of
    const { data: memberships, error: membershipError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId);
      
    if (membershipError) throw membershipError;
    
    // If no memberships, return empty array
    if (!memberships || memberships.length === 0) return [];
    
    // Extract workspace IDs
    const workspaceIds = memberships.map(m => m.workspace_id);
    
    // Get the workspaces
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('*')
      .in('id', workspaceIds);
      
    if (workspacesError) throw workspacesError;
    
    return workspaces as DbWorkspace[];
  } catch (error) {
    throw new Error(`Failed to get user workspaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new workspace
 * 
 * @param workspaceData - Data for the new workspace (without id, created_at, updated_at)
 * @returns The newly created workspace
 */
export async function createWorkspace(
  workspaceData: Omit<DbWorkspace, 'id' | 'created_at' | 'updated_at'>
): Promise<DbWorkspace> {
  try {
    const supabase = await createClient();
    
    // Set timestamps
    const now = new Date().toISOString();
    const workspaceWithTimestamps = {
      ...workspaceData,
      created_at: now,
      updated_at: now
    };
    
    const { data, error } = await supabase
      .from('workspaces')
      .insert([workspaceWithTimestamps])
      .select()
      .single();
      
    if (error) throw error;
    
    // Add the creator as an "owner" member
    await supabase
      .from('workspace_members')
      .insert([{
        workspace_id: data.id,
        user_id: workspaceData.created_by,
        role: 'owner',
        joined_at: now
      }]);
    
    return data as DbWorkspace;
  } catch (error) {
    throw new Error(`Failed to create workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update a workspace
 * 
 * @param workspaceId - ID of the workspace to update
 * @param data - Partial workspace data to update
 * @returns The updated workspace
 */
export async function updateWorkspace(
  workspaceId: string, 
  data: Partial<DbWorkspace>
): Promise<DbWorkspace> {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }
  
  try {
    const supabase = await createClient();
    
    // Always update the updated_at timestamp
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    const { data: updatedWorkspace, error } = await supabase
      .from('workspaces')
      .update(updateData)
      .eq('id', workspaceId)
      .select()
      .single();
      
    if (error) throw error;
    
    return updatedWorkspace as DbWorkspace;
  } catch (error) {
    throw new Error(`Failed to update workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a workspace and all related data
 * 
 * @param workspaceId - ID of the workspace to delete
 * @returns Object indicating success
 */
export async function deleteWorkspace(workspaceId: string): Promise<{ success: boolean }> {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }
  
  try {
    const supabase = await createClient();
    
    // Start a transaction to delete all related data
    // First delete all workspace members
    const { error: membersError } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId);
      
    if (membersError) throw membersError;
    
    // Delete all workspace invitations
    const { error: invitationsError } = await supabase
      .from('workspace_invitations')
      .delete()
      .eq('workspace_id', workspaceId);
      
    if (invitationsError) throw invitationsError;
    
    // Finally delete the workspace itself
    const { error: workspaceError } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);
      
    if (workspaceError) throw workspaceError;
    
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

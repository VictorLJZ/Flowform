/**
 * Server-side workspace permission operations
 * 
 * This file provides functions for checking and managing permissions within workspaces.
 */

import { createClient } from '@/lib/supabase/server';
import { DbWorkspaceRole } from '@/types/workspace';

/**
 * Role hierarchy for permission checks
 * Higher number means higher permission level
 */
const ROLE_WEIGHTS: Record<DbWorkspaceRole, number> = {
  'viewer': 1,
  'editor': 2,
  'admin': 3,
  'owner': 4
};

/**
 * Check if a user has access to a workspace with minimum required role
 * 
 * @param workspaceId - UUID of the workspace
 * @param userId - UUID of the user
 * @param requiredRole - Minimum role required (default: any role is sufficient)
 * @returns true if the user has access with sufficient role, false otherwise
 */
export async function checkWorkspaceAccess(
  workspaceId: string,
  userId: string,
  requiredRole?: DbWorkspaceRole
): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();
      
    if (error) {
      // Not found = no access
      return false;
    }
    
    // If no specific role is required, any membership is sufficient
    if (!requiredRole) {
      return true;
    }
    
    // Check if user's role has sufficient permissions
    const userRole = data.role as DbWorkspaceRole;
    return hasPermission(userRole, requiredRole);
  } catch (error) {
    // Log error but default to no access for security
    console.error(`Permission check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Get a user's role in a workspace
 * 
 * @param workspaceId - UUID of the workspace
 * @param userId - UUID of the user
 * @returns The user's role or null if not a member
 */
export async function getUserRoleInWorkspace(
  workspaceId: string,
  userId: string
): Promise<DbWorkspaceRole | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();
      
    if (error) {
      return null;
    }
    
    return data.role as DbWorkspaceRole;
  } catch (error) {
    throw new Error(`Failed to get user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if a user can manage members in a workspace
 * Requires admin or owner role
 * 
 * @param workspaceId - UUID of the workspace
 * @param userId - UUID of the user
 * @returns true if the user can manage members, false otherwise
 */
export async function canManageMembers(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  return checkWorkspaceAccess(workspaceId, userId, 'admin');
}

/**
 * Check if a user can delete a workspace
 * Requires owner role
 * 
 * @param workspaceId - UUID of the workspace
 * @param userId - UUID of the user
 * @returns true if the user can delete the workspace, false otherwise
 */
export async function canDeleteWorkspace(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  return checkWorkspaceAccess(workspaceId, userId, 'owner');
}

/**
 * Check if a role has sufficient permissions
 * 
 * @param userRole - The user's role
 * @param requiredRole - The minimum required role
 * @returns true if userRole has equal or higher permission than requiredRole
 */
export function hasPermission(
  userRole: DbWorkspaceRole,
  requiredRole: DbWorkspaceRole
): boolean {
  return ROLE_WEIGHTS[userRole] >= ROLE_WEIGHTS[requiredRole];
}

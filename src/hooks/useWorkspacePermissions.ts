/**
 * Workspace Permissions Hook
 * 
 * This hook provides permission checking capabilities for workspace operations.
 * It handles role-based permission checks and exports utility functions for
 * verifying user permissions across the application.
 */

import { useCallback } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { ApiWorkspaceRole } from '@/types/workspace/ApiWorkspace';
import { 
  hasPermission,
  canEditWorkspaceSettings as checkCanEditSettings,
  canManageMembers as checkCanManageMembers,
  canEditContent as checkCanEditContent,
  canDeleteWorkspace as checkCanDeleteWorkspace,
  canManageRole as checkCanManageRole,
  getAssignableRoles as getAssignableRolesList
} from '@/services/workspace/client/permissions.client';

export function useWorkspacePermissions() {
  // Get workspace data and functions
  const { getUserRole } = useWorkspace();
  
  /**
   * Check if the current user has at least the required permission level
   */
  const userHasPermission = useCallback(async (
    workspaceId: string, 
    requiredRole: ApiWorkspaceRole
  ): Promise<boolean> => {
    const userRole = await getUserRole(workspaceId);
    return hasPermission(userRole, requiredRole);
  }, [getUserRole]);
  
  /**
   * Check if the current user can edit workspace settings
   * Requires admin or owner role
   */
  const canEditWorkspaceSettings = useCallback(async (
    workspaceId: string
  ): Promise<boolean> => {
    const userRole = await getUserRole(workspaceId);
    return checkCanEditSettings(userRole);
  }, [getUserRole]);
  
  /**
   * Check if the current user can manage workspace members
   * Requires admin or owner role
   */
  const canManageMembers = useCallback(async (
    workspaceId: string
  ): Promise<boolean> => {
    const userRole = await getUserRole(workspaceId);
    return checkCanManageMembers(userRole);
  }, [getUserRole]);
  
  /**
   * Check if the current user can edit workspace content
   * Requires editor, admin, or owner role
   */
  const canEditContent = useCallback(async (
    workspaceId: string
  ): Promise<boolean> => {
    const userRole = await getUserRole(workspaceId);
    return checkCanEditContent(userRole);
  }, [getUserRole]);
  
  /**
   * Check if the current user can delete a workspace
   * Requires owner role
   */
  const canDeleteWorkspace = useCallback(async (
    workspaceId: string
  ): Promise<boolean> => {
    const userRole = await getUserRole(workspaceId);
    return checkCanDeleteWorkspace(userRole);
  }, [getUserRole]);
  
  /**
   * Check if the current user can manage (assign/modify) a specific role
   * Users can only manage roles lower than their own
   */
  const canManageRole = useCallback(async (
    workspaceId: string,
    targetRole: ApiWorkspaceRole
  ): Promise<boolean> => {
    const userRole = await getUserRole(workspaceId);
    return checkCanManageRole(userRole, targetRole);
  }, [getUserRole]);
  
  /**
   * Get a list of roles that the current user can assign to others
   */
  const getAssignableRoles = useCallback(async (
    workspaceId: string
  ): Promise<ApiWorkspaceRole[]> => {
    const userRole = await getUserRole(workspaceId);
    return getAssignableRolesList(userRole);
  }, [getUserRole]);
  
  /**
   * Check if the current user is the owner of the workspace
   */
  const isOwner = useCallback(async (
    workspaceId: string
  ): Promise<boolean> => {
    const userRole = await getUserRole(workspaceId);
    return userRole === 'owner';
  }, [getUserRole]);
  
  /**
   * Get the current user's role name in display format
   * (e.g., "Owner", "Admin", "Editor", "Viewer")
   */
  const getCurrentUserRoleDisplay = useCallback(async (
    workspaceId: string
  ): Promise<string> => {
    const userRole = await getUserRole(workspaceId);
    if (!userRole) return 'Not a member';
    
    // Capitalize the first letter
    return userRole.charAt(0).toUpperCase() + userRole.slice(1);
  }, [getUserRole]);
  
  return {
    // Core permission checks
    userHasPermission,
    canEditWorkspaceSettings,
    canManageMembers,
    canEditContent,
    canDeleteWorkspace,
    
    // Role management
    canManageRole,
    getAssignableRoles,
    isOwner,
    getCurrentUserRoleDisplay,
    
    // Direct access to current workspace role
    getUserRole
  };
}

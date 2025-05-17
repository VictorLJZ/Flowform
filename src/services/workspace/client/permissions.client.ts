/**
 * Client-side workspace permission utilities
 * 
 * This file provides functions for checking permissions and roles client-side.
 * These are helper functions that can be used in UI components.
 */

import { ApiWorkspaceRole } from '@/types/workspace';

/**
 * Role hierarchy for permission checks
 * Higher number means higher permission level
 */
export const ROLE_WEIGHTS: Record<ApiWorkspaceRole, number> = {
  'viewer': 1,
  'editor': 2,
  'admin': 3,
  'owner': 4
};

/**
 * Check if a role has sufficient permissions for a required role
 * 
 * @param userRole - The user's role
 * @param requiredRole - The minimum required role
 * @returns true if userRole has equal or higher permission than requiredRole
 */
export function hasPermission(
  userRole: ApiWorkspaceRole | null | undefined,
  requiredRole: ApiWorkspaceRole
): boolean {
  if (!userRole) return false;
  return ROLE_WEIGHTS[userRole] >= ROLE_WEIGHTS[requiredRole];
}

/**
 * Check if a user can edit workspace settings
 * Requires admin or owner role
 * 
 * @param role - The user's role
 * @returns true if the user can edit workspace settings
 */
export function canEditWorkspaceSettings(role: ApiWorkspaceRole | null | undefined): boolean {
  return hasPermission(role, 'admin');
}

/**
 * Check if a user can manage workspace members
 * Requires admin or owner role
 * 
 * @param role - The user's role
 * @returns true if the user can manage members
 */
export function canManageMembers(role: ApiWorkspaceRole | null | undefined): boolean {
  return hasPermission(role, 'admin');
}

/**
 * Check if a user can edit workspace content
 * Requires editor, admin, or owner role
 * 
 * @param role - The user's role
 * @returns true if the user can edit content
 */
export function canEditContent(role: ApiWorkspaceRole | null | undefined): boolean {
  return hasPermission(role, 'editor');
}

/**
 * Check if a user can delete a workspace
 * Requires owner role
 * 
 * @param role - The user's role
 * @returns true if the user can delete the workspace
 */
export function canDeleteWorkspace(role: ApiWorkspaceRole | null | undefined): boolean {
  return hasPermission(role, 'owner');
}

/**
 * Check if a user can manage specific roles
 * Users can only manage roles lower than their own
 * 
 * @param userRole - The user's role
 * @param targetRole - The role being managed
 * @returns true if the user can manage the target role
 */
export function canManageRole(
  userRole: ApiWorkspaceRole | null | undefined,
  targetRole: ApiWorkspaceRole
): boolean {
  if (!userRole) return false;
  // User can only manage roles that are lower than their own
  return ROLE_WEIGHTS[userRole] > ROLE_WEIGHTS[targetRole];
}

/**
 * Get a list of roles that a user can assign
 * Users can only assign roles lower than their own
 * 
 * @param userRole - The user's role
 * @returns Array of roles the user can assign to others
 */
export function getAssignableRoles(userRole: ApiWorkspaceRole | null | undefined): ApiWorkspaceRole[] {
  if (!userRole) return [];
  
  const allRoles: ApiWorkspaceRole[] = ['viewer', 'editor', 'admin', 'owner'];
  const userWeight = userRole ? ROLE_WEIGHTS[userRole] : 0;
  
  // Filter roles that are lower than user's role
  return allRoles.filter(role => ROLE_WEIGHTS[role] < userWeight);
}

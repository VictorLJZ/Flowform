/**
 * API to UI Workspace Transformations
 * 
 * This file provides utility functions for transforming workspace-related types
 * from API layer to UI layer:
 * - Prepares data for display in UI components
 * - Adds UI-specific properties and formatting
 */

import { 
  ApiWorkspaceRole, 
  UiWorkspaceMember,
  UiWorkspaceMemberWithProfile,
  ApiWorkspaceMember, 
  ApiWorkspaceMemberWithProfile,
} from '@/types/workspace';

/**
 * Transform an API workspace member to UI-specific format
 * 
 * @param member - API workspace member object
 * @returns UI-formatted minimal workspace member
 */
export function apiMemberToUiMember(
  member: ApiWorkspaceMember
): UiWorkspaceMember {
  return {
    workspaceId: member.workspaceId,
    userId: member.userId,
    role: member.role,
    joinedAt: member.joinedAt
  };
}

/**
 * Transform API workspace members to UI-specific format
 * 
 * @param members - Array of API workspace member objects
 * @returns Array of UI-formatted minimal workspace members
 */
export function apiMembersToUiMembers(
  members: ApiWorkspaceMember[]
): UiWorkspaceMember[] {
  return members.map(member => 
    apiMemberToUiMember(member)
  );
}

/**
 * Transform an API workspace member with profile to UI-specific format (new typing system)
 * 
 * @param member - API workspace member with profile information
 * @param isCurrentUser - Whether this member is the current user
 * @returns UI-formatted workspace member with profile
 */
export function apiToUiWorkspaceMemberWithProfile(
  member: ApiWorkspaceMemberWithProfile, 
  isCurrentUser: boolean = false
): UiWorkspaceMemberWithProfile {
  // Get initials for avatar fallback - handle undefined
  const initials = getInitials(member.profile.fullName);
  
  // Create a display name (use email if name is not available)
  const displayName = member.profile.fullName || member.profile.email || '(Unknown user)';
  
  return {
    ...member,
    isCurrentUser,
    profile: {
      ...member.profile,
      // Add UI-specific profile properties
      displayName,
      initials,
    },
    // Format the joined date for display
    formattedJoinedDate: formatWorkspaceDate(member.joinedAt)
  };
}

/**
 * Get a user-friendly role display name
 * 
 * @param role - Workspace role
 * @returns Capitalized, user-friendly role name
 */
export function getWorkspaceRoleDisplayName(role: ApiWorkspaceRole): string {
  // Capitalize first letter
  return role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Check if a role has specific permissions
 * Role hierarchy: owner > admin > editor > viewer
 * 
 * @param role - The role to check
 * @param requiredRole - The minimum required role
 * @returns Whether the role meets the required permission level
 */
export function hasWorkspacePermission(
  role: ApiWorkspaceRole,
  requiredRole: ApiWorkspaceRole
): boolean {
  const roleWeights: Record<ApiWorkspaceRole, number> = {
    'owner': 4,
    'admin': 3,
    'editor': 2,
    'viewer': 1
  };
  
  return roleWeights[role] >= roleWeights[requiredRole];
}

/**
 * Transform API workspace role to UI-specific format
 * 
 * @param role - API workspace role
 * @returns UI-formatted workspace role
 */
export function apiToUiWorkspaceRole(role: ApiWorkspaceRole): ApiWorkspaceRole {
  // Since UiWorkspaceRole is an alias for ApiWorkspaceRole, no transformation needed
  return role;
}

/**
 * Get initials from a name for avatar displays
 * 
 * @param name - Full name to extract initials from
 * @returns Up to 2 characters of initials
 */
function getInitials(name?: string): string {
  if (!name) return '?';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  // Get first letter of first and last parts
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format a date for UI display
 * 
 * @param isoDate - ISO date string from the API
 * @param options - Display options
 * @returns Formatted date string for display
 */
export function formatWorkspaceDate(
  isoDate: string,
  options: { relative?: boolean; includeTime?: boolean } = {}
): string {
  const date = new Date(isoDate);
  
  if (options.relative) {
    // Simple relative time for demo, use a library like date-fns in real code
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }
  
  // Standard date display
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(options.includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
  
  return formatter.format(date);
}

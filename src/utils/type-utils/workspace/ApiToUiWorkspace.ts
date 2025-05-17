/**
 * API to UI Workspace Transformations
 * 
 * This file provides utility functions for transforming workspace-related types
 * from API layer to UI layer:
 * - Prepares data for display in UI components
 * - Adds UI-specific properties and formatting
 */

import { 
  ApiWorkspace,
  ApiWorkspaceRole, 
  ApiWorkspaceMember,
  ApiWorkspaceInvitation,
  ApiWorkspaceMemberWithProfile,
} from '@/types/workspace';

import {
  UiWorkspace,
  UiWorkspaceMember,
  UiWorkspaceMemberWithProfile,
  UiWorkspaceInvitation
} from '@/types/workspace';

/**
 * Transform an API workspace to UI-specific format
 * 
 * @param workspace - API workspace object
 * @param isSelected - Whether this workspace is currently selected
 * @param memberCount - Optional count of workspace members
 * @returns UI-formatted workspace
 */
export function apiToUiWorkspace(
  workspace: ApiWorkspace,
  isSelected: boolean = false,
  memberCount?: number
): UiWorkspace {
  return {
    ...workspace,
    isSelected,
    memberCount,
    initials: getInitials(workspace.name),
    formattedCreatedAt: formatDate(workspace.createdAt)
  };
}

/**
 * Transform an array of API workspaces to UI format
 * 
 * @param workspaces - Array of API workspace objects
 * @param selectedId - ID of the currently selected workspace
 * @returns Array of UI-formatted workspaces
 */
export function apiToUiWorkspaces(
  workspaces: ApiWorkspace[],
  selectedId?: string | null
): UiWorkspace[] {
  return workspaces.map(workspace => apiToUiWorkspace(
    workspace,
    workspace.id === selectedId
  ));
}

/**
 * Transform an API workspace member to UI-specific format
 * 
 * @param member - API workspace member object
 * @returns UI-formatted workspace member
 */
export function apiToUiWorkspaceMember(
  member: ApiWorkspaceMember
): UiWorkspaceMember {
  return {
    ...member,
    formattedJoinedDate: formatDate(member.joinedAt),
    displayRoleName: capitalizeRole(member.role)
  };
}

/**
 * Transform an API workspace member with profile to UI-specific format
 * 
 * @param member - API workspace member with profile information
 * @param currentUserId - ID of the current user for comparison
 * @returns UI-formatted workspace member with profile
 */
export function apiToUiWorkspaceMemberWithProfile(
  member: ApiWorkspaceMemberWithProfile, 
  currentUserId?: string
): UiWorkspaceMemberWithProfile {
  const isCurrentUser = !!currentUserId && member.userId === currentUserId;
  
  // Create a display name (use email if name is not available)
  const displayName = member.profile.fullName || member.profile.email;
  const initials = getInitials(member.profile.fullName);
  
  return {
    ...member,
    isCurrentUser,
    formattedJoinedDate: formatDate(member.joinedAt),
    displayRoleName: capitalizeRole(member.role),
    profile: {
      ...member.profile,
      displayName,
      initials
    }
  };
}

/**
 * Transform an API workspace invitation to UI format
 * 
 * @param invitation - API workspace invitation 
 * @returns UI-formatted workspace invitation
 */
export function apiToUiWorkspaceInvitation(
  invitation: ApiWorkspaceInvitation
): UiWorkspaceInvitation {
  const now = new Date();
  const expiryDate = new Date(invitation.expiresAt);
  const isExpiringSoon = expiryDate.getTime() - now.getTime() < 86400000; // 24 hours
  
  return {
    ...invitation,
    formattedInvitedDate: formatDate(invitation.invitedAt),
    formattedExpiresDate: formatDate(invitation.expiresAt),
    displayRoleName: capitalizeRole(invitation.role),
    isExpiringSoon,
    statusDisplay: getStatusDisplay(invitation.status)
  };
}

// Utility functions

/**
 * Get initials from a name for avatar displays
 * 
 * @param name - Full name to extract initials from
 * @returns Up to 2 characters of initials
 */
export function getInitials(name?: string): string {
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
 * @param isoDate - ISO date string
 * @param includeTime - Whether to include time
 * @returns Formatted date string
 */
export function formatDate(isoDate: string, includeTime: boolean = false): string {
  const date = new Date(isoDate);
  
  // Standard date display
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
  
  return formatter.format(date);
}

/**
 * Capitalize a role name for display
 * 
 * @param role - Workspace role
 * @returns Capitalized role name
 */
export function capitalizeRole(role: ApiWorkspaceRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Get user-friendly status display text
 * 
 * @param status - Invitation status
 * @returns User-friendly status text
 */
export function getStatusDisplay(status: string): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'accepted': return 'Accepted';
    case 'declined': return 'Declined';
    case 'expired': return 'Expired';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
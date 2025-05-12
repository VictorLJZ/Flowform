/**
 * UI-level workspace types
 * 
 * These types represent workspace data as it's used in UI components.
 * They use camelCase naming and may include additional UI-specific properties.
 * 
 * Use these types for:
 * - React component props
 * - UI state management
 * - Display-specific data transformations
 * - Local UI-specific calculations and formatting
 */

import {
  ApiWorkspaceInvitation,
  ApiWorkspaceMember,
  ApiWorkspaceRole
} from './ApiWorkspace';

/**
 * UI profile type with potentially enhanced display properties
 */
export interface UiProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  displayName?: string; // Computed display name (fallback to email if name is null)
  initials?: string;   // Computed initials for avatar fallback
  createdAt: string;
  updatedAt: string;
}

/**
 * UI workspace member with profile information and enhanced display properties
 */
export interface UiWorkspaceMemberWithProfile {
  workspaceId: string;
  userId: string;
  role: ApiWorkspaceRole;
  joinedAt: string;
  formattedJoinedDate?: string; // Human-readable date
  profile: {
    fullName?: string;
    avatarUrl?: string;
    email?: string;
    displayName?: string; // Computed for display
    initials?: string;    // For avatar fallback
  };
  isCurrentUser?: boolean; // Flag if this is the current logged-in user
}

/**
 * Workspace member with UI-specific properties and camelCase naming
 */
export interface UiWorkspaceMember extends Omit<ApiWorkspaceMember, 'role'> {
  role: ApiWorkspaceRole // Retain original role type
}

export interface UiWorkspaceInvitation extends Omit<ApiWorkspaceInvitation, 'role'> {
  role: ApiWorkspaceRole // Retain original role type
}

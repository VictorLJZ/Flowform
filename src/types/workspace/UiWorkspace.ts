/**
 * UI-level workspace types
 * 
 * These types represent workspace data as it's used in UI components.
 * They extend API types with additional UI-specific properties.
 * 
 * Use these types for:
 * - React component props
 * - UI state management
 * - Display-specific data transformations
 */

import { 
  ApiWorkspace,
  ApiWorkspaceMember, 
  ApiWorkspaceInvitation,
  ApiWorkspaceMemberWithProfile
} from './ApiWorkspace';

/**
 * UI-specific workspace type with display properties
 */
export interface UiWorkspace extends ApiWorkspace {
  // UI-specific properties
  isSelected?: boolean;
  initials?: string; // Generated from name
  formattedCreatedAt?: string; // Formatted date string
  memberCount?: number; // Count of workspace members
}

/**
 * UI-specific workspace member type with display properties
 */
export interface UiWorkspaceMember extends ApiWorkspaceMember {
  // UI-specific properties
  formattedJoinedDate?: string; // Formatted date
  displayRoleName?: string; // Capitalized role name
}

/**
 * UI-specific workspace member with profile and display properties
 */
export interface UiWorkspaceMemberWithProfile extends ApiWorkspaceMemberWithProfile {
  // UI-specific properties
  formattedJoinedDate?: string; // Formatted date
  displayRoleName?: string; // User-friendly role name
  isCurrentUser?: boolean; // Whether this member is the current user

  // Enhanced profile properties
  profile: ApiWorkspaceMemberWithProfile['profile'] & {
    displayName?: string; // Full name or email fallback
    initials?: string; // For avatar fallback
  };
}

/**
 * UI-specific workspace invitation with display properties
 */
export interface UiWorkspaceInvitation extends ApiWorkspaceInvitation {
  // UI-specific properties
  formattedInvitedDate?: string; // Formatted date
  formattedExpiresDate?: string; // Formatted date
  displayRoleName?: string; // User-friendly role name
  isExpiringSoon?: boolean; // Flag if expiring within 24 hours
  statusDisplay?: string; // User-friendly status display
}
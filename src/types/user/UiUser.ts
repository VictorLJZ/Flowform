/**
 * UI-level user types
 * 
 * These types represent user data as it's used in UI components.
 * They use camelCase naming and include UI-specific properties.
 */

import { ApiAuthUser, ApiUserMetadata } from './ApiUser';

/**
 * UI-formatted profile with display enhancements
 */
export interface UiProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  displayName: string; // Computed display name (fallback to email if name is undefined)
  initials: string;    // Computed initials for avatar fallback
  createdAt: string;
  updatedAt: string;
}

/**
 * UI-formatted auth user with display enhancements
 */
export interface UiAuthUser extends ApiAuthUser {
  displayName: string; // Computed display name from userMetadata or email
  initials: string;    // Computed initials for avatar display
  avatarUrl?: string;  // Computed from userMetadata.avatarUrl or userMetadata.picture
}

/**
 * UI form input for profile updates
 */
export interface UiProfileUpdateInput {
  fullName?: string;
  avatarUrl?: string;
}

/**
 * UI-level user types
 * 
 * These types represent user data as it's used in UI components.
 * They use camelCase naming and include UI-specific properties.
 */

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
 * UI form input for profile updates
 */
export interface UiProfileUpdateInput {
  fullName?: string;
  avatarUrl?: string;
}

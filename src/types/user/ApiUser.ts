/**
 * API-level user types
 * 
 * These types represent user data as it's used in API requests and responses.
 * They use camelCase naming and may include additional API-specific properties.
 */

/**
 * API-formatted profile information
 */
export interface ApiProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input type for updating a user profile
 */
export interface ApiProfileUpdateInput {
  fullName?: string;
  avatarUrl?: string;
}

/**
 * API-level user types
 * 
 * These types represent user data as it's used in API requests and responses.
 * They use camelCase naming and may include additional API-specific properties.
 */

/**
 * User metadata from authentication providers
 */
export interface ApiUserMetadata {
  name?: string;
  fullName?: string;
  avatarUrl?: string;
  picture?: string;
  email?: string;
  emailVerified?: boolean;
  provider?: string;
  sub?: string; // Subject identifier
  // Allow for other provider-specific metadata
  [key: string]: unknown;
}

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
 * API-formatted auth user information
 * Extends ApiProfile with auth-specific metadata
 */
export interface ApiAuthUser {
  id: string;
  email: string;
  userMetadata?: ApiUserMetadata;
  appMetadata?: Record<string, unknown>;
}

/**
 * Input type for updating a user profile
 */
export interface ApiProfileUpdateInput {
  fullName?: string;
  avatarUrl?: string;
}

// Authentication Types

/**
 * User metadata from authentication providers
 * Including common fields from various providers
 */
export interface UserMetadata {
  name?: string;
  full_name?: string;
  avatar_url?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  provider?: string;
  sub?: string; // Subject identifier
  // Allow for other provider-specific metadata with type safety
  [key: string]: unknown;
}

/**
 * Complete user information
 */
export interface User {
  id: string;
  email: string;
  user_metadata?: UserMetadata;
  app_metadata?: Record<string, unknown>;
}

/**
 * Auth state
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

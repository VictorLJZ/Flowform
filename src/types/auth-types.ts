// Authentication Types

/**
 * User metadata from authentication providers
 */
export interface UserMetadata {
  name?: string;
  full_name?: string;
  avatar_url?: string;
  picture?: string;
  [key: string]: any; // Allow for other provider-specific metadata
}

/**
 * Complete user information
 */
export interface User {
  id: string;
  email: string;
  user_metadata?: UserMetadata;
  app_metadata?: Record<string, any>;
}

/**
 * Auth state
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

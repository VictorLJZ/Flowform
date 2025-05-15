/**
 * Index file for user-related types
 * 
 * This file exports all user-related types from the user directory.
 * It serves as the central entry point for importing user types.
 */

// Database types
export * from './DbUser';

// API types
export * from './ApiUser';

// UI types
export * from './UiUser';

// Import for internal use
import { ApiAuthUser } from './ApiUser';

// Type re-exports for backward compatibility
// These will help during the transition from auth-types.ts
export type { ApiAuthUser as User } from './ApiUser';
export type { ApiUserMetadata as UserMetadata } from './ApiUser';

export interface AuthState {
  user: ApiAuthUser | null;
  isLoading: boolean;
  error: string | null;
}

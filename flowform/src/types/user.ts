/**
 * User-related type definitions
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserSession {
  user: User;
  isLoggedIn: boolean;
  accessToken: string;
  expiresAt: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

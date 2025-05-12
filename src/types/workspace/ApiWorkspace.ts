/**
 * API-level workspace types
 * 
 * These types represent the shape of workspace data as it flows through API requests and responses.
 * They use camelCase naming following JavaScript/TypeScript conventions.
 * 
 * Use these types for:
 * - API route handlers
 * - Request/response payloads
 * - Data transformation layer between database and UI
 */

import { DbWorkspaceRole } from './DbWorkspace';

/**
 * API role type - reexporting from DB layer for consistency
 */
export type ApiWorkspaceRole = DbWorkspaceRole;

/**
 * Workspace object in API format with camelCase properties
 */
export interface ApiWorkspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  logoUrl?: string;
  settings?: Record<string, unknown>;
}

/**
 * Workspace member in API format with camelCase properties
 */
export interface ApiWorkspaceMember {
  workspaceId: string;
  userId: string;
  role: ApiWorkspaceRole;
  joinedAt: string;
}

/**
 * Workspace invitation in API format with camelCase properties
 */
export interface ApiWorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: ApiWorkspaceRole;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  token: string;
}

/**
 * Input type for creating a new workspace (API layer with camelCase)
 */
export interface ApiWorkspaceInput {
  name: string;
  description?: string;
  createdBy: string;
  logoUrl?: string;
  settings?: Record<string, unknown>;
}

/**
 * Input type for updating an existing workspace (API layer with camelCase)
 */
export interface ApiWorkspaceUpdateInput {
  name?: string;
  description?: string;
  logoUrl?: string;
  settings?: Record<string, unknown>;
}

/**
 * API profile type with camelCase properties
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
 * API workspace member with profile information
 */
export interface ApiWorkspaceMemberWithProfile extends ApiWorkspaceMember {
  profile: {
    fullName?: string;
    avatarUrl?: string;
    email?: string;
  };
}

/**
 * API error response interface for client-side implementations
 */
export interface ApiErrorResponse {
  error?: string;
  message?: string;
  status?: number;
}

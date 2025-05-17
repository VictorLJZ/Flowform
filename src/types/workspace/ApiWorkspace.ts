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

import { DbWorkspaceRole, DbInvitationStatus } from './DbWorkspace';

/**
 * API role type - reexporting from DB layer
 */
export type ApiWorkspaceRole = DbWorkspaceRole;

/**
 * API invitation status type - reexporting from DB layer
 */
export type ApiInvitationStatus = DbInvitationStatus;

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
  status: ApiInvitationStatus;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  token: string;
}

/**
 * Input type for creating a new workspace
 */
export interface ApiWorkspaceInput {
  name: string;
  description?: string;
  createdBy: string;
  logoUrl?: string;
  settings?: Record<string, unknown>;
}

/**
 * Input type for updating an existing workspace
 */
export interface ApiWorkspaceUpdateInput {
  name?: string;
  description?: string;
  logoUrl?: string;
  settings?: Record<string, unknown>;
}

/**
 * API workspace member with profile information
 */
export interface ApiWorkspaceMemberWithProfile extends ApiWorkspaceMember {
  profile: {
    fullName?: string;
    avatarUrl?: string;
    email: string;
  };
}

/**
 * Input type for creating a new invitation
 */
export interface ApiWorkspaceInvitationInput {
  email: string;
  role: ApiWorkspaceRole;
  message?: string;
}

/**
 * Input type for updating a member role
 */
export interface ApiWorkspaceMemberUpdate {
  role: ApiWorkspaceRole;
}

/**
 * API error response interface
 */
export interface ApiErrorResponse {
  error: string;
  status: number;
  message?: string;
}
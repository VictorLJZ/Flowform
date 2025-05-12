/**
 * API to Database Workspace Transformations
 * 
 * This file provides utility functions for transforming workspace-related types
 * from API layer to Database (Db) layer:
 * - Converts camelCase API fields to snake_case DB fields
 * - Prepares data for database operations
 */

import { 
  DbWorkspace, 
  DbWorkspaceMember, 
  DbWorkspaceRole,
  DbWorkspaceInvitation,
  DbInvitationStatus
} from '@/types/workspace';

import {
  ApiWorkspaceInput,
  ApiWorkspaceUpdateInput,
  ApiWorkspaceRole,
  ApiWorkspaceMember
} from '@/types/workspace';

/**
 * Transform API workspace input to DB format for insertion
 * 
 * @param input - Workspace creation input
 * @returns Database-ready workspace object (without id and updated_at)
 */
export function workspaceInputToDb(input: ApiWorkspaceInput): Omit<DbWorkspace, 'id' | 'updated_at'> {
  return {
    name: input.name,
    // Convert undefined to null for DB layer consistency
    description: input.description === undefined ? null : input.description,
    created_by: input.createdBy,
    created_at: new Date().toISOString(),
    logo_url: input.logoUrl === undefined ? null : input.logoUrl,
    settings: input.settings === undefined ? null : input.settings
  };
}

/**
 * Transform API workspace update input to DB format for updates
 * 
 * @param input - Workspace update input
 * @returns Partial database workspace object for update operations
 */
export function workspaceUpdateInputToDb(input: ApiWorkspaceUpdateInput): Partial<DbWorkspace> {
  const result: Partial<DbWorkspace> = {};
  
  if (input.name !== undefined) result.name = input.name;
  if (input.description !== undefined) result.description = input.description;
  if (input.logoUrl !== undefined) result.logo_url = input.logoUrl;
  if (input.settings !== undefined) result.settings = input.settings;
  
  // Always update the updated_at timestamp
  result.updated_at = new Date().toISOString();
  
  return result;
}

/**
 * Transform API workspace member to DB format
 * 
 * @param apiMember - API workspace member object
 * @returns Database-formatted workspace member
 */
export function apiToDbWorkspaceMember(apiMember: ApiWorkspaceMember): DbWorkspaceMember {
  return {
    workspace_id: apiMember.workspaceId,
    user_id: apiMember.userId,
    role: apiToDbWorkspaceRole(apiMember.role),
    joined_at: apiMember.joinedAt
  };
}

/**
 * Create a new workspace member record in DB format
 * 
 * @param workspaceId - Workspace ID
 * @param userId - User ID
 * @param role - Workspace role
 * @returns Database-formatted workspace member
 */
export function createDbWorkspaceMember(
  workspaceId: string, 
  userId: string, 
  role: ApiWorkspaceRole
): DbWorkspaceMember {
  return {
    workspace_id: workspaceId,
    user_id: userId,
    role: apiToDbWorkspaceRole(role),
    joined_at: new Date().toISOString()
  };
}

/**
 * Create a new workspace invitation record in DB format
 * 
 * @param workspaceId - Workspace ID
 * @param email - Email to invite
 * @param role - Role to assign
 * @param invitedBy - User ID of the inviter
 * @param token - Unique invitation token
 * @param expiresInDays - Days until invitation expires (default: 7)
 * @returns Database-formatted workspace invitation
 */
export function createDbWorkspaceInvitation(
  workspaceId: string,
  email: string,
  role: ApiWorkspaceRole,
  invitedBy: string,
  token: string,
  expiresInDays: number = 7
): Omit<DbWorkspaceInvitation, 'id'> {
  const now = new Date();
  const expirationDate = new Date(now);
  expirationDate.setDate(now.getDate() + expiresInDays);
  
  return {
    workspace_id: workspaceId,
    email: email,
    role: apiToDbWorkspaceRole(role),
    status: 'pending' as DbInvitationStatus,
    invited_by: invitedBy,
    invited_at: now.toISOString(),
    expires_at: expirationDate.toISOString(),
    token: token
  };
}

/**
 * Transform API workspace role to DB format
 * 
 * @param role - API workspace role
 * @returns Database-formatted workspace role
 */
export function apiToDbWorkspaceRole(role: ApiWorkspaceRole): DbWorkspaceRole {
  // Assuming ApiWorkspaceRole and DbWorkspaceRole are compatible or identical
  return role as DbWorkspaceRole;
}

/**
 * Transform DB workspace role to API format
 * 
 * @param role - DB workspace role
 * @returns API-formatted workspace role
 */
export function dbToApiWorkspaceRole(role: DbWorkspaceRole): ApiWorkspaceRole {
  // Assuming DbWorkspaceRole and ApiWorkspaceRole are compatible or identical
  return role as ApiWorkspaceRole;
}

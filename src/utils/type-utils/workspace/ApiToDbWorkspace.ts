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
  DbWorkspaceInvitation,
  DbInvitationStatus
} from '@/types/workspace/DbWorkspace';

import {
  ApiWorkspace,
  ApiWorkspaceInput,
  ApiWorkspaceUpdateInput,
  ApiWorkspaceRole,
  ApiWorkspaceMember,
  ApiWorkspaceInvitation,
  ApiWorkspaceInvitationInput
} from '@/types/workspace/ApiWorkspace';

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
    role: apiMember.role,
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
    role: role,
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
    role: role,
    status: 'pending' as DbInvitationStatus,
    invited_by: invitedBy,
    invited_at: now.toISOString(),
    expires_at: expirationDate.toISOString(),
    token: token
  };
}

/**
 * Transform an API workspace to a DB workspace format
 * 
 * @param workspace - API workspace object
 * @returns Database-formatted workspace
 */
export function apiToDbWorkspace(workspace: ApiWorkspace): DbWorkspace {
  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description === undefined ? null : workspace.description,
    created_at: workspace.createdAt,
    created_by: workspace.createdBy,
    updated_at: workspace.updatedAt || new Date().toISOString(),
    logo_url: workspace.logoUrl === undefined ? null : workspace.logoUrl,
    settings: workspace.settings === undefined ? null : workspace.settings
  };
}

/**
 * Transform an API workspace invitation to a DB workspace invitation format
 * 
 * @param invitation - API workspace invitation object
 * @returns Database-formatted workspace invitation
 */
export function apiToDbWorkspaceInvitation(invitation: ApiWorkspaceInvitation): DbWorkspaceInvitation {
  return {
    id: invitation.id,
    workspace_id: invitation.workspaceId,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status as DbInvitationStatus,
    invited_by: invitation.invitedBy,
    invited_at: invitation.invitedAt,
    expires_at: invitation.expiresAt,
    token: invitation.token
  };
}

/**
 * Transform an API workspace invitation input to a DB workspace invitation format
 * for creating a new invitation. This prepares the data for the createInvitation service.
 * 
 * @param input - API workspace invitation input with workspaceId and invitedBy
 * @returns Database-formatted workspace invitation (without id, invited_at, expires_at, and token)
 */
export function apiToDbWorkspaceInvitationInput(
  input: ApiWorkspaceInvitationInput & { workspaceId: string; invitedBy: string }
): Omit<DbWorkspaceInvitation, 'id' | 'invited_at' | 'expires_at' | 'token'> {
  return {
    workspace_id: input.workspaceId,
    email: input.email,
    role: input.role,
    status: 'pending' as DbInvitationStatus,
    invited_by: input.invitedBy
    // Note: message field is in the input but not stored in the DB schema
  };
}
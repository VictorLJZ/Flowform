/**
 * Database to API Workspace Transformations
 * 
 * This file provides utility functions for transforming workspace-related types
 * from Database (Db) layer to API layer:
 * - Converts snake_case DB fields to camelCase API fields
 * - Maintains the same semantic structure
 */

import { 
  DbWorkspace, 
  DbWorkspaceMember, 
  DbWorkspaceInvitation,
  DbWorkspaceMemberWithProfile,
  DbProfile
} from '@/types/workspace';

import { 
  ApiWorkspace,
  ApiWorkspaceMember,
  ApiWorkspaceInvitation,
  ApiWorkspaceMemberWithProfile
} from '@/types/workspace';

/**
 * Transform a DB workspace object to API format
 * 
 * @param dbWorkspace - Database workspace object
 * @returns API-formatted workspace object
 */
export function dbToApiWorkspace(dbWorkspace: DbWorkspace): ApiWorkspace {
  return {
    id: dbWorkspace.id,
    name: dbWorkspace.name,
    // Convert null to undefined for optional fields
    description: dbWorkspace.description === null ? undefined : dbWorkspace.description,
    createdAt: dbWorkspace.created_at,
    createdBy: dbWorkspace.created_by,
    updatedAt: dbWorkspace.updated_at,
    logoUrl: dbWorkspace.logo_url === null ? undefined : dbWorkspace.logo_url,
    settings: dbWorkspace.settings === null ? undefined : dbWorkspace.settings
  };
}

/**
 * Transform an array of DB workspaces to API format
 * 
 * @param dbWorkspaces - Array of database workspace objects
 * @returns Array of API-formatted workspace objects
 */
export function dbToApiWorkspaces(dbWorkspaces: DbWorkspace[]): ApiWorkspace[] {
  return dbWorkspaces.map(dbToApiWorkspace);
}

/**
 * Transform a DB workspace member to API format
 * 
 * @param dbMember - Database workspace member object
 * @returns API-formatted workspace member
 */
export function dbToApiWorkspaceMember(dbMember: DbWorkspaceMember): ApiWorkspaceMember {
  return {
    workspaceId: dbMember.workspace_id,
    userId: dbMember.user_id,
    role: dbMember.role,
    joinedAt: dbMember.joined_at
  };
}

/**
 * Transform DB workspace members to API format
 * 
 * @param dbMembers - Array of database workspace member objects
 * @returns Array of API-formatted workspace members
 */
export function dbToApiWorkspaceMembers(dbMembers: DbWorkspaceMember[]): ApiWorkspaceMember[] {
  return dbMembers.map(dbToApiWorkspaceMember);
}

/**
 * Transform a DB workspace invitation to API format
 * 
 * @param dbInvitation - Database workspace invitation object
 * @returns API-formatted workspace invitation
 */
export function dbToApiWorkspaceInvitation(dbInvitation: DbWorkspaceInvitation): ApiWorkspaceInvitation {
  return {
    id: dbInvitation.id,
    workspaceId: dbInvitation.workspace_id,
    email: dbInvitation.email,
    role: dbInvitation.role,
    status: dbInvitation.status,
    invitedBy: dbInvitation.invited_by,
    invitedAt: dbInvitation.invited_at,
    expiresAt: dbInvitation.expires_at,
    token: dbInvitation.token
  };
}

/**
 * Transform DB workspace invitations to API format
 * 
 * @param dbInvitations - Array of database workspace invitation objects
 * @returns Array of API-formatted workspace invitations
 */
export function dbToApiWorkspaceInvitations(dbInvitations: DbWorkspaceInvitation[]): ApiWorkspaceInvitation[] {
  return dbInvitations.map(dbToApiWorkspaceInvitation);
}

/**
 * Transform a DB workspace member to API format with profile information
 * 
 * @param dbMember - Database workspace member object
 * @param profileData - Profile data to include with the member
 * @returns API-formatted workspace member with profile information
 */
export function dbToApiWorkspaceMemberWithProfileFromParts(
  dbMember: DbWorkspaceMember, 
  profileData: Pick<DbProfile, 'full_name' | 'avatar_url' | 'email'>
): ApiWorkspaceMemberWithProfile {
  return {
    workspaceId: dbMember.workspace_id,
    userId: dbMember.user_id,
    role: dbMember.role,
    joinedAt: dbMember.joined_at,
    profile: {
      // Convert null to undefined for all optional profile fields
      fullName: profileData.full_name === null ? undefined : profileData.full_name,
      avatarUrl: profileData.avatar_url === null ? undefined : profileData.avatar_url,
      email: profileData.email === null ? undefined : profileData.email
    }
  };
}

/**
 * Transform a DbWorkspaceMemberWithProfile to API format
 * 
 * @param dbMemberWithProfile - Combined database workspace member with profile
 * @returns API-formatted workspace member with profile
 */
export function dbToApiWorkspaceMemberWithProfile(
  dbMemberWithProfile: DbWorkspaceMemberWithProfile
): ApiWorkspaceMemberWithProfile {
  return {
    workspaceId: dbMemberWithProfile.workspace_id,
    userId: dbMemberWithProfile.user_id,
    role: dbMemberWithProfile.role,
    joinedAt: dbMemberWithProfile.joined_at,
    profile: {
      // Convert null to undefined for all optional profile fields
      fullName: dbMemberWithProfile.profile.full_name === null ? undefined : dbMemberWithProfile.profile.full_name,
      avatarUrl: dbMemberWithProfile.profile.avatar_url === null ? undefined : dbMemberWithProfile.profile.avatar_url,
      email: dbMemberWithProfile.profile.email === null ? undefined : dbMemberWithProfile.profile.email
    }
  };
}

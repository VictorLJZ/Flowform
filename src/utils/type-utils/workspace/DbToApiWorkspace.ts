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
  DbWorkspaceInvitation
} from '@/types/workspace';
import { DbWorkspaceMemberWithProfile } from '@/services/workspace/members.server';
import { DbProfile } from '@/types/user';

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
 * This function has two overloads:
 * 1. For separate member and profile data
 * 2. For combined DbWorkspaceMemberWithProfile objects (from the members service)
 * 
 * @param dbMember - Database workspace member object (with or without profile)
 * @param profileData - Profile data to include with the member (optional if dbMember has profile)
 * @returns API-formatted workspace member with profile information
 */
export function dbToApiWorkspaceMemberWithProfile(
  dbMember: DbWorkspaceMemberWithProfile
): ApiWorkspaceMemberWithProfile;
export function dbToApiWorkspaceMemberWithProfile(
  dbMember: DbWorkspaceMember, 
  profileData: Pick<DbProfile, 'full_name' | 'avatar_url' | 'email'>
): ApiWorkspaceMemberWithProfile;
export function dbToApiWorkspaceMemberWithProfile(
  dbMember: DbWorkspaceMember | DbWorkspaceMemberWithProfile,
  profileData?: Pick<DbProfile, 'full_name' | 'avatar_url' | 'email'>
): ApiWorkspaceMemberWithProfile {
  // Check if we have a combined object with profile or separate objects
  const hasEmbeddedProfile = 'profile' in dbMember;
  
  // Extract profile data from the appropriate source
  const profile = hasEmbeddedProfile 
    ? (dbMember as DbWorkspaceMemberWithProfile).profile
    : profileData!;
  
  return {
    workspaceId: dbMember.workspace_id,
    userId: dbMember.user_id,
    role: dbMember.role,
    joinedAt: dbMember.joined_at,
    profile: {
      // Convert null to undefined for all optional profile fields
      fullName: profile.full_name === null ? undefined : profile.full_name,
      avatarUrl: profile.avatar_url === null ? undefined : profile.avatar_url,
      // Ensure email is never null (use a fallback empty string if needed)
      email: profile.email || ''
    }
  };
}
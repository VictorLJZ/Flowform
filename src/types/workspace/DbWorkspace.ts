/**
 * Database-level workspace types
 * 
 * These types directly reflect the database schema for workspace-related tables.
 * They use snake_case naming to match database column names.
 * 
 * Use these types for:
 * - Database queries and mutations
 * - Direct interaction with Supabase
 * - Backend services that work with raw database data
 */

/**
 * Database workspace table schema
 */
export interface DbWorkspace {
  id: string; // UUID
  name: string;
  description: string | null;
  created_at: string; // ISO date string
  created_by: string; // UUID, references auth.users.id
  updated_at: string; // ISO date string
  logo_url: string | null;
  settings: Record<string, unknown> | null; // JSONB
}

/**
 * Workspace member roles
 */
export type DbWorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

/**
 * Database workspace members table schema (junction table)
 */
export interface DbWorkspaceMember {
  workspace_id: string; // UUID, references workspaces.id
  user_id: string; // UUID, references auth.users.id
  role: DbWorkspaceRole;
  joined_at: string; // ISO date string
}

/**
 * Invitation status types
 */
export type DbInvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

/**
 * Database workspace invitations table schema
 */
export interface DbWorkspaceInvitation {
  id: string; // UUID
  workspace_id: string; // UUID, references workspaces.id
  email: string;
  role: DbWorkspaceRole;
  status: DbInvitationStatus;
  invited_by: string; // UUID, references auth.users.id
  invited_at: string; // ISO date string
  expires_at: string; // ISO date string
  token: string;
}

/**
 * Database profiles table schema
 */
export interface DbProfile {
  id: string; // UUID, references auth.users.id
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

/**
 * Database workspace member joined with user profile information
 */
export interface DbWorkspaceMemberWithProfile extends DbWorkspaceMember {
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    email?: string | null;
  };
}

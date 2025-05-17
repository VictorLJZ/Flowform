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
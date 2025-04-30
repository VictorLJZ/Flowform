import { Profile, Workspace, WorkspaceMember } from './supabase-types';

/**
 * Roles that can be assigned to workspace members
 */
export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

/**
 * Input type for creating a new workspace
 */
export type WorkspaceInput = Pick<Workspace, 'name' | 'description' | 'created_by' | 'logo_url' | 'settings'>;

/**
 * Input type for updating an existing workspace
 */
export type WorkspaceUpdateInput = Partial<Pick<Workspace, 
  'name' | 
  'description' | 
  'logo_url' | 
  'settings'
>>;

/**
 * Basic workspace member information
 * Interface for the specific fields returned by the workspace_members query
 */
export interface WorkspaceMemberBasic {
  workspace_id: string;
  role: string;
}

/**
 * Workspace member with profile information
 */
export type WorkspaceMemberWithProfile = WorkspaceMember & {
  profile: Pick<Profile, 'full_name' | 'avatar_url'> & { title?: string | null };
};

/**
 * API error response interface for client-side implementations
 */
export interface ApiErrorResponse {
  error?: string;
  message?: string;
  status?: number;
}

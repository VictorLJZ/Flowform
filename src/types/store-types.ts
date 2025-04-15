import { Workspace, WorkspaceInvitation, WorkspaceMember } from './supabase-types'

/**
 * Workspace Store Types
 */

// Complete store state
export interface WorkspaceStoreState {
  // Core Workspace State
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;
  userId: string | null;
  userEmail: string | null;
  
  // Invitation State
  pendingInvitations: WorkspaceInvitation[];
  sentInvitations: WorkspaceInvitation[];
  isLoadingInvitations: boolean;
  invitationError: string | null;
  invitationLimit: number;
}

// Action interfaces for each slice
export interface CoreWorkspaceActions {
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
  renameWorkspace: (workspaceId: string, name: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
}

export interface MembershipActions {
  setUserId: (userId: string) => void;
  setUserEmail: (email: string) => void;
  ensureDefaultWorkspace: () => Promise<void>;
  leaveWorkspace: (workspaceId: string) => Promise<void>;
}

export interface InvitationActions {
  fetchPendingInvitations: () => Promise<void>;
  fetchSentInvitations: (workspaceId: string) => Promise<void>;
  sendInvitations: (invites: { email: string; role: 'owner' | 'admin' | 'editor' | 'viewer' }[]) => Promise<WorkspaceInvitation[]>;
  resendInvitation: (invitationId: string) => Promise<WorkspaceInvitation | null>;
  acceptInvitation: (token: string) => Promise<WorkspaceMember | null>;
  declineInvitation: (token: string) => Promise<boolean>;
  revokeInvitation: (invitationId: string) => Promise<boolean>;
  clearInvitationError: () => void;
}

// Complete store type combining all slices
export type WorkspaceStore = 
  WorkspaceStoreState & 
  CoreWorkspaceActions & 
  MembershipActions & 
  InvitationActions;

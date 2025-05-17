/**
 * These imports are used directly in the FormBuilderState interface for typing
 * They're also used indirectly through the slice interfaces, but we reference them
 * directly here to make the TypeScript compiler happy
 */
import type { UiBlock } from './block';
import type { SlideLayout } from './layout-types';
import type { CustomFormData } from './form-builder-types';
import type { Connection } from './workflow-types';
import type {
  FormCoreSlice,
  FormBlocksSlice,
  FormPresentationSlice,
  FormUISlice,
  FormWorkflowSlice,
  FormPersistenceSlice
} from './form-store-slices-types';
import type { UIAlertsSlice } from './form-store-slices-types-alerts';
import type { FormMediaSlice } from './form-store-slices-types-media';
import type { GhostPost, GhostTag } from './ghost';
import { UiSessionInfo } from './conversation';
import type {
  ApiWorkspace,
  ApiWorkspaceInput,
  ApiWorkspaceUpdateInput,
  ApiWorkspaceMemberWithProfile,
  ApiWorkspaceRole,
  ApiWorkspaceInvitation,
  ApiWorkspaceInvitationInput
} from './workspace/ApiWorkspace';

/**
 * Analytics store state and actions
 */
export type AnalyticsState = {
  // Keep state related to non-fetching actions if needed
  isExporting: boolean;
  exportError: string | null;

  // Actions
  exportResponses: (formId: string, format: 'csv' | 'excel') => Promise<void>
}

/**
 * Sidebar store state and actions
 */
export type SidebarState = {
  isOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
}

/**
 * Workspace store for managing workspaces, members, and invitations
 * 
 * This store follows our three-layer type system architecture:
 * - It stores API-level types (ApiWorkspace) internally
 * - UI components should transform these to UI types as needed
 * - API types are transformed to DB types by the service layer
 */
export interface WorkspaceState {
  // Workspace State
  workspaces: ApiWorkspace[];
  currentWorkspaceId: string | null;
  lastSelectionTime: number;
  isLoading: boolean;
  error: string | null;
  
  // Workspace Members State
  members: Record<string, ApiWorkspaceMemberWithProfile[]>;
  membersLoading: Record<string, boolean>;
  membersError: Record<string, string | null>;
  
  // Workspace Invitations State
  invitations: Record<string, ApiWorkspaceInvitation[]>;
  invitationsLoading: Record<string, boolean>;
  invitationsError: Record<string, string | null>;
  
  // Workspace Actions
  fetchWorkspaces: () => Promise<ApiWorkspace[]>;
  selectWorkspace: (workspaceId: string | null) => void;
  createWorkspace: (input: ApiWorkspaceInput) => Promise<ApiWorkspace>;
  updateWorkspace: (id: string, input: ApiWorkspaceUpdateInput) => Promise<ApiWorkspace>;
  deleteWorkspace: (id: string) => Promise<void>;
  
  // Member Actions
  fetchMembers: (workspaceId: string) => Promise<ApiWorkspaceMemberWithProfile[]>;
  updateMemberRole: (workspaceId: string, userId: string, role: ApiWorkspaceRole) => Promise<void>;
  removeMember: (workspaceId: string, userId: string) => Promise<void>;
  leaveWorkspace: (workspaceId: string) => Promise<void>;
  
  // Invitation Actions
  fetchInvitations: (workspaceId: string) => Promise<ApiWorkspaceInvitation[]>;
  createInvitation: (workspaceId: string, input: ApiWorkspaceInvitationInput) => Promise<ApiWorkspaceInvitation>;
  deleteInvitation: (workspaceId: string, invitationId: string) => Promise<void>;
}

/**
 * Form builder store state and actions
 */
export interface FormBuilderState extends 
  FormCoreSlice,
  FormBlocksSlice,
  FormPresentationSlice,
  FormUISlice,
  FormWorkflowSlice,
  FormPersistenceSlice,
  FormMediaSlice,
  UIAlertsSlice {
  // This interface combines all the slice interfaces
  // These property definitions ensure the imported types are used and not flagged as unused
  // They're never actually used at runtime since the slices provide the actual implementation
  __blockType?: UiBlock;
  __layoutType?: SlideLayout;
  __formDataType?: CustomFormData;
  __connectionType?: Connection;
}

export interface BlogState {
  posts: GhostPost[];
  currentPost: GhostPost | null;
  tags: GhostTag[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPosts: (limit?: number) => Promise<GhostPost[]>;
  fetchPostBySlug: (slug: string) => Promise<GhostPost | null>;
  fetchPostsByTag: (tag: string, limit?: number) => Promise<void>;
  fetchTags: () => Promise<void>;
  reset: () => void;
}

export interface ChatSessionsState {
  // State
  sessions: UiSessionInfo[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSessions: (formId: string) => Promise<void>;
  setCurrentSession: (sessionId: string | null) => void;
  createSession: (formId: string) => Promise<string>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearAllSessions: (formId: string) => Promise<void>;
  updateSessionMetadata: (sessionId: string, metadata: Partial<Pick<UiSessionInfo, 'title' | 'lastMessage'>>) => Promise<void>;
}

// Types to represent view tracking data
export type ViewedForm = {
  formId: string;
  lastViewedAt: number;
  viewCount: number;
};

export interface ViewTrackingState {
  viewedForms: Record<string, ViewedForm>;
  trackView: (formId: string, metadata?: Record<string, unknown>) => Promise<boolean>;
  hasViewedRecently: (formId: string, cooldownMinutes?: number) => boolean;
  getFormViewCount: (formId: string) => number;
}
// Selector functions
export const selectCurrentWorkspaceId = (state: WorkspaceState) => state.currentWorkspaceId;
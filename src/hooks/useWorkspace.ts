/**
 * Unified Workspace Hook
 * 
 * This hook centralizes all workspace-related operations and state.
 * It combines the context from WorkspaceProvider with the Zustand store
 * in a React-friendly way, providing a clean API for components.
 */

import { useWorkspace as useWorkspaceContext } from '@/providers/workspace-provider';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useCallback } from 'react';
import { ApiWorkspaceUpdateInput, ApiWorkspaceRole } from '@/types/workspace/ApiWorkspace';
import { apiToUiWorkspace } from '@/utils/type-utils/workspace/ApiToUiWorkspace';
import { useCurrentUser } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';

/**
 * Extended hook that combines provider context with direct store access for
 * advanced operations not exposed through the context
 */
export function useWorkspace() {
  // Get the workspace context from the provider
  const context = useWorkspaceContext();
  
  // Get direct access to the store for advanced operations
  const store = useWorkspaceStore();
  
  // Get the current user's ID for permission checks
  const { userId } = useCurrentUser();
  
  // Get Next.js router for navigation
  const router = useRouter();
  
  /**
   * Refresh workspace data
   */
  const refreshWorkspaces = useCallback(async () => {
    return await store.fetchWorkspaces();
  }, [store]);
  
  /**
   * Initialize the workspace system and select a default workspace if needed
   */
  const initialize = useCallback(async () => {
    if (store.workspaces.length === 0) {
      await store.fetchWorkspaces();
    }
    
    if (!store.currentWorkspaceId && store.workspaces.length > 0) {
      return await context.initDefaultWorkspace();
    }
    
    return store.currentWorkspaceId;
  }, [store, context]);
  
  /**
   * Check if current user is a member of the workspace
   */
  const isMember = useCallback(async (workspaceId: string): Promise<boolean> => {
    // Use cached user data instead of making new API call
    if (!userId) return false;
    
    // Get members for the workspace if not already loaded
    if (!store.members[workspaceId]) {
      await store.fetchMembers(workspaceId);
    }
    
    // Check if current user is in the members list
    return store.members[workspaceId]?.some(member => member.userId === userId) || false;
  }, [store, userId]);
  
  /**
   * Get the current user's role in a workspace
   */
  const getUserRole = useCallback(async (workspaceId: string): Promise<ApiWorkspaceRole | null> => {
    // Use cached user data instead of making new API call
    if (!userId) return null;
    
    // Get members for the workspace if not already loaded
    if (!store.members[workspaceId]) {
      await store.fetchMembers(workspaceId);
    }
    
    // Find the current user's membership
    const membership = store.members[workspaceId]?.find(member => member.userId === userId);
    return membership?.role || null;
  }, [store, userId]);
  
  /**
   * Update workspace settings (name, description, logo, etc.)
   */
  const updateWorkspaceSettings = useCallback(async (
    workspaceId: string, 
    settings: ApiWorkspaceUpdateInput
  ) => {
    return await store.updateWorkspace(workspaceId, settings);
  }, [store]);
  
  /**
   * Check if a workspace is being loaded
   */
  const isWorkspaceLoading = useCallback((workspaceId?: string) => {
    // If specific workspace ID provided, check its loading state
    if (workspaceId) {
      return store.membersLoading[workspaceId] || store.invitationsLoading[workspaceId] || false;
    }
    
    // Otherwise check global loading state
    return store.isLoading;
  }, [store]);
  
  /**
   * Get workspace error for a specific workspace
   */
  const getWorkspaceError = useCallback((workspaceId?: string) => {
    // If specific workspace ID provided, check its error state
    if (workspaceId) {
      return store.membersError[workspaceId] || store.invitationsError[workspaceId] || null;
    }
    
    // Otherwise check global error state
    return store.error;
  }, [store]);
  
  /**
   * Select a workspace and navigate to its dashboard page
   */
  const selectWorkspaceWithNavigation = useCallback((workspaceId: string | null) => {
    // Update the store state
    store.selectWorkspace(workspaceId);
    
    // Navigate to the workspace page if a workspace was selected
    if (workspaceId) {
      router.push(`/dashboard/workspace/${workspaceId}`);
    }
  }, [store, router]);

  // Return combined API from both context and store
  return {
    // State from context
    ...context,
    
    // Override the selectWorkspace function with our navigation-enabled version
    selectWorkspace: selectWorkspaceWithNavigation,
    
    // Current workspace lookup by ID helper
    getWorkspaceById: useCallback((id: string) => {
      const apiWorkspace = store.workspaces.find(w => w.id === id);
      return apiWorkspace ? apiToUiWorkspace(apiWorkspace) : null;
    }, [store.workspaces]),
    
    // Member management
    members: store.members,
    membersLoading: store.membersLoading,
    fetchMembers: store.fetchMembers,
    updateMemberRole: store.updateMemberRole,
    removeMember: store.removeMember,
    leaveWorkspace: store.leaveWorkspace,
    
    // Invitation management
    invitations: store.invitations,
    invitationsLoading: store.invitationsLoading,
    fetchInvitations: store.fetchInvitations,
    createInvitation: store.createInvitation,
    deleteInvitation: store.deleteInvitation,
    
    // Additional utilities
    refreshWorkspaces,
    initialize,
    isMember,
    getUserRole,
    updateWorkspaceSettings,
    isWorkspaceLoading,
    getWorkspaceError
  };
}

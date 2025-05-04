// src/stores/workspaceStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Workspace } from '@/types/supabase-types';

interface WorkspaceState {
  // Current selected workspace ID
  currentWorkspaceId: string | null;
  // All available workspaces for the user
  workspaces: Workspace[];
  // Actions
  setCurrentWorkspaceId: (workspaceId: string | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  // Add a workspace to the existing list (for new workspace creation)
  addWorkspace: (workspace: Workspace) => void;
  // Refresh workspaces from fetched data
  refreshWorkspaces: (fetchFn: () => Promise<Workspace[]>) => Promise<Workspace[]>;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  // Persist the selected workspace ID in localStorage
  persist(
    (set, get) => ({
      currentWorkspaceId: null,
      workspaces: [],
      setCurrentWorkspaceId: (workspaceId) => {
        console.log('[WorkspaceStore] Setting current workspace ID:', workspaceId);
        set({ currentWorkspaceId: workspaceId });
        // Log the state after setting for debugging
        setTimeout(() => {
          const newState = get();
          console.log('[WorkspaceStore] State after update:', { 
            currentId: newState.currentWorkspaceId,
            workspaceCount: newState.workspaces.length
          });
        }, 0);
      },
      setWorkspaces: (workspaces) => {
        const currentId = get().currentWorkspaceId;
        
        // If no workspace is selected but we have workspaces, select the first one
        if (!currentId && workspaces.length > 0) {
          console.log('[WorkspaceStore] Auto-selecting first workspace:', workspaces[0].id);
          // Update both workspaces and currentWorkspaceId in one call
          set({ 
            workspaces,
            currentWorkspaceId: workspaces[0].id 
          });
        } else {
          // Just update workspaces
          set({ workspaces });
        }
      },
      // Add a single workspace to the existing list
      addWorkspace: (workspace) => {
        console.log('[WorkspaceStore] Adding new workspace:', workspace.id);
        const currentWorkspaces = get().workspaces;
        // Make a new array with the new workspace added
        const updatedWorkspaces = [...currentWorkspaces, workspace];
        console.log('[WorkspaceStore] Updated workspace count:', updatedWorkspaces.length);
        set({ workspaces: updatedWorkspaces });
      },
      // Refresh workspaces from an async fetch function
      refreshWorkspaces: async (fetchFn) => {
        console.log('[WorkspaceStore] Refreshing workspaces from external source');
        try {
          // Fetch fresh workspace data
          const freshWorkspaces = await fetchFn();
          console.log('[WorkspaceStore] Fetched fresh workspaces:', freshWorkspaces.length);
          // Update the store with fresh data
          const currentId = get().currentWorkspaceId;
          
          if (!currentId && freshWorkspaces.length > 0) {
            // If no workspace selected but we have workspaces, select the first one
            set({ 
              workspaces: freshWorkspaces,
              currentWorkspaceId: freshWorkspaces[0].id 
            });
          } else {
            // Just update workspaces
            set({ workspaces: freshWorkspaces });
          }
          
          return freshWorkspaces;
        } catch (error) {
          console.error('[WorkspaceStore] Error refreshing workspaces:', error);
          throw error;
        }
      },
    }),
    {
      name: 'workspace-state-storage', // Rename to ensure fresh state
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({
        currentWorkspaceId: state.currentWorkspaceId,
        // Don't persist the full workspace data, just the ID
      })
    }
  )
);

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
  // Sync a workspace when accepting an invitation
  syncWorkspaceAfterInvitation: (workspaceId: string, fetchWorkspaceFn: (id: string) => Promise<Workspace | null>) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  // Persist the selected workspace ID in localStorage
  persist(
    (set, get) => ({
      currentWorkspaceId: null,
      workspaces: [],
      syncWorkspaceAfterInvitation: async (workspaceId, fetchWorkspaceFn) => {
        console.log('[WorkspaceStore] Syncing workspace after invitation:', workspaceId);
        try {
          // Fetch the workspace details
          const workspace = await fetchWorkspaceFn(workspaceId);
          
          if (workspace) {
            // Check if we already have this workspace in the store
            const existingWorkspaces = get().workspaces;
            const alreadyExists = existingWorkspaces.some(w => w.id === workspaceId);
            
            if (!alreadyExists) {
              // Add the workspace to the store
              console.log('[WorkspaceStore] Adding workspace after invitation:', workspace.name);
              const updatedWorkspaces = [...existingWorkspaces, workspace];
              set({ workspaces: updatedWorkspaces });
              
              // Always set the newly joined workspace as the current workspace
              console.log('[WorkspaceStore] Setting newly joined workspace as current workspace:', workspaceId);
              set({ currentWorkspaceId: workspaceId });
            }
          }
        } catch (error) {
          console.error('[WorkspaceStore] Error syncing workspace after invitation:', error);
        }
      },
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
        
        // If we have workspaces available
        if (workspaces.length > 0) {
          // Check if the currently selected workspace is still in the list
          const currentWorkspaceExists = currentId && workspaces.some(w => w.id === currentId);
          
          if (!currentId || !currentWorkspaceExists) {
            // Either no workspace selected or the selected one is no longer available
            console.log('[WorkspaceStore] Auto-selecting workspace:', workspaces[0].id);
            // Update both workspaces and currentWorkspaceId in one call
            set({ 
              workspaces,
              currentWorkspaceId: workspaces[0].id 
            });
          } else {
            // Keep current selection and just update the list
            console.log('[WorkspaceStore] Keeping current selection:', currentId);
            set({ workspaces });
          }
        } else {
          // If no workspaces, clear everything
          console.log('[WorkspaceStore] No workspaces available, clearing selection');
          set({ workspaces, currentWorkspaceId: null });
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
          
          // Get saved workspace ID from localStorage (for after login restore)
          const savedWorkspaceId = get().currentWorkspaceId;
          console.log('[WorkspaceStore] Saved workspace ID:', savedWorkspaceId);
          
          // Check if the saved workspace is still in the fresh workspaces
          const savedWorkspaceExists = savedWorkspaceId && 
            freshWorkspaces.some(w => w.id === savedWorkspaceId);
          
          if (freshWorkspaces.length > 0) {
            if (savedWorkspaceExists) {
              // If we have a saved workspace and it still exists, restore it
              console.log('[WorkspaceStore] Restoring saved workspace:', savedWorkspaceId);
              set({ 
                workspaces: freshWorkspaces,
                currentWorkspaceId: savedWorkspaceId 
              });
            } else {
              // If no valid saved workspace, select the first one
              console.log('[WorkspaceStore] Selecting first workspace:', freshWorkspaces[0].id);
              set({ 
                workspaces: freshWorkspaces,
                currentWorkspaceId: freshWorkspaces[0].id 
              });
            }
          } else {
            // No workspaces, clear selection
            console.log('[WorkspaceStore] No workspaces available, clearing selection');
            set({ 
              workspaces: freshWorkspaces,
              currentWorkspaceId: null 
            });
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
      }),
      // Setup proper rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('[WorkspaceStore] Rehydrated from storage, saved workspace ID:', state.currentWorkspaceId);
        } else {
          console.log('[WorkspaceStore] No stored state found');
        }
      }
    }
  )
);

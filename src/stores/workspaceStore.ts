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
        // Validate the workspace ID to prevent errors during login
        if (!workspaceId) {

          return;
        }
        

        try {
          // Check if we already have this workspace in the store before fetching
          const existingWorkspaces = get().workspaces;
          const existingWorkspace = existingWorkspaces.find(w => w.id === workspaceId);
          
          // If we already have this workspace, no need to fetch it again
          if (existingWorkspace) {

            set({ currentWorkspaceId: workspaceId });
            return;
          }
          
          // Fetch the workspace details
          const workspace = await fetchWorkspaceFn(workspaceId);
          
          if (workspace) {
            // Add the workspace to the store

            const updatedWorkspaces = [...existingWorkspaces, workspace];
            
            // Update workspaces and set the current workspace ID
            set({ 
              workspaces: updatedWorkspaces,
              currentWorkspaceId: workspaceId 
            });
          }
        } catch (error) {
          console.error('Error syncing workspace after invitation:', error);
        }
      },
      setCurrentWorkspaceId: (workspaceId) => {

        set({ currentWorkspaceId: workspaceId });
        // Log the state after setting for debugging
        setTimeout(() => {
          const newState = get();

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

            // Update both workspaces and currentWorkspaceId in one call
            set({ 
              workspaces,
              currentWorkspaceId: workspaces[0].id 
            });
          } else {
            // Keep current selection and just update the list

            set({ workspaces });
          }
        } else {
          // If no workspaces, clear everything

          set({ workspaces, currentWorkspaceId: null });
        }
      },
      // Add a single workspace to the existing list
      addWorkspace: (workspace) => {

        const currentWorkspaces = get().workspaces;
        // Make a new array with the new workspace added
        const updatedWorkspaces = [...currentWorkspaces, workspace];

        set({ workspaces: updatedWorkspaces });
      },
      // Refresh workspaces from an async fetch function
      refreshWorkspaces: async (fetchFn) => {

        try {
          // Fetch fresh workspace data
          const freshWorkspaces = await fetchFn();

          
          // Get saved workspace ID from localStorage (for after login restore)
          const savedWorkspaceId = get().currentWorkspaceId;

          
          // Check if the saved workspace is still in the fresh workspaces
          const savedWorkspaceExists = savedWorkspaceId && 
            freshWorkspaces.some(w => w.id === savedWorkspaceId);
          
          if (freshWorkspaces.length > 0) {
            if (savedWorkspaceExists) {
              // If we have a saved workspace and it still exists, restore it

              set({ 
                workspaces: freshWorkspaces,
                currentWorkspaceId: savedWorkspaceId 
              });
            } else {
              // If no valid saved workspace, select the first one

              set({ 
                workspaces: freshWorkspaces,
                currentWorkspaceId: freshWorkspaces[0].id 
              });
            }
          } else {
            // No workspaces, clear selection
  
            set({ 
              workspaces: freshWorkspaces,
              currentWorkspaceId: null 
            });
          }
          
          return freshWorkspaces;
        } catch (error) {
          console.error('Error refreshing workspaces:', error);
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

        } else {

        }
      }
    }
  )
);

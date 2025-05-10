// src/stores/workspaceStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Workspace } from '@/types/supabase-types';

interface WorkspaceState {
  // Current selected workspace ID
  currentWorkspaceId: string | null;
  // All available workspaces for the user
  workspaces: Workspace[];
  // Flag to indicate manual workspace selection to prevent automatic switching
  manualSelectionActive: boolean;
  // Last timestamp when a manual selection was made
  lastManualSelectionTime: number;
  // Actions
  setCurrentWorkspaceId: (workspaceId: string | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  // Add a workspace to the existing list (for new workspace creation)
  addWorkspace: (workspace: Workspace) => void;
  // Protected version of workspace selection that prevents overrides
  selectWorkspace: (workspaceId: string, options?: { force?: boolean }) => void;
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
      manualSelectionActive: false,
      lastManualSelectionTime: 0,
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
      // Basic version - use selectWorkspace for more control
      setCurrentWorkspaceId: (workspaceId) => {
        set({ currentWorkspaceId: workspaceId });
        // Removed debugging code that was not being used
      },
      
      // Protected version of workspace selection that prevents overrides
      selectWorkspace: (workspaceId, options = {}) => {
        const { force = false } = options;
        const now = Date.now();
        
        // Validate the workspace exists in our list (unless forced)
        if (!force && workspaceId) {
          const workspaceExists = get().workspaces.some(w => w.id === workspaceId);
          if (!workspaceExists) {
            console.error(`[workspaceStore] Cannot select workspace ${workspaceId} - not found in workspace list`);
            return;
          }
        }
        
        // Set in store
        set({
          currentWorkspaceId: workspaceId,
          manualSelectionActive: true,
          lastManualSelectionTime: now
        });
        
        // Set in session storage for cross-component coordination
        if (typeof window !== 'undefined') {
          console.log(`[workspaceStore] Manual workspace selection: ${workspaceId}`);
          window.sessionStorage.setItem('manual_workspace_switch', 'true');
          window.sessionStorage.setItem('workspace_last_switched', now.toString());
        }
      },
      setWorkspaces: (workspaces) => {
        // CRITICAL FIX: Check early if this is the exact same list of workspaces
        // This fixes a common cause of the workspace selection bug: redundant updates
        const currentWorkspaces = get().workspaces;
        
        // Quick check for equivalent arrays (length & shallow content equality)
        const areWorkspacesEquivalent = () => {
          if (currentWorkspaces.length !== workspaces.length) return false;
          const currentIds = new Set(currentWorkspaces.map(w => w.id));
          return workspaces.every(w => currentIds.has(w.id));
        };
        
        // Skip the update entirely if the workspaces array is the same
        // This is a huge optimization that prevents unnecessary re-renders
        if (areWorkspacesEquivalent()) {
          console.log(`[workspaceStore:setWorkspaces] Skipping redundant update - workspace list unchanged`);
          return;
        }
        
        // Proceed with normal update logic
        const currentId = get().currentWorkspaceId;
        const { manualSelectionActive, lastManualSelectionTime } = get();
        
        console.log(`[workspaceStore:setWorkspaces] Running with:`, { 
          currentId, 
          workspaceCount: workspaces.length,
          previousCount: currentWorkspaces.length,
          manualSelectionActive,
          timestamp: new Date().toISOString()
        });
        
        // Extra logging for debugging
        if (workspaces.length > 0 && currentId) {
          // Log the currently selected workspace vs new workspace IDs
          console.log(`[workspaceStore:setWorkspaces] Current selection vs available:`, {
            currentId,
            newWorkspaceIds: workspaces.map(w => w.id).join(', ')
          });
        }
        
        // PROTECTION: Check for manual selection flag before making changes
        const manualSwitchFlag = typeof window !== 'undefined' ? 
          window.sessionStorage.getItem('manual_workspace_switch') : null;
          
        // Get stored timestamp for comparison (to know if manual selection is recent)
        const storedTimestamp = typeof window !== 'undefined' ? 
          window.sessionStorage.getItem('workspace_last_switched') : null;
          
        const manualTimestamp = storedTimestamp ? parseInt(storedTimestamp, 10) : 0;
        // EXTEND the window for recent manual selection to 30 seconds
        const isRecentManualSelection = (Date.now() - manualTimestamp) < 30000; // 30 seconds
        const isManuallySelected = manualSelectionActive || manualSwitchFlag === 'true' || isRecentManualSelection;
        
        // If we have workspaces available
        if (workspaces.length > 0) {
          // Check if the currently selected workspace is still in the list
          const currentWorkspaceExists = currentId && workspaces.some(w => w.id === currentId);
          
          if (isManuallySelected && currentId) {
            // If a manual selection is active, ALWAYS respect it, even if the workspace doesn't exist
            // in the current list. This is to handle the case where a newly created workspace might not 
            // be in the fetched list yet due to timing issues.
            console.log(`[workspaceStore:setWorkspaces] ⚠️ Respecting manual selection: ${currentId}`);
            
            if (currentWorkspaceExists) {
              // If the selected workspace exists in the list, just update the workspaces
              set({ workspaces, manualSelectionActive: true });
            } else {
              // If the manually selected workspace is not in the list yet,
              // we'll preserve the current workspace list but keep the manual selection
              // This handles the case where the current list doesn't yet have the newly created workspace
              console.log(`[workspaceStore:setWorkspaces] ⚠️ Manually selected workspace not in list yet, preserving current state`);
            }
          }
          else if (!currentId || !currentWorkspaceExists) {
            // Either no workspace selected or the selected one is no longer available
            console.log(`[workspaceStore:setWorkspaces] No current workspace or current not in list, selecting first one`);
            
            // Update both workspaces and currentWorkspaceId in one call
            set({ 
              workspaces,
              currentWorkspaceId: workspaces[0].id,
              manualSelectionActive: false
            });
          } else {
            // Keep current selection and just update the list
            console.log(`[workspaceStore:setWorkspaces] Keeping current selection: ${currentId}`);
            
            set({ workspaces });
          }
        } else {
          // If no workspaces, clear everything
          console.log(`[workspaceStore:setWorkspaces] No workspaces available, clearing selection`);
          
          set({ 
            workspaces, 
            currentWorkspaceId: null,
            manualSelectionActive: false
          });
        }
      },
      // Add a single workspace to the existing list and select it
      addWorkspace: (workspace) => {
        console.log(`[workspaceStore:addWorkspace] Adding workspace: ${workspace.id}`);
        
        const currentWorkspaces = get().workspaces;
        // Make a new array with the new workspace added
        const updatedWorkspaces = [...currentWorkspaces, workspace];
        
        // First update the workspace list
        set({ workspaces: updatedWorkspaces });
        
        // Then use the protected method to select the workspace
        // This ensures all the proper flags are set to prevent selection override
        get().selectWorkspace(workspace.id, { force: true });
      },
      // Refresh workspaces from an async fetch function
      // - Respects manual workspace selection to prevent unwanted workspace changes
      refreshWorkspaces: async (fetchFn) => {
        console.log(`[workspaceStore:refreshWorkspaces] Starting refresh...`);
        
        try {
          // Capture current state before refresh
          const { 
            currentWorkspaceId: currentId, 
            manualSelectionActive,
            lastManualSelectionTime
          } = get();
          
          // Check for manual selection status
          const manualSwitchFlag = typeof window !== 'undefined' ? 
            window.sessionStorage.getItem('manual_workspace_switch') : null;
            
          // Get stored timestamp for comparison
          const storedTimestamp = typeof window !== 'undefined' ? 
            window.sessionStorage.getItem('workspace_last_switched') : null;
            
          const manualTimestamp = storedTimestamp ? parseInt(storedTimestamp, 10) : 0;
          const isRecentManualSelection = (Date.now() - manualTimestamp) < 30000; // 30 seconds
          const isManuallySelected = manualSelectionActive || manualSwitchFlag === 'true' || isRecentManualSelection;
          
          // Fetch fresh workspace data
          const freshWorkspaces = await fetchFn();
          
          console.log(`[workspaceStore:refreshWorkspaces] Refreshed:`, { 
            workspaceCount: freshWorkspaces.length,
            currentId,
            isManuallySelected
          });
          
          // Check if the current workspace is still in the fresh workspaces
          const currentWorkspaceExists = currentId && 
            freshWorkspaces.some(w => w.id === currentId);
          
          if (freshWorkspaces.length > 0) {
            if (isManuallySelected && currentId && currentWorkspaceExists) {
              // CASE 1: Manual selection is active and the workspace is still valid
              // Just update the workspace list without changing selection
              console.log(`[workspaceStore:refreshWorkspaces] Respecting manual selection: ${currentId}`);
              
              set({ 
                workspaces: freshWorkspaces,
                // Explicitly preserve manual selection state
                manualSelectionActive: true
              });
            }
            else if (currentWorkspaceExists) {
              // CASE 2: Current workspace exists in the refreshed list but no manual selection
              console.log(`[workspaceStore:refreshWorkspaces] Current workspace exists, keeping selection: ${currentId}`);
              
              set({ 
                workspaces: freshWorkspaces,
                currentWorkspaceId: currentId 
              });
            } 
            else {
              // CASE 3: Current workspace doesn't exist, select the first one
              console.log(`[workspaceStore:refreshWorkspaces] Current workspace not found, selecting first one`);
              
              set({ 
                workspaces: freshWorkspaces,
                currentWorkspaceId: freshWorkspaces[0].id,
                manualSelectionActive: false
              });
            }
          } else {
            // CASE 4: No workspaces available, clear selection
            console.log(`[workspaceStore:refreshWorkspaces] No workspaces available, clearing selection`);
            
            set({ 
              workspaces: freshWorkspaces,
              currentWorkspaceId: null,
              manualSelectionActive: false
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
        workspaces: state.workspaces, // Now persist the workspace list too for consistency
        manualSelectionActive: state.manualSelectionActive,
        lastManualSelectionTime: state.lastManualSelectionTime
      }),
      // Setup proper rehydration with improved error handling
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log(`[workspaceStore] Store rehydrated with workspaces: ${state.workspaces?.length || 0}`);
          
          // Ensure consistency during rehydration
          if (state.manualSelectionActive && state.currentWorkspaceId) {
            // Reapply manual selection flags to session storage
            if (typeof window !== 'undefined') {
              window.sessionStorage.setItem('manual_workspace_switch', 'true');
              window.sessionStorage.setItem('workspace_last_switched', 
                state.lastManualSelectionTime?.toString() || Date.now().toString());
            }
          }
        } else {
          console.error('[workspaceStore] Failed to rehydrate store');
        }
      }
    }
  )
);

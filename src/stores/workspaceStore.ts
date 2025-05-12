// src/stores/workspaceStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Simplified workspace store following Carmack principles
 * 
 * This store follows a clear separation of concerns:
 * - SWR handles data fetching and caching of API workspace data
 * - Zustand ONLY handles UI state (which workspace is selected)
 */
export interface WorkspaceState {
  // UI Selection State
  currentWorkspaceId: string | null;
  lastSelectionTime: number;
  
  // Actions
  selectWorkspace: (workspaceId: string | null) => void;
}

/**
 * Create the workspace store
 * 
 * This store is intentionally minimal following Carmack's principle:
 * "The best code is no code at all, and the best feature is one you don't have to implement"
 */
export const useWorkspaceStore = create<WorkspaceState>()(
  // Persist the selected workspace ID in localStorage for cross-session retention
  persist(
    (set) => ({
      // State
      currentWorkspaceId: null,
      lastSelectionTime: 0,
      
      // Actions
      selectWorkspace: (workspaceId: string | null) => {
        console.log(`[workspaceStore] Selecting workspace: ${workspaceId}`);
        
        // Set the workspace ID and update the timestamp
        set({
          currentWorkspaceId: workspaceId,
          lastSelectionTime: Date.now()
        });
      }
    }),
    {
      name: 'workspace-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these keys (not everything)
      partialize: (state) => ({
        currentWorkspaceId: state.currentWorkspaceId,
      }),
    }
  )
);

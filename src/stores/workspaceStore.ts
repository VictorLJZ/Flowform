// src/stores/workspaceStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WorkspaceState {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (workspaceId: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  // Persist the selected workspace ID in localStorage
  persist(
    (set) => ({
      currentWorkspaceId: null,
      setCurrentWorkspaceId: (workspaceId) => {
        console.log(`[workspaceStore] Setting currentWorkspaceId: ${workspaceId}`);
        set({ currentWorkspaceId: workspaceId });
      },
    }),
    {
      name: 'current-workspace-storage', // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({ currentWorkspaceId: state.currentWorkspaceId }), // Only persist the ID
    }
  )
);

// Optional: Selector for convenience
export const selectCurrentWorkspaceId = (state: WorkspaceState) => state.currentWorkspaceId;

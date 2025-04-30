// src/stores/workspaceStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WorkspaceState } from '@/types/store-types';

export const useWorkspaceStore = create<WorkspaceState>()(
  // Persist the selected workspace ID in localStorage
  persist(
    (set) => ({
      currentWorkspaceId: null,
      setCurrentWorkspaceId: (workspaceId) => {
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

// Selector function moved to store-types.ts

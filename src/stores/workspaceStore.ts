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
}

export const useWorkspaceStore = create<WorkspaceState>()(
  // Persist the selected workspace ID in localStorage
  persist(
    (set) => ({
      currentWorkspaceId: null,
      workspaces: [],
      setCurrentWorkspaceId: (workspaceId) => {
        set({ currentWorkspaceId: workspaceId });
      },
      setWorkspaces: (workspaces) => {
        set({ workspaces });
      },
    }),
    {
      name: 'current-workspace-storage', // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({
        currentWorkspaceId: state.currentWorkspaceId,
        // Don't persist the full workspace data, just the ID
      })
    }
  )
);

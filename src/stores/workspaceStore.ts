import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Workspace } from '@/types/supabase-types'
import { getUserWorkspaces } from '@/services/workspace/getUserWorkspaces'
import { createWorkspace as createWorkspaceService } from '@/services/workspace/createWorkspace'

interface WorkspaceState {
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  isLoading: boolean
  error: string | null
  userId: string | null
  
  // Actions
  setCurrentWorkspace: (workspace: Workspace | null) => void
  setUserId: (userId: string) => void
  fetchWorkspaces: () => Promise<void>
  createWorkspace: (name: string, description?: string) => Promise<Workspace>
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      currentWorkspace: null,
      workspaces: [],
      isLoading: false,
      error: null,
      userId: null,

      setUserId: (userId) => {
        set({ userId })
      },

      setCurrentWorkspace: (workspace) => {
        set({ currentWorkspace: workspace })
      },

      createWorkspace: async (name: string, description?: string) => {
        const { userId } = get()
        if (!userId) {
          throw new Error('User ID not set')
        }

        try {
          set({ isLoading: true, error: null })
          const workspace = await createWorkspaceService({
            name,
            description: description || null,
            created_by: userId,
            logo_url: null,
            settings: null
          })
          
          // Update workspaces list and set as current
          const { workspaces } = get()
          set({ 
            workspaces: [...workspaces, workspace],
            currentWorkspace: workspace,
            isLoading: false 
          })
          
          return workspace
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create workspace',
            isLoading: false 
          })
          throw error
        }
      },

      fetchWorkspaces: async () => {
        const { userId } = get()
        if (!userId) {
          set({ error: 'User ID not set', isLoading: false })
          return
        }

        try {
          set({ isLoading: true, error: null })
          const workspaces = await getUserWorkspaces(userId)
          set({ workspaces, isLoading: false })
          
          // Set current workspace if none selected
          const { currentWorkspace } = get()
          if (!currentWorkspace && workspaces.length > 0) {
            set({ currentWorkspace: workspaces[0] })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch workspaces',
            isLoading: false 
          })
        }
      },
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({ 
        currentWorkspace: state.currentWorkspace,
        userId: state.userId 
      }),
    }
  )
) 
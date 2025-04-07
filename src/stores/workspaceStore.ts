import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Workspace } from '@/types/supabase-types'
import { getUserWorkspaces } from '@/services/workspace/getUserWorkspaces'
import { createWorkspace as createWorkspaceService } from '@/services/workspace/createWorkspace'
import { initializeDefaultWorkspace } from '@/services/workspace/initializeDefaultWorkspace'

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
  ensureDefaultWorkspace: () => Promise<void>
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
        console.log('[WorkspaceStore] Starting fetchWorkspaces')
        const { userId } = get()
        console.log('[WorkspaceStore] Current userId:', userId)
        
        if (!userId) {
          console.log('[WorkspaceStore] No userId set, aborting fetchWorkspaces')
          set({ error: 'User ID not set', isLoading: false })
          return
        }

        try {
          console.log('[WorkspaceStore] Setting loading state, fetching workspaces')
          set({ isLoading: true, error: null })
          const workspaces = await getUserWorkspaces(userId)
          console.log('[WorkspaceStore] Received workspaces:', workspaces)
          set({ workspaces, isLoading: false })
          
          // Set current workspace if none selected
          const { currentWorkspace } = get()
          console.log('[WorkspaceStore] Current workspace:', currentWorkspace)
          if (!currentWorkspace && workspaces.length > 0) {
            console.log('[WorkspaceStore] Setting first workspace as current:', workspaces[0])
            set({ currentWorkspace: workspaces[0] })
          }
        } catch (error) {
          console.error('[WorkspaceStore] Error in fetchWorkspaces:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch workspaces',
            isLoading: false 
          })
        }
      },
      
      ensureDefaultWorkspace: async () => {
        console.log('[WorkspaceStore] Starting ensureDefaultWorkspace')
        const { userId } = get()
        console.log('[WorkspaceStore] Current userId for ensureDefaultWorkspace:', userId)
        
        if (!userId) {
          console.log('[WorkspaceStore] No userId set, aborting ensureDefaultWorkspace')
          set({ error: 'User ID not set' })
          return
        }
        
        try {
          console.log('[WorkspaceStore] Setting loading state, initializing default workspace')
          set({ isLoading: true, error: null })
          const defaultWorkspace = await initializeDefaultWorkspace(userId)
          console.log('[WorkspaceStore] Default workspace result:', defaultWorkspace)
          
          if (defaultWorkspace) {
            console.log('[WorkspaceStore] Default workspace created/found, refreshing workspace list')
            // Refresh workspace list to include the new workspace
            await get().fetchWorkspaces()
          } else {
            console.log('[WorkspaceStore] No default workspace returned, might be an error')
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('[WorkspaceStore] Error in ensureDefaultWorkspace:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize default workspace',
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
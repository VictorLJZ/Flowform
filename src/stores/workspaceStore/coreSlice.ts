import { StateCreator } from 'zustand'
import { WorkspaceStore, CoreWorkspaceActions } from '@/types/store-types'
import { Workspace } from '@/types/supabase-types'
import { 
  getUserWorkspaces,
  createWorkspace as createWorkspaceService,
  updateWorkspace as updateWorkspaceService,
  deleteWorkspace as deleteWorkspaceService
} from '@/services/workspace'

export const createCoreSlice: StateCreator<
  WorkspaceStore,
  [],
  [],
  CoreWorkspaceActions & Pick<WorkspaceStore, 'currentWorkspace' | 'workspaces' | 'isLoading' | 'error'>
> = (set, get) => ({
  // State
  currentWorkspace: null,
  workspaces: [],
  isLoading: false,
  error: null,
  
  // Actions
  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace })
  },
  
  fetchWorkspaces: async () => {
    const { userId } = get()
    if (!userId) {
      set({ error: 'User ID not set' })
      return
    }
    
    try {
      set({ isLoading: true, error: null })
      const workspaces = await getUserWorkspaces(userId)
      set({ 
        workspaces,
        isLoading: false,
        // If current workspace is null or not in the list, set it to the first one
        currentWorkspace: get().currentWorkspace || workspaces[0] || null
      })
    } catch (error) {
      console.error('[WorkspaceStore] Error fetching workspaces:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch workspaces',
        isLoading: false
      })
    }
  },
  
  createWorkspace: async (name, description) => {
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
      console.error('[WorkspaceStore] Error creating workspace:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to create workspace',
        isLoading: false
      })
      throw error
    }
  },
  
  renameWorkspace: async (workspaceId, name) => {
    try {
      set({ isLoading: true, error: null })
      await updateWorkspaceService(workspaceId, { name })
      
      // Update the workspace in the workspaces list
      const { workspaces, currentWorkspace } = get()
      const updatedWorkspaces = workspaces.map(w => 
        w.id === workspaceId ? { ...w, name } : w
      )
      
      // Also update currentWorkspace if it's the one being renamed
      let updatedCurrentWorkspace = currentWorkspace
      if (currentWorkspace?.id === workspaceId) {
        updatedCurrentWorkspace = { ...currentWorkspace, name }
      }
      
      set({ 
        workspaces: updatedWorkspaces,
        currentWorkspace: updatedCurrentWorkspace,
        isLoading: false
      })
    } catch (error) {
      console.error('[WorkspaceStore] Error renaming workspace:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to rename workspace',
        isLoading: false
      })
    }
  },
  
  deleteWorkspace: async (workspaceId) => {
    try {
      set({ isLoading: true, error: null })
      await deleteWorkspaceService(workspaceId)
      
      // Remove the workspace from the workspaces list
      const { workspaces, currentWorkspace } = get()
      const updatedWorkspaces = workspaces.filter(w => w.id !== workspaceId)
      
      // If the deleted workspace was the current one, set current to the first available one
      let updatedCurrentWorkspace = currentWorkspace
      if (currentWorkspace?.id === workspaceId) {
        updatedCurrentWorkspace = updatedWorkspaces[0] || null
      }
      
      set({ 
        workspaces: updatedWorkspaces,
        currentWorkspace: updatedCurrentWorkspace,
        isLoading: false 
      })
    } catch (error) {
      console.error('[WorkspaceStore] Error deleting workspace:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to delete workspace',
        isLoading: false
      })
    }
  },
})

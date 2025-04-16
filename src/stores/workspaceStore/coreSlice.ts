import { StateCreator } from 'zustand'
import { WorkspaceStore, CoreWorkspaceActions } from '@/types/store-types'
// Workspace type is used in the store interface
import { 
  getUserWorkspacesClient,
  createWorkspace as createWorkspaceService,
  updateWorkspace as updateWorkspaceService,
  deleteWorkspace as deleteWorkspaceService
} from '@/services/workspace/client'
import { workspaceLog, stateLog } from '@/lib/debug-logger'

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
    workspaceLog('Setting current workspace', { 
      oldId: get().currentWorkspace?.id,
      newId: workspace?.id,
      newName: workspace?.name
    })
    set({ currentWorkspace: workspace })
    stateLog('Current workspace state updated', { currentWorkspaceId: workspace?.id })
  },
  
  fetchWorkspaces: async () => {
    const { userId, isLoading } = get()
    console.log('⭐ [WorkspaceStore] fetchWorkspaces called', { 
      userId, 
      isLoading: get().isLoading,
      timestamp: new Date().toISOString(),
      tabActive: typeof document !== 'undefined' ? document.visibilityState === 'visible' : 'unknown'
    })

    // Protect against duplicate fetches - don't allow multiple concurrent fetch operations
    if (isLoading) {
      console.log('⭐ [WorkspaceStore] Fetch already in progress, skipping redundant call')
      return
    }
    
    if (!userId) {
      console.log('⭐ [WorkspaceStore] No userId, aborting fetchWorkspaces')
      set({ error: 'User ID not set' })
      return
    }
    
    try {
      console.log('⭐ [WorkspaceStore] Setting isLoading = true')
      set({ isLoading: true, error: null })
      
      const workspaces = await getUserWorkspacesClient(userId)
      console.log('⭐ [WorkspaceStore] Workspaces fetched successfully', { 
        count: workspaces.length,
        workspaceIds: workspaces.map(w => w.id),
        timestamp: new Date().toISOString()
      })
      
      // Even if tab is not visible, we should still update the state
      // This ensures consistency when the user switches back to the tab
      
      console.log('⭐ [WorkspaceStore] Setting isLoading = false and updating workspaces')
      
      // Determine current workspace - maintain current selection if it exists in the fetched workspaces
      const currentWorkspace = get().currentWorkspace
      const currentExists = currentWorkspace && workspaces.some(w => w.id === currentWorkspace.id)
      const newCurrentWorkspace = currentExists ? currentWorkspace : (workspaces[0] || null)
      
      // Important: Make sure to update workspaces array with ALL fetched workspaces
      set({ 
        workspaces: [...workspaces], // Create new array to ensure state update is detected
        isLoading: false,
        currentWorkspace: newCurrentWorkspace
      })
      
      console.log('⭐ [WorkspaceStore] State after update', {
        isLoading: get().isLoading,
        currentWorkspaceId: get().currentWorkspace?.id,
        workspacesCount: get().workspaces.length,
        allWorkspaceIds: get().workspaces.map(w => w.id)
      })
    } catch (error) {
      console.error('⭐ [WorkspaceStore] Error fetching workspaces:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch workspaces',
        isLoading: false
      })
      console.log('⭐ [WorkspaceStore] Set isLoading = false after error')
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
      console.error('[WorkspaceStore] Error creating workspace:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to create workspace',
        isLoading: false
      })
      throw error
    }
  },
  
  renameWorkspace: async (workspaceId, name) => {
    workspaceLog('Renaming workspace', { workspaceId, newName: name })
    
    try {
      // 0. Ensure auth is stable before proceeding
      // This prevents operations during auth state transitions
      const { useAuthStore } = await import('@/stores/authStore')
      await useAuthStore.getState().ensureStableAuth()
      
      // 1. Get current state for potential rollback
      const { workspaces, currentWorkspace } = get()
      
      // 2. Apply optimistic update to local state immediately
      const updatedWorkspaces = workspaces.map(w => 
        w.id === workspaceId ? { ...w, name } : w
      )
      
      // Also update currentWorkspace if it's the one being renamed
      let updatedCurrentWorkspace = currentWorkspace
      if (currentWorkspace?.id === workspaceId) {
        updatedCurrentWorkspace = { ...currentWorkspace, name }
      }
      
      // 3. Set the optimistic update to the UI
      set({ 
        workspaces: updatedWorkspaces,
        currentWorkspace: updatedCurrentWorkspace,
        isLoading: true, 
        error: null 
      })
      
      // 4. Make the actual API call
      await updateWorkspaceService(workspaceId, { name })
      
      // 5. Update loading state since the API call completed successfully
      workspaceLog('Workspace renamed successfully', { 
        workspaceId,
        name
      })
      
      // 6. Update loading state to false
      set({ isLoading: false })
      
    } catch (error) {
      // 7. If the API call fails, we need to revert to the original state
      const errorMessage = error instanceof Error ? error.message : 'Failed to rename workspace'
      workspaceLog('Error renaming workspace', { workspaceId, error: errorMessage })
      console.error('[WorkspaceStore] Error renaming workspace:', error)
      
      // 8. Re-fetch workspaces to ensure our state is consistent with the database
      try {
        // Silently refetch workspaces to sync with server state
        await get().fetchWorkspaces()
      } catch (fetchError) {
        // Ignore fetch errors, we already have the main error to show
        console.warn('Error syncing workspaces after rename failure:', fetchError)
      }
      
      // 9. Set error state
      set({
        error: errorMessage,
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

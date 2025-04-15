import { StateCreator } from 'zustand'
import { WorkspaceStore, MembershipActions } from '@/types/store-types'
import {
  initializeDefaultWorkspace,
  leaveWorkspace as leaveWorkspaceService
} from '@/services/workspace'

export const createMembershipSlice: StateCreator<
  WorkspaceStore,
  [],
  [],
  MembershipActions & Pick<WorkspaceStore, 'userId' | 'userEmail'>
> = (set, get) => ({
  // State
  userId: null,
  userEmail: null,
  
  // Actions
  setUserId: (userId) => {
    set({ userId })
  },
  
  setUserEmail: (email) => {
    set({ userEmail: email })
  },
  
  ensureDefaultWorkspace: async () => {
    const { userId, workspaces, fetchWorkspaces } = get()
    
    if (!userId) {
      throw new Error('User ID not set')
    }
    
    // First check if we already have workspaces loaded
    if (workspaces.length === 0) {
      // If not, try to fetch them first
      await fetchWorkspaces()
    }
    
    const { workspaces: currentWorkspaces } = get()
    
    // If after fetching we still have no workspaces, create a default one
    if (currentWorkspaces.length === 0) {
      try {
        set({ isLoading: true, error: null })
        const defaultWorkspace = await initializeDefaultWorkspace(userId)
        
        if (!defaultWorkspace) {
          throw new Error('Failed to create default workspace')
        }
        
        // Update state with the new workspace
        set({ 
          workspaces: [defaultWorkspace],
          currentWorkspace: defaultWorkspace,
          isLoading: false
        })
      } catch (error) {
        console.error('[WorkspaceStore] Error creating default workspace:', error)
        set({
          error: error instanceof Error ? error.message : 'Failed to create default workspace',
          isLoading: false
        })
      }
    }
  },
  
  leaveWorkspace: async (workspaceId) => {
    const { userId, workspaces, currentWorkspace, fetchWorkspaces } = get()
    
    if (!userId) {
      throw new Error('User ID not set')
    }
    
    try {
      set({ isLoading: true, error: null })
      await leaveWorkspaceService(workspaceId)
      
      // Remove the workspace from the workspaces list
      const updatedWorkspaces = workspaces.filter(w => w.id !== workspaceId)
      
      // If the workspace we left was the current one, set current to the first available one
      let updatedCurrentWorkspace = currentWorkspace
      if (currentWorkspace?.id === workspaceId) {
        updatedCurrentWorkspace = updatedWorkspaces[0] || null
      }
      
      set({ 
        workspaces: updatedWorkspaces,
        currentWorkspace: updatedCurrentWorkspace,
        isLoading: false 
      })
      
      // If we have no workspaces left, refresh the list (in case we were added to others)
      if (updatedWorkspaces.length === 0) {
        await fetchWorkspaces()
      }
    } catch (error) {
      console.error('[WorkspaceStore] Error leaving workspace:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to leave workspace',
        isLoading: false
      })
    }
  },
})

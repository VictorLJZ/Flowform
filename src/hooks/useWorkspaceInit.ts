import { useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useWorkspaceStore } from '@/stores/workspaceStore'

/**
 * Hook to sync auth state with workspace store and ensure a default workspace exists
 * Should be used in a high-level component like a layout
 */
export function useWorkspaceInit() {
  const { user, isLoading: authLoading } = useAuth()
  const { 
    setUserId, 
    ensureDefaultWorkspace, 
    fetchWorkspaces,
    isLoading: workspaceLoading
  } = useWorkspaceStore()

  // Set the user ID in the workspace store when auth state changes
  useEffect(() => {
    if (!authLoading && user) {
      // Update the user ID in the workspace store
      setUserId(user.id)
      
      // First fetch existing workspaces
      fetchWorkspaces().then(() => {
        // Then ensure the user has at least one workspace
        ensureDefaultWorkspace()
      })
    }
  }, [user, authLoading, setUserId, fetchWorkspaces, ensureDefaultWorkspace])

  return {
    isInitializing: authLoading || workspaceLoading
  }
}

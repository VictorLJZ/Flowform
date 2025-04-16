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
    // fetchWorkspaces removed as it was unused
    isLoading: workspaceLoading
  } = useWorkspaceStore()

  // Set the user ID in the workspace store when auth state changes
  useEffect(() => {
    if (!authLoading && user) {
      setUserId(user.id)
      // Only call ensureDefaultWorkspace, which will handle checking for existing workspaces internally
      ensureDefaultWorkspace()
    }
  }, [user, authLoading, setUserId, ensureDefaultWorkspace])

  return {
    isInitializing: authLoading || workspaceLoading
  }
}

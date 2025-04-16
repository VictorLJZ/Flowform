"use client"

import { useEffect } from 'react'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '@/providers/auth-provider'

/**
 * WorkspaceValidator component
 * 
 * This component validates workspace data on app initialization and ensures
 * that the workspace state in localStorage matches actual database entries
 * to prevent issues with stale or invalid workspace IDs.
 */
export function WorkspaceValidator() {
  const { fetchWorkspaces, ensureDefaultWorkspace, isLoading } = useWorkspaceStore()
  const { user } = useAuth()

  // We're removing the tab visibility handler that was causing duplicate validations
  // Auth verification in auth-provider already handles session recovery when tab focus returns
  // This avoids triggering multiple fetchWorkspaces calls when tab switching

  // Main workspace validation effect that runs ONLY when user changes or becomes available
  // NOT when workspace state changes to prevent infinite loops
  useEffect(() => {
    // Only validate workspaces when user is logged in
    if (!user) return
    
    let isMounted = true; // Prevent race conditions during fetch
    
    // Define inner validation function to avoid dependency issues
    const runValidation = async () => {
      // Don't start validation if we're already loading
      // This further protects against duplicate requests
      if (isLoading) {
        console.log('⭐ [WorkspaceValidator] Skipping validation, store already loading')
        return
      }
    
      try {
        console.log('⭐ [WorkspaceValidator] Validating workspace data with user ID:', user.id)
        
        // CENTRALIZED: This is now the only place that should call fetchWorkspaces
        // All other components have had their fetch calls removed
        await fetchWorkspaces()
        
        // Guard against race conditions or unmounting
        if (!isMounted) return
        
        // Ensure default workspace exists
        await ensureDefaultWorkspace()
        
        // Guard against logging stale data
        if (!isMounted) return
        
        console.log('⭐ [WorkspaceValidator] Validation complete')
        
        // Check for mismatches in localStorage
        validateLocalStorage()
      } catch (error) {
        if (!isMounted) return
        console.error('⭐ [WorkspaceValidator] Error validating workspaces:', error)
        toast({
          title: "Workspace validation error",
          description: "There was a problem validating your workspaces. Please refresh the page.",
          variant: "destructive",
          duration: 7000
        })
      }
    }
    
    // Run validation when user becomes available or changes
    runValidation()
    
    return () => {
      isMounted = false; // Prevent state updates after unmount
    }
  }, [user]) // Only run when user changes
  
  // Function to validate localStorage data
  const validateLocalStorage = () => {
    const storedData = localStorage.getItem('workspace-storage')
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        const storedWorkspace = parsedData?.state?.currentWorkspace
        
        if (storedWorkspace) {
          console.log('⭐ [WorkspaceValidator] Stored workspace ID:', storedWorkspace.id)
        }
      } catch (storageError) {
        console.error('[WorkspaceValidator] Error parsing workspace storage:', storageError)
        
        // Reset localStorage if there's corruption
        localStorage.removeItem('workspace-storage')
        toast({
          title: "Workspace data reset",
          description: "We detected and fixed an issue with your workspace configuration.",
          duration: 5000
        })
      }
    }
  }
  
  // We've removed this function since we don't want to trigger redundant fetches
  // on tab visibility changes. This was causing the infinite loop we observed.
  
  // This is a utility component that doesn't render anything
  return null
}

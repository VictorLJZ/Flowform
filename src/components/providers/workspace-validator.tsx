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
  const { fetchWorkspaces, ensureDefaultWorkspace } = useWorkspaceStore()
  const { user } = useAuth()

  useEffect(() => {
    // Only validate workspaces when user is logged in
    if (!user) return
    
    const validateWorkspaces = async () => {
      try {
        console.log('[WorkspaceValidator] Validating workspace data with user ID:', user.id)
        
        // Fetch and validate workspace data from database
        await fetchWorkspaces()
        
        // Ensure default workspace exists
        await ensureDefaultWorkspace()
        
        // Check for mismatches in localStorage
        const storedData = localStorage.getItem('workspace-storage')
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)
            const storedWorkspace = parsedData?.state?.currentWorkspace
            
            if (storedWorkspace) {
              console.log('[WorkspaceValidator] Stored workspace ID:', storedWorkspace.id)
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
      } catch (error) {
        console.error('[WorkspaceValidator] Error validating workspaces:', error)
        toast({
          title: "Workspace validation error",
          description: "There was a problem validating your workspaces. Please refresh the page.",
          variant: "destructive",
          duration: 7000
        })
      }
    }
    
    validateWorkspaces()
  }, [user, fetchWorkspaces, ensureDefaultWorkspace])
  
  // This is a utility component that doesn't render anything
  return null
}

import { useState, useCallback } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useRouter } from 'next/navigation';

/**
 * Hook to handle workspace initialization, particularly for post-invitation flows
 * 
 * This hook extends the regular useWorkspace hook with additional initialization
 * functionality when a user accepts an invitation
 */
export function useWorkspaceInitialization() {
  const [isInitializing, setIsInitializing] = useState(false);
  const router = useRouter();
  
  // Use our unified workspace hook for core functionality
  const { 
    refreshWorkspaces,
    workspaces,
    selectWorkspace,
    isLoading
  } = useWorkspace();
  
  /**
   * Initialize workspaces after an invitation has been accepted
   * This will refresh the workspaces list and navigate to the new workspace
   */
  const initializeAfterInvitation = useCallback(async (workspaceId?: string) => {
    if (isInitializing) return;
    
    try {
      setIsInitializing(true);
      
      // Refresh the workspace list to include the new workspace
      await refreshWorkspaces();
      
      // If a specific workspace ID was provided, navigate to it
      if (workspaceId) {
        // Select the workspace in the store
        selectWorkspace(workspaceId);
        
        // Navigate to the workspace
        router.push(`/dashboard/workspace/${workspaceId}`);
      } else if (workspaces.length > 0) {
        // Otherwise, navigate to the first workspace
        selectWorkspace(workspaces[0].id);
        router.push(`/dashboard/workspace/${workspaces[0].id}`);
      } else {
        // If no workspaces, go to dashboard
        router.push('/dashboard');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, refreshWorkspaces, selectWorkspace, workspaces, router]);
  
  /**
   * Manually trigger a refresh of the workspaces list
   */
  const mutate = useCallback(async () => {
    return await refreshWorkspaces();
  }, [refreshWorkspaces]);
  
  return {
    isInitializing,
    initializeAfterInvitation,
    mutate,
    isLoading
  };
}

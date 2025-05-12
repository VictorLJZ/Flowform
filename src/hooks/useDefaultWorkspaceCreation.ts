import { useState, useEffect } from 'react';
import { initializeDefaultWorkspace } from '@/services/workspace/client';
import { ApiWorkspace } from '@/types/workspace';
import { User } from '@/types/auth-types';

/**
 * Hook to handle default workspace creation for new users
 * 
 * Following Carmack's principle of simplicity and clarity:
 * - Only creates a workspace when needed
 * - Clean error handling
 * - Focused on a single responsibility
 */
export function useDefaultWorkspaceCreation(
  user: User | null,
  workspaces: ApiWorkspace[] | undefined,
  mutateWorkspaces: (data?: ApiWorkspace[] | Promise<ApiWorkspace[]> | ((current: ApiWorkspace[] | undefined) => ApiWorkspace[] | undefined) | undefined) => Promise<ApiWorkspace[] | undefined>,
  selectWorkspace: (id: string) => void
) {
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Only run for authenticated users with no workspaces
    if (!user || !user.id || isCreating || (workspaces && workspaces.length > 0)) {
      return;
    }
    
    // If data is loaded and there are no workspaces, create a default one
    if (workspaces && workspaces.length === 0) {
      console.log('[useDefaultWorkspaceCreation] No workspaces found, creating default workspace');
      setIsCreating(true);
      
      // Create default workspace with proper TypeScript-friendly promise chain
      initializeDefaultWorkspace(user.id)
        .then(workspace => {
          if (!workspace) {
            throw new Error('Failed to create default workspace');
          }
          console.log('[useDefaultWorkspaceCreation] Default workspace created:', workspace.name);
          
          // First mutate the workspace list to include our new workspace
          return { workspace, mutatePromise: mutateWorkspaces(currentWorkspaces => {
            // Identity function that just returns the current workspaces
            // SWR will handle the revalidation
            return currentWorkspaces;
          })};
        })
        .then(({ workspace, mutatePromise }) => {
          // Wait for the mutation to complete
          return mutatePromise.then(() => workspace);
        })
        .then(workspace => {
          // Now select the workspace and update the UI state
          selectWorkspace(workspace.id);
          setIsCreating(false);
        })
        .catch(error => {
          console.error('[useDefaultWorkspaceCreation] Error creating default workspace:', error);
          setIsCreating(false);
        });
    }
  }, [workspaces, user, isCreating, mutateWorkspaces, selectWorkspace]);

  return { isCreating };
}

import { getUserWorkspacesClient } from '@/services/workspace/client'
import { useAuthSession } from '@/hooks/useAuthSession'
import useSWR from 'swr'
import { ApiWorkspace } from '@/types/workspace'

/**
 * Fetches the current user's workspaces using the authenticated user from useAuthSession.
 * 
 * Note: This hook is different from other workspace hooks because it fetches workspaces
 * for a user, rather than data within a workspace. Therefore it uses the standard SWR hook
 * instead of the workspace-aware SWR hook.
 */
export function useWorkspaces() {
  // Get user and loading state from the SWR auth hook
  const { user, isLoading: isLoadingAuth } = useAuthSession();
  const userId = user?.id; // Get userId from the session user

  // SWR key depends on userId being available
  const key = userId ? ['userWorkspaces', userId] : null;

  // Fetcher function defined with explicit typing
  const fetcher = async ([, uid]: [string, string]): Promise<ApiWorkspace[]> => {

    return await getUserWorkspacesClient(uid);
  };

  const {
    data,
    error,
    isLoading: isLoadingWorkspaces,
    mutate
  } = useSWR<ApiWorkspace[]>(key, fetcher, {
     // Keep previous data while revalidating
     keepPreviousData: true,
     // Deduplicate requests within 5 seconds
     dedupingInterval: 5000,
     // Standard error handling
     onError: (err) => {
       console.error('Error fetching workspaces:', err);
     }
  });

  // Combine loading states: Loading if auth is loading OR workspaces are loading
  const isLoading = isLoadingAuth || isLoadingWorkspaces;

  return {
    workspaces: data ?? [],
    error,
    isLoading, // Return combined loading state
    mutate
  };
}

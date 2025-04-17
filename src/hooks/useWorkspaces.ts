import useSWR from 'swr'
import { getUserWorkspacesClient } from '@/services/workspace/client'
import { useAuthSession } from '@/hooks/useAuthSession'

/**
 * Fetches the current user's workspaces using the authenticated user from useAuthSession.
 */
export function useWorkspaces() {
  // Get user and loading state from the SWR auth hook
  const { user, isLoading: isLoadingAuth } = useAuthSession();
  const userId = user?.id; // Get userId from the session user

  // SWR key depends on userId being available
  const key = userId ? ['workspaces', userId] : null;

  // Fetcher remains the same, takes userId from the key
  const fetcher = async ([, uid]: [string, string]) => {
    console.log(`[useWorkspaces] Fetching workspaces for user: ${uid}`);
    return await getUserWorkspacesClient(uid);
  };

  const {
    data,
    error,
    isLoading: isLoadingWorkspaces, // Loading state specifically for workspace fetching
    mutate
  } = useSWR(key, fetcher, {
     // Optional: Keep previous data while revalidating
     keepPreviousData: true,
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

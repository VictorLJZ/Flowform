import { useEffect, useRef } from 'react';
import { useAuthSession } from './useAuthSession';
import { getUserWorkspacesClient } from '@/services/workspace/client';
import { Workspace } from '@/types/supabase-types';
import useSWR from 'swr';

/**
 * Hook to ensure user has at least one workspace
 * Automatically initializes a default workspace if none exists
 */
export function useWorkspaceInitialization() {
  const { user, isLoading: isAuthLoading } = useAuthSession();
  const initializationRan = useRef(false);

  // Key for workspaces SWR cache - only valid when we have a user
  const workspacesSWRKey = user ? `workspaces-${user.id}` : null;

  // Fetch workspaces using SWR - with aggressive optimization settings
  const { data: workspaces, mutate: mutateWorkspaces, isLoading: isWorkspacesLoading, error } = useSWR<Workspace[]>(
    workspacesSWRKey,
    async () => user ? await getUserWorkspacesClient(user.id) : [],
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 60 seconds
      focusThrottleInterval: 60000, // 60 seconds
      errorRetryCount: 1, // Minimal retries
      keepPreviousData: true,
      loadingTimeout: 3000, // Lower timeout for loading state
    }
  );

  // Since we moved initialization to the auth callback,
  // this hook just ensures we have workspace data loaded
  useEffect(() => {
    if (!user || !workspaces || initializationRan.current) return;
    
    // Mark that we've checked for workspaces
    initializationRan.current = true;

    // If we somehow still have no workspaces after auth callback ran,
    // trigger a revalidation of the workspace data - but don't create any
    if (workspaces.length === 0) {
      // Just refresh the data once
      mutateWorkspaces();
    }
  }, [user, workspaces, mutateWorkspaces]);

  return {
    workspaces,
    isLoading: isAuthLoading || isWorkspacesLoading || (!!user && !workspaces),
    error,
    mutate: mutateWorkspaces,
  };
}

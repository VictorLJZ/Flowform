import { getWorkspaceClient, updateWorkspace, deleteWorkspace, leaveWorkspace } from '@/services/workspace/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuth } from '@/providers/auth-provider';
import type { Workspace } from '@/types/supabase-types';
import { createWorkspaceFetcher, useWorkspaceSWR } from './swr';

/**
 * Hook to fetch and manage a single workspace via SWR, dependent on auth session.
 */
export function useCurrentWorkspace(workspaceId: string | null | undefined) {
  // Use the auth session hook to check if user is loaded/authenticated
  const { user, isLoading: isLoadingAuth } = useAuthSession();
  // Use the auth hook to get the Supabase client instance
  const { supabase } = useAuth(); 

  // Create a workspace-specific fetcher that doesn't use the generic workspace pattern
  // This hook is unique because it fetches the workspace itself rather than resources within a workspace
  const workspaceFetcher = createWorkspaceFetcher(async (wsId: string) => {
    console.log(`[useCurrentWorkspace] Fetching details for workspace: ${wsId}`);
    return await getWorkspaceClient(wsId);
  });

  // Special case: We need user to be authenticated to fetch workspace details
  // If no user is available, don't trigger the fetch
  const shouldFetch = !!user;

  const {
    data,
    error,
    isLoading: isLoadingWorkspace,
    mutate
  } = useWorkspaceSWR<Workspace | null>(
    'currentWorkspace',
    workspaceFetcher,
    {
      keepPreviousData: true, // Keep showing old name while new one loads
      // Don't fetch if user is not available
      isPaused: () => !shouldFetch,
    },
    workspaceId // Pass explicit workspaceId
  );

  // Combine loading states
  const isLoading = isLoadingAuth || isLoadingWorkspace;

  // Mutation functions now use the authenticated client from useAuth
  const rename = async (name: string) => {
    if (!workspaceId) throw new Error('Workspace ID is required');
    if (!supabase) throw new Error('Supabase client is not available');
    // Pass the authenticated client as the first argument
    await updateWorkspace(supabase, workspaceId, { name }); 
    return mutate(); // Revalidate after update
  };

  const remove = async () => {
    if (!workspaceId) throw new Error('Workspace ID is required');
    if (!supabase) throw new Error('Supabase client is not available');
    // Pass only workspaceId as deleteWorkspace expects one argument
    await deleteWorkspace(workspaceId); 
    // Optionally redirect or clear selection after delete
    return mutate(); // Revalidate (will likely result in null data)
  };

  const leave = async () => {
    if (!workspaceId) throw new Error('Workspace ID is required');
    if (!supabase) throw new Error('Supabase client is not available');
    // Pass only workspaceId as leaveWorkspace expects one argument
    await leaveWorkspace(workspaceId); 
    // Optionally redirect or clear selection after leave
    return mutate(); // Revalidate
  };

  return {
    workspace: data,
    error,
    isLoading, // Combined loading state
    rename,
    remove,
    leave,
    mutate,
  };
}

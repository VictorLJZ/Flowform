import useSWR from 'swr';
import { getWorkspaceClient, updateWorkspace, deleteWorkspace, leaveWorkspace } from '@/services/workspace/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuth } from '@/providers/auth-provider';
import type { Workspace } from '@/types/supabase-types';

const FETCH_KEY = 'currentWorkspace';

/**
 * Hook to fetch and manage a single workspace via SWR, dependent on auth session.
 */
export function useCurrentWorkspace(workspaceId: string | null | undefined) {
  // Use the auth session hook to check if user is loaded/authenticated
  const { user, isLoading: isLoadingAuth } = useAuthSession();
  // Use the auth hook to get the Supabase client instance
  const { supabase } = useAuth(); 

  // SWR key depends on having a workspaceId AND the user session being loaded (user is not null)
  const key = workspaceId && user ? [FETCH_KEY, workspaceId] : null;

  const fetcher = async ([, id]: [string, string]) => {
    console.log(`[useCurrentWorkspace] Fetching details for workspace: ${id}`);
    return await getWorkspaceClient(id);
  };

  const {
    data,
    error,
    isLoading: isLoadingWorkspace, // Loading state for this specific fetch
    mutate
  } = useSWR<Workspace | null>(key, fetcher, {
     keepPreviousData: true, // Keep showing old name while new one loads
  });

  // Combine loading states
  const isLoading = isLoadingAuth || isLoadingWorkspace;

  // Mutation functions now use the authenticated client from useAuth
  const rename = async (name: string) => {
    if (!workspaceId) throw new Error('Workspace ID is required');
    if (!supabase) throw new Error('Supabase client is not available'); // Add check for client
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

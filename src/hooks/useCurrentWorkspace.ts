import { getWorkspaceClient, updateWorkspace, leaveWorkspace } from '@/services/workspace/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuth } from '@/providers/auth-provider';
import type { Workspace } from '@/types/supabase-types';
import { createWorkspaceFetcher, useWorkspaceSWR } from './swr';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useWorkspaces } from './useWorkspaces';
import { useWorkspaceDeletion } from './useWorkspaceDeletion';

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

  // Get access to the shared stores and mutation methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const workspaceStore = useWorkspaceStore();
  const { mutate: mutateWorkspacesList } = useWorkspaces();
  
  // Mutation functions now use the authenticated client from useAuth
  const rename = async (name: string) => {
    if (!workspaceId) throw new Error('Workspace ID is required');
    if (!supabase) throw new Error('Supabase client is not available');
    // Pass the authenticated client as the first argument
    await updateWorkspace(supabase, workspaceId, { name }); 
    return mutate(); // Revalidate after update
  };
  
  // Use the enhanced workspace deletion hook
  const { deleteWorkspace } = useWorkspaceDeletion();
  
  const remove = async () => {
    if (!workspaceId) throw new Error('Workspace ID is required');
    if (!supabase) throw new Error('Supabase client is not available');
    
    try {
      // Use the enhanced deleteWorkspace function from the hook
      // This handles all the logic for selecting a new workspace or creating a default one
      // NOTE: Our implementation in useWorkspaceDeletion will handle the redirect
      // and workspace selection through a page refresh with URL parameters
      const result = await deleteWorkspace(workspaceId);
      
      // These mutations won't actually complete in most cases since the page will refresh,
      // but we include them for completeness in case the redirect is delayed
      await mutateWorkspacesList();
      await mutate(null);
      
      return result;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    }
  };
  
  const leave = async () => {
    if (!workspaceId) throw new Error('Workspace ID is required');
    if (!supabase) throw new Error('Supabase client is not available');
    
    try {
      // Leave the workspace
      await leaveWorkspace(workspaceId);
      
      // Force refresh the workspaces list to get updated memberships
      await mutateWorkspacesList();
      
      // Force mutation of the current workspace data (will return error since no longer a member)
      // This is important for the UI to update properly
      await mutate(null);
      
      return { success: true };
    } catch (error) {
      console.error('Error leaving workspace:', error);
      throw error;
    }
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

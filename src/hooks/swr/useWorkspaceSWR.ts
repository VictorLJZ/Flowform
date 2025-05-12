import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useWorkspace } from '@/providers/workspace-provider';
import { toast } from '@/components/ui/use-toast';
import { SWRErrorResponse, isSWRErrorResponse } from '@/types/workspace-swr-types';

/**
 * Create a SWR key that includes workspace context
 * 
 * @param resource - The resource identifier (e.g., 'forms', 'dashboardData')
 * @param workspaceId - Optional explicit workspace ID (overrides the current workspace from store)
 * @param params - Additional parameters to include in the key
 * @returns SWR key with workspace context or null if no workspace is available
 */
export function createWorkspaceKey(
  resource: string, 
  workspaceId?: string | null,
  ...params: unknown[]
): [string, string, ...unknown[]] | null {
  // If explicit workspaceId is provided, use it
  const wsId = workspaceId !== undefined ? workspaceId : useWorkspaceStore.getState().currentWorkspaceId;
  
  // Only create a key if we have a valid workspace ID
  if (!wsId) {
    console.warn(`[createWorkspaceKey] No workspace ID available for resource: ${resource}`);
    return null;
  }
  
  return [resource, wsId, ...params];
}

/**
 * Type for workspace-aware fetcher functions
 * The fetcher receives an array where the first item is the resource name
 * and the second item is the workspace ID
 */
export type WorkspaceFetcher<Data> = (key: [string, string, ...unknown[]]) => Promise<Data>;

/**
 * Default error handler for workspace-related errors
 */
export function handleWorkspaceError(error: Error | SWRErrorResponse, resourceName: string): void {
  console.error(`[WorkspaceSWR] Error fetching ${resourceName}:`, error);
  
  // Determine if this is a workspace access error
  const isPermissionError = 
    (isSWRErrorResponse(error) && error.status === 403) || 
    (error.message && (error.message.includes('permission') || error.message.includes('access')));
  
  if (isPermissionError) {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: `You don't have permission to access this ${resourceName}.`
    });
  } else {
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to load ${resourceName}. Please try again.`
    });
  }
}

/**
 * Hook that provides workspace-aware data fetching with SWR
 * Automatically includes the current workspace ID in the request
 * 
 * @param resource - The resource identifier (e.g., 'forms', 'dashboardData')
 * @param fetcher - Fetcher function that receives the full key including workspace ID
 * @param options - Standard SWR configuration options
 * @param explicitWorkspaceId - Optional explicit workspace ID to use instead of the current one
 * @returns SWR response with the fetched data
 */
export function useWorkspaceSWR<Data, Error = SWRErrorResponse>(
  resource: string,
  fetcher: WorkspaceFetcher<Data>,
  options?: SWRConfiguration,
  explicitWorkspaceId?: string | null
): SWRResponse<Data, Error> & { workspaceId: string | null } {
  // Get available workspaces from SWR
  const { workspaces } = useWorkspace();
  const isInitialLoad = !workspaces || workspaces.length === 0;
  
  // Use explicit workspace ID if provided, otherwise get from store
  const storeWorkspaceId = useWorkspaceStore(state => state.currentWorkspaceId);
  const workspaceId = explicitWorkspaceId !== undefined ? explicitWorkspaceId : storeWorkspaceId;
  
  // Validate the workspace ID is valid before attempting to fetch
  const isWorkspaceValid = workspaceId && 
    workspaces?.some(w => w.id === workspaceId);
  
  // Skip fetching in these cases:
  // 1. If we have a workspace ID but it's not in the available workspaces
  // 2. If we're in the initial loading state but trying to use a workspace ID from localStorage
  const shouldSkipFetch = 
    (!!workspaceId && !isWorkspaceValid && workspaces && workspaces.length > 0) || 
    (isInitialLoad && !!workspaceId && !explicitWorkspaceId);
  
  // Create the key with workspace context
  const key = shouldSkipFetch ? null : createWorkspaceKey(resource, workspaceId);
  
  // SWR request with optional configuration
  const response = useSWR<Data, Error>(key, fetcher, {
    // Some sensible defaults for workspace data
    revalidateOnFocus: true,
    revalidateIfStale: true,
    keepPreviousData: true,
    dedupingInterval: 5000, // Deduplicate requests within 5 seconds
    onError: (err: unknown) => {
      // If workspace is invalid but we got past the key check, prevent error message
      if (shouldSkipFetch) {
        console.warn(`[WorkspaceSWR] Skipping error for invalid workspace: ${workspaceId}`);
        return;
      }
      // Ensure we're passing an Error object to the handler
      if (err instanceof Error) {
        handleWorkspaceError(err, resource);
      } else {
        // Create a standard error if we received something else
        handleWorkspaceError(new Error(String(err)), resource);
      }
    },
    ...options,
  });
  
  // Return the SWR response along with the workspaceId for convenience
  return {
    ...response,
    workspaceId
  };
}

/**
 * Factory function that creates a workspace-aware fetcher
 * The returned fetcher automatically extracts the workspace ID from the key
 * 
 * @param fetchFn - Function that accepts a workspace ID and optional parameters and returns a promise
 * @returns A workspace-aware fetcher function compatible with useWorkspaceSWR
 */
export function createWorkspaceFetcher<Data, Params extends unknown[] = []>(
  fetchFn: (workspaceId: string, ...params: Params) => Promise<Data>
): WorkspaceFetcher<Data> {
  // Using proper type for params in the returned function
  return async ([resource, workspaceId, ...rest]: [string, string, ...unknown[]]): Promise<Data> => {
    console.log(`[WorkspaceFetcher:${resource}] Fetching with workspace: ${workspaceId}`);
    // Cast rest to Params since we're controlling how this function is called
    return await fetchFn(workspaceId, ...(rest as unknown as Params));
  };
}

import { useEffect, useRef } from 'react';
import { useAuthSession } from './useAuthSession';
import { getUserWorkspacesClient, initializeDefaultWorkspace } from '@/services/workspace/client';
import { ApiWorkspace } from '@/types/workspace';
import useSWR from 'swr';
import { useWorkspaceStore } from '@/stores/workspaceStore';

/**
 * Hook to ensure user has at least one workspace and that workspace selection is properly initialized
 * 
 * Following the Carmack philosophy of simplicity and clarity:
 * - SWR handles workspace data fetching and caching
 * - Zustand only handles UI selection state
 * - Creates a default workspace if none exists
 * - Ensures workspace selection is valid
 */
export function useWorkspaceInitialization() {
  const { user, isLoading: isAuthLoading } = useAuthSession();
  const selectWorkspace = useWorkspaceStore(state => state.selectWorkspace);
  const currentWorkspaceId = useWorkspaceStore(state => state.currentWorkspaceId);
  
  // Track initialization state
  const initializationRan = useRef(false);
  const creatingWorkspace = useRef(false);

  // Key for workspaces SWR cache - only valid when we have a user
  const workspacesSWRKey = user ? `workspaces-${user.id}` : null;

  // Fetch workspaces using SWR
  const { 
    data: workspaces, 
    mutate: mutateWorkspaces, 
    isLoading: isWorkspacesLoading, 
    error 
  } = useSWR<ApiWorkspace[]>(
    workspacesSWRKey,
    async () => user ? await getUserWorkspacesClient(user.id) : [],
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      focusThrottleInterval: 10000,
      errorRetryCount: 3,
      keepPreviousData: true, 
      loadingTimeout: 3000,
      onSuccess: (data) => {
        console.log('[useWorkspaceInitialization] Successfully fetched workspaces:', {
          count: data?.length || 0,
          currentWorkspaceId,
        });
        
        // If no workspace is selected but we have workspaces, select the first one
        if (data && Array.isArray(data) && data.length > 0 && !currentWorkspaceId) {
          console.log('[useWorkspaceInitialization] No workspace selected, selecting first one:', data[0].id);
          selectWorkspace(data[0].id);
        }
      }
    }
  );
  
  // Initialize default workspace if needed
  useEffect(() => {
    // Skip if: still loading, no user, already checking, or already ran initialization
    if (isWorkspacesLoading || !user || creatingWorkspace.current || initializationRan.current) {
      return;
    }
    
    const handleWorkspaceInitialization = async () => {
      // If user has no workspaces, create a default one
      if (workspaces && workspaces.length === 0 && !creatingWorkspace.current) {
        creatingWorkspace.current = true;
        
        try {
          // Create default workspace
          const newWorkspace = await initializeDefaultWorkspace(user.id);

          if (newWorkspace) {
            // Update workspaces cache with the new workspace
            await mutateWorkspaces((prev: ApiWorkspace[] | undefined) => {
              const prevWorkspaces = prev || [];
              return [...prevWorkspaces, newWorkspace];
            }, { revalidate: false });
            
            // Select the new workspace
            selectWorkspace(newWorkspace.id);
          }
        } catch (error) {
          console.error('[useWorkspaceInitialization] Error creating default workspace:', error);
        } finally {
          creatingWorkspace.current = false;
          initializationRan.current = true;
        }
      } else if (workspaces && workspaces.length > 0) {
        // Mark initialization as complete when we have workspaces
        initializationRan.current = true;
      }
    };
    
    handleWorkspaceInitialization();
  }, [user, workspaces, isWorkspacesLoading, mutateWorkspaces, selectWorkspace]);
  
  // Track if we've performed initial workspace selection
  const hasInitializedRef = useRef(false);
  
  // Ensure workspace selection after login, only when needed
  useEffect(() => {
    // Only run this effect if we have workspaces loaded after authentication
    if (user && workspaces && workspaces.length > 0 && !isWorkspacesLoading) {
      // Check if current workspace exists in the loaded workspaces
      const hasValidWorkspace = currentWorkspaceId && 
        workspaces.some((w: ApiWorkspace) => w.id === currentWorkspaceId);
      
      // Only select a default workspace if:
      // 1. There's no valid workspace selected AND
      // 2. We haven't already initialized OR it's our first load
      if (!hasValidWorkspace && !hasInitializedRef.current) {
        console.log('[useWorkspaceInitialization] Initializing first workspace selection:', workspaces[0].id);
        selectWorkspace(workspaces[0].id);
        hasInitializedRef.current = true;
      } else if (hasValidWorkspace && !hasInitializedRef.current) {
        // Mark as initialized if we have a valid selection
        hasInitializedRef.current = true;
      }
    }
  }, [user, workspaces, isWorkspacesLoading, currentWorkspaceId, selectWorkspace]);
  
  return {
    workspaces: workspaces || [],
    isLoading: isAuthLoading || isWorkspacesLoading || (!!user && !workspaces),
    error,
    mutate: mutateWorkspaces,
  };
}

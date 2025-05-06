import { useEffect, useRef } from 'react';
import { useAuthSession } from './useAuthSession';
import { getUserWorkspacesClient, initializeDefaultWorkspace } from '@/services/workspace/client';
import { Workspace } from '@/types/supabase-types';
import useSWR from 'swr';
import { useWorkspaceStore } from '@/stores/workspaceStore';

/**
 * Hook to ensure user has at least one workspace and that workspace selection is properly initialized
 * - Automatically initializes a default workspace if none exists
 * - Ensures workspace selection is maintained after login
 * - Synchronizes workspace store with fetched workspaces
 */
export function useWorkspaceInitialization() {
  const { user, isLoading: isAuthLoading } = useAuthSession();
  const workspaceStore = useWorkspaceStore();
  const initializationRan = useRef(false);
  const creatingWorkspace = useRef(false);

  // Key for workspaces SWR cache - only valid when we have a user
  const workspacesSWRKey = user ? `workspaces-${user.id}` : null;

  // Fetch workspaces using SWR - with appropriate settings
  const { data: workspaces, mutate: mutateWorkspaces, isLoading: isWorkspacesLoading, error } = useSWR<Workspace[]>(
    workspacesSWRKey,
    async () => user ? await getUserWorkspacesClient(user.id) : [],
    {
      revalidateOnFocus: true, // Important: when user returns to app, revalidate
      revalidateOnReconnect: true, // Important: when network reconnects, revalidate
      dedupingInterval: 10000, // 10 seconds is enough - we want fresh data after auth changes
      focusThrottleInterval: 10000, // 10 seconds
      errorRetryCount: 3, // More retries for critical data
      keepPreviousData: true, 
      loadingTimeout: 3000,
      onSuccess: (data) => {
        console.log(`[useWorkspaceInitialization] Workspaces loaded:`, data?.length ?? 0);
        
        // Update the workspace store with fetched workspaces
        if (data && Array.isArray(data)) {
          // Use refreshWorkspaces to properly handle workspace selection logic
          workspaceStore.refreshWorkspaces(() => Promise.resolve(data));
        }
      }
    }
  );
  
  // Initialize default workspace if needed
  useEffect(() => {
    // Skip if: still loading, no user, already checking, or already ran initialization
    if (isWorkspacesLoading || !user || creatingWorkspace.current || !workspaces) {
      return;
    }
    
    const handleWorkspaceInitialization = async () => {
      // If user has no workspaces, create a default one
      if (workspaces.length === 0 && !creatingWorkspace.current) {
        console.log('[useWorkspaceInitialization] Creating default workspace for user:', user.id);
        creatingWorkspace.current = true;
        
        try {
          // Create default workspace
          const newWorkspace = await initializeDefaultWorkspace(user.id);
          console.log('[useWorkspaceInitialization] Created default workspace:', newWorkspace?.id);
          
          if (newWorkspace) {
            // Update workspaces cache with the new workspace
            await mutateWorkspaces(prev => {
              const updated = [...(prev || []), newWorkspace];
              return updated;
            }, { revalidate: false });
            
            // Add to workspace store and set as current
            workspaceStore.setWorkspaces([newWorkspace]); 
          }
        } catch (error) {
          console.error('[useWorkspaceInitialization] Error creating default workspace:', error);
        } finally {
          creatingWorkspace.current = false;
        }
      } else if (workspaces.length > 0) {
        // Mark initialization as complete when we have workspaces
        initializationRan.current = true;
      }
    };
    
    handleWorkspaceInitialization();
  }, [user, workspaces, isWorkspacesLoading, mutateWorkspaces, workspaceStore]);
  
  // Ensure workspace selection after login
  useEffect(() => {
    // When we have workspaces loaded after authentication
    if (user && workspaces && workspaces.length > 0 && !isWorkspacesLoading) {
      // Get current workspace from store
      const currentWorkspaceId = workspaceStore.currentWorkspaceId;
      
      // Check if current workspace exists in the loaded workspaces
      const hasValidWorkspace = currentWorkspaceId && 
        workspaces.some(w => w.id === currentWorkspaceId);
      
      if (!hasValidWorkspace) {
        // If current selection is invalid or missing, select the first workspace
        console.log('[useWorkspaceInitialization] Setting first workspace as current:', workspaces[0].id);
        workspaceStore.setCurrentWorkspaceId(workspaces[0].id);
      }
    }
  }, [user, workspaces, isWorkspacesLoading, workspaceStore]);

  return {
    workspaces: workspaces || [],
    isLoading: isAuthLoading || isWorkspacesLoading || (!!user && !workspaces),
    error,
    mutate: mutateWorkspaces,
  };
}

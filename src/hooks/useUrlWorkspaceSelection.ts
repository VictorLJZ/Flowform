import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { ApiWorkspace } from '@/types/workspace';

/**
 * Hook for handling URL-driven workspace selection
 * 
 * Simplifies the workspace-provider by extracting the URL parameter
 * handling logic into a dedicated, focused hook
 */
export function useUrlWorkspaceSelection(
  workspaces: ApiWorkspace[] | undefined,
  mutateWorkspaces: (data?: ApiWorkspace[] | Promise<ApiWorkspace[]> | ((current: ApiWorkspace[] | undefined) => ApiWorkspace[] | undefined) | undefined) => Promise<ApiWorkspace[] | undefined>,
  selectWorkspace: (id: string) => void
) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Access Next.js routing to read URL parameters
  const searchParams = useSearchParams();
  const params = useParams();
  const forceWorkspaceId = searchParams.get('force_workspace');
  const queryWorkspaceId = searchParams.get('workspace');
  
  // Check for workspace ID in path parameters (new format)
  const pathWorkspaceId = params?.workspaceId as string | undefined;
  
  // Prioritize path-based parameter over query parameter
  const urlWorkspaceId = pathWorkspaceId || queryWorkspaceId;
  
  // Get router for URL manipulation
  const router = useRouter();
  
  // First handle persistently stored workspace from URL
  useEffect(() => {
    // Skip if we're already processing or no workspaces
    if (isProcessing || !workspaces || workspaces.length === 0) return;
    
    // Only process if there's a workspace ID in the URL
    if (urlWorkspaceId) {
      const workspace = workspaces.find(w => w.id === urlWorkspaceId);
      
      if (workspace) {
        console.log('[useUrlWorkspaceSelection] Using workspace from URL:', workspace.name);
        selectWorkspace(urlWorkspaceId);
        
        // If using old query parameter format, migrate to path-based URL
        if (queryWorkspaceId && !pathWorkspaceId && typeof window !== 'undefined') {
          // Don't replace immediately if this is an initial page load
          // This avoids unnecessary navigation events during page initialization
          const isInitialLoad = !sessionStorage.getItem('workspace_url_migrated');
          
          if (!isInitialLoad) {
            console.log('[useUrlWorkspaceSelection] Migrating to path-based URL');
            router.replace(`/dashboard/workspace/${queryWorkspaceId}`);
          } else {
            sessionStorage.setItem('workspace_url_migrated', 'true');
          }
        }
      }
    }
  }, [urlWorkspaceId, pathWorkspaceId, queryWorkspaceId, workspaces, isProcessing, selectWorkspace, router]);
  
  // Handle temporary forced workspace selection
  useEffect(() => {
    // Skip if already processing or no force parameter
    if (!forceWorkspaceId || isProcessing) return;
    
    setIsProcessing(true);
    console.log('[useUrlWorkspaceSelection] Processing URL-forced selection:', forceWorkspaceId);
    console.log('[useUrlWorkspaceSelection] Starting force selection process:', {
      forceId: forceWorkspaceId,
      currentWorkspaces: workspaces?.map(w => ({ id: w.id, name: w.name }))
    });
    
    // Update to the forced workspace using the new path-based format
    router.replace(`/dashboard/workspace/${forceWorkspaceId}`);
    
    // IMPROVED SOLUTION: Define a function to directly check the database
    // This bypasses SWR and goes straight to the API
    const checkWorkspaceExists = async () => {
      try {
        console.log('[useUrlWorkspaceSelection] Making direct API call to verify workspace exists');
        
        // Make a direct fetch to the API to confirm the workspace exists in the database
        const response = await fetch(`/api/workspaces/${forceWorkspaceId}/verify`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.exists) {
          console.log('[useUrlWorkspaceSelection] Workspace confirmed to exist in database');
          // Since we know it exists, force-select it
          selectWorkspace(forceWorkspaceId);
          
          // Then force a full refresh of the SWR cache to ensure consistency
          await mutateWorkspaces(undefined);
          
          console.log('[useUrlWorkspaceSelection] Selection complete and cache refreshed');
          setIsProcessing(false);
          return;
        } else {
          console.log('[useUrlWorkspaceSelection] Workspace does not exist in database');
          setIsProcessing(false);
          return;
        }
      } catch (error) {
        console.error('[useUrlWorkspaceSelection] Error verifying workspace:', error);
        // Fallback to original strategy
      }
      
      // If direct check fails, fall back to the SWR approach
      // If workspaces are loaded, check if target exists
      if (workspaces) {
        const workspace = workspaces.find(w => w.id === forceWorkspaceId);
        
        if (workspace) {
          // If found, simply select it
          console.log('[useUrlWorkspaceSelection] Found workspace in SWR cache, selecting:', workspace.name);
          selectWorkspace(forceWorkspaceId);
          setIsProcessing(false);
          return;
        }
        
        // If not found, refresh data once
        console.log('[useUrlWorkspaceSelection] Workspace not found in SWR cache, refreshing data...');
        
        // Force revalidation and update
        try {
          // Completely reset cache and wait for fresh data
          await mutateWorkspaces();
          
          // Try to find again after refresh
          const freshWorkspaces = await mutateWorkspaces();
          const refreshedWorkspace = freshWorkspaces?.find(w => w.id === forceWorkspaceId);
          
          if (refreshedWorkspace) {
            console.log('[useUrlWorkspaceSelection] Found workspace after refresh:', refreshedWorkspace.name);
            selectWorkspace(forceWorkspaceId);
          } else {
            console.log('[useUrlWorkspaceSelection] Workspace not found after refresh');
            // Break the infinite loop by giving up after one solid attempt
            window.location.href = '/dashboard';
          }
        } catch (err) {
          console.error('[useUrlWorkspaceSelection] Error refreshing workspaces:', err);
        } finally {
          setIsProcessing(false);
        }
      } else {
        // If no workspaces yet, wait for them to load
        console.log('[useUrlWorkspaceSelection] Waiting for workspaces to load...');
        setIsProcessing(false);
      }
    };
    
    // Execute the improved strategy
    checkWorkspaceExists();
  }, [forceWorkspaceId, isProcessing, workspaces, mutateWorkspaces, selectWorkspace, router]);

  return { 
    isProcessing,
    forceWorkspaceId 
  };
}

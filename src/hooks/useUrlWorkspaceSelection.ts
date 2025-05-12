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
    if (!forceWorkspaceId || isProcessing) return;
    
    setIsProcessing(true);
    console.log('[useUrlWorkspaceSelection] Processing URL-forced selection:', forceWorkspaceId);
    
    // Update to the forced workspace using the new path-based format
    router.replace(`/dashboard/workspace/${forceWorkspaceId}`);
    
    // If workspaces are loaded, check if target exists
    if (workspaces) {
      const workspace = workspaces.find(w => w.id === forceWorkspaceId);
      
      if (workspace) {
        // If found, simply select it
        console.log('[useUrlWorkspaceSelection] Found workspace, selecting:', workspace.name);
        selectWorkspace(forceWorkspaceId);
        setIsProcessing(false);
        return;
      }
      
      // If not found, refresh data once
      console.log('[useUrlWorkspaceSelection] Workspace not found, refreshing data...');
      mutateWorkspaces(currentWorkspaces => currentWorkspaces).then(() => {
        const refreshedWorkspace = workspaces?.find(w => w.id === forceWorkspaceId);
        
        if (refreshedWorkspace) {
          console.log('[useUrlWorkspaceSelection] Found workspace after refresh:', refreshedWorkspace.name);
          selectWorkspace(forceWorkspaceId);
        } else {
          console.log('[useUrlWorkspaceSelection] Workspace not found after refresh');
        }
        
        setIsProcessing(false);
      }).catch(err => {
        console.error('[useUrlWorkspaceSelection] Error refreshing workspaces:', err);
        setIsProcessing(false);
      });
    } else {
      // If no workspaces yet, wait for them to load
      console.log('[useUrlWorkspaceSelection] Waiting for workspaces to load...');
    }
  }, [forceWorkspaceId, isProcessing, workspaces, mutateWorkspaces, selectWorkspace, router]);

  return { 
    isProcessing,
    forceWorkspaceId 
  };
}

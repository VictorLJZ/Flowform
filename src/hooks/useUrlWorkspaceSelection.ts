import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  const forceWorkspaceId = searchParams.get('force_workspace');
  const urlWorkspaceId = searchParams.get('workspace');
  
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
      }
    }
  }, [urlWorkspaceId, workspaces, isProcessing, selectWorkspace]);
  
  // Handle temporary forced workspace selection
  useEffect(() => {
    if (!forceWorkspaceId || isProcessing) return;
    
    setIsProcessing(true);
    console.log('[useUrlWorkspaceSelection] Processing URL-forced selection:', forceWorkspaceId);
    
    // We'll update to the forced workspace as the persistent one
    const url = new URL(window.location.href);
    url.searchParams.delete('force_workspace');
    url.searchParams.set('workspace', forceWorkspaceId);
    
    // Update URL without reload
    router.replace(url.pathname + url.search);
    
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

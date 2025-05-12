import { useCallback } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { toast } from '@/components/ui/use-toast';
import { useWorkspace } from '@/providers/workspace-provider';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for switching between workspaces
 * 
 * Following Carmack principles:
 * - Simple, focused functionality
 * - Clean separation of concerns
 * - No duplicated state management
 */
export function useWorkspaceSwitcher() {
  // Get router for URL manipulation
  const router = useRouter();

  // Get the current workspace ID from Zustand
  const currentWorkspaceId = useWorkspaceStore(state => state.currentWorkspaceId);
  
  // Get the workspace list from SWR (via context)
  const { workspaces } = useWorkspace();
  
  /**
   * Switch to a specific workspace by ID
   * 
   * Simply updates the Zustand store, which is the single source of truth
   * for workspace selection
   */
  const switchToWorkspace = useCallback((workspaceId: string) => {
    // Debug info
    console.log(`[useWorkspaceSwitcher] Switching workspace:`, { 
      from: currentWorkspaceId || 'none',
      to: workspaceId,
      availableCount: workspaces?.length || 0
    });
    
    try {
      // Get the selectWorkspace action from the store
      const selectWorkspace = useWorkspaceStore.getState().selectWorkspace;
      
      // Call the action to select the workspace
      // Zustand persist middleware will handle localStorage
      selectWorkspace(workspaceId);
      
      // Update the URL to include the workspace ID
      // This ensures the workspace selection is persisted in the URL
      const url = new URL(window.location.href);
      url.searchParams.set('workspace', workspaceId);
      
      // Use router.replace to update the URL without a page reload
      router.replace(url.pathname + url.search);
      
      // Log success
      console.log(`[useWorkspaceSwitcher] Successfully switched to workspace: ${workspaceId}`);
    } catch (error) {
      console.error('[useWorkspaceSwitcher] Error switching workspace:', error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to switch workspace. Please try again." 
      });
    }
  }, [currentWorkspaceId, workspaces, router]);
  
  return {
    currentWorkspaceId,
    workspaces,
    switchToWorkspace
  };
}

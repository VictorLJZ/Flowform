import { useCallback } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { toast } from '@/components/ui/use-toast';

/**
 * Custom hook that provides a reliable way to switch between workspaces
 * Ensures proper state updates and handles edge cases
 */
export function useWorkspaceSwitcher() {
  // Get the workspace store state and actions
  const currentWorkspaceId = useWorkspaceStore(state => state.currentWorkspaceId);
  const workspaces = useWorkspaceStore(state => state.workspaces);
  const setCurrentWorkspaceId = useWorkspaceStore(state => state.setCurrentWorkspaceId);
  
  /**
   * Switch to a specific workspace by ID
   */
  const switchToWorkspace = useCallback((workspaceId: string) => {
    // Debug info
    console.log(`[useWorkspaceSwitcher] Switching workspace:`, { 
      from: currentWorkspaceId || 'none',
      to: workspaceId,
      workspaceCount: workspaces.length
    });
    
    try {
      // STEP 1: First remove the workspace provider effect by setting a flag
      // This prevents the WorkspaceProvider from overriding our selection
      window.sessionStorage.setItem('manual_workspace_switch', 'true');
      
      // STEP 2: Direct update to avoid any state synchronization issues
      setCurrentWorkspaceId(workspaceId);
      
      // STEP 3: Force update to localStorage to ensure persistence
      // We use a direct approach to avoid any potential issues with Zustand persist
      const storageKey = 'workspace-state-storage';
      const currentStorage = window.localStorage.getItem(storageKey) || '{}';
      let storageObj;
      
      try {
        storageObj = JSON.parse(currentStorage);
      } catch {
        storageObj = {};
      }
      
      // Update the currentWorkspaceId in the stored state
      if (!storageObj.state) storageObj.state = {};
      storageObj.state.currentWorkspaceId = workspaceId;
      
      // Write back to localStorage
      window.localStorage.setItem(storageKey, JSON.stringify(storageObj));
      
      // STEP 4: Set a flag to prevent overrides from other components
      window.sessionStorage.setItem('workspace_last_switched', Date.now().toString());
      
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
  }, [currentWorkspaceId, workspaces, setCurrentWorkspaceId]);
  
  return {
    currentWorkspaceId,
    workspaces,
    switchToWorkspace
  };
}

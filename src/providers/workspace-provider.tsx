"use client";

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useWorkspaceInitialization } from '@/hooks/useWorkspaceInitialization';
import { ApiWorkspace } from '@/types/workspace';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useDefaultWorkspaceCreation } from '@/hooks/useDefaultWorkspaceCreation';
import { useUrlWorkspaceSelection } from '@/hooks/useUrlWorkspaceSelection';
import { useStorageSyncBetweenTabs } from '@/hooks/useStorageSyncBetweenTabs';

/**
 * WorkspaceContext - Provides SWR workspace data
 * 
 * Following the Carmack philosophy of clear separation of concerns:
 * - SWR handles API data fetching and caching (exposed through this context)
 * - Zustand handles UI selection state (accessed directly by components)
 */
type WorkspaceContextType = {
  // SWR-managed data
  workspaces: ApiWorkspace[] | undefined;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<ApiWorkspace[] | undefined>;
  
  // Processing states
  isProcessingForceSelection: boolean;
  isCreatingDefaultWorkspace: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * WorkspaceProvider component
 * 
 * Manages workspaces with a clean separation of concerns:
 * - SWR for data fetching
 * - Zustand for selection state
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  // SWR hook for workspace data
  const workspaceData = useWorkspaceInitialization();
  const { user } = useAuthSession();
  
  // Access Zustand for selection state only
  const currentWorkspaceId = useWorkspaceStore(state => state.currentWorkspaceId);
  const selectWorkspace = useWorkspaceStore(state => state.selectWorkspace);
  
  // Use our custom hook for URL-driven workspace selection
  const { isProcessing: isProcessingForceSelection } = useUrlWorkspaceSelection(
    workspaceData.workspaces,
    () => workspaceData.mutate(prev => prev), // Fix TypeScript error by providing the identity function
    selectWorkspace
  );
  
  // Use our custom hook for default workspace creation
  const { isCreating: isCreatingDefaultWorkspace } = useDefaultWorkspaceCreation(
    user,
    workspaceData.workspaces,
    () => workspaceData.mutate(prev => prev), // Fix TypeScript error by providing the identity function
    selectWorkspace
  );
  
  // Use our custom hook for cross-tab communication
  useStorageSyncBetweenTabs<{ state: { currentWorkspaceId: string } }>(
    'workspace-storage',
    (newState) => {
      if (newState.state?.currentWorkspaceId !== currentWorkspaceId) {
        console.log('[WorkspaceProvider] Detected workspace change in another tab');
        selectWorkspace(newState.state.currentWorkspaceId);
      }
    }
  );
  
  // Initialize workspace selection when SWR data loads
  useEffect(() => {
    // Skip if no data, or we're in the middle of a forced selection
    if (!workspaceData.workspaces || workspaceData.workspaces.length === 0 || isProcessingForceSelection) {
      return;
    }
    
    // If no workspace is selected but we have workspaces, select the first one
    if (!currentWorkspaceId && workspaceData.workspaces.length > 0) {
      console.log('[WorkspaceProvider] No selection, defaulting to first workspace:', 
        workspaceData.workspaces[0].name);
      selectWorkspace(workspaceData.workspaces[0].id);
    }
  }, [workspaceData.workspaces, currentWorkspaceId, isProcessingForceSelection, selectWorkspace]);
  
  // Create context value
  const contextValue = {
    ...workspaceData,
    isProcessingForceSelection,
    isCreatingDefaultWorkspace
  };
  
  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

/**
 * Hook to access workspace data from SWR
 */
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

/**
 * Hook to get the current workspace from SWR data
 * Uses Zustand for the selected ID, but gets the full workspace from SWR
 */
export function useCurrentWorkspace() {
  // Get workspace data from context
  const { workspaces } = useWorkspace();
  
  // Get selected ID from Zustand
  const selectedId = useWorkspaceStore(state => state.currentWorkspaceId);
  
  // Find the currently selected workspace in the SWR data
  const currentWorkspace = workspaces?.find(w => w.id === selectedId);
  
  return { currentWorkspace, selectedId };
}

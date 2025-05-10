"use client";

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useWorkspaceInitialization } from '@/hooks/useWorkspaceInitialization';
import { Workspace } from '@/types/supabase-types';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useRouter, useSearchParams } from 'next/navigation';

type WorkspaceContextType = {
  workspaces: Workspace[] | undefined;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<Workspace[] | undefined>;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * Provider component that wraps parts of the app that need workspace data
 * Ensures workspace initialization happens for authenticated users
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const workspaceData = useWorkspaceInitialization();
  const setWorkspaces = useWorkspaceStore(state => state.setWorkspaces);
  
  // Get the setter for current workspace ID
  const setCurrentWorkspaceId = useWorkspaceStore(state => state.setCurrentWorkspaceId);
  const currentWorkspaceId = useWorkspaceStore(state => state.currentWorkspaceId);
  
  // Access Next.js routing to read URL parameters
  const searchParams = useSearchParams();
  const forceWorkspaceId = searchParams.get('force_workspace');
  
  // Always debug in dev mode
  const isDev = process.env.NODE_ENV === 'development';
  
  // Handle the force_workspace query parameter with retry logic
  useEffect(() => {
    if (!forceWorkspaceId) return;
    
    console.log('🚨🚨 [WorkspaceProvider] FORCED WORKSPACE SELECTION from URL:', forceWorkspaceId);
    
    // Get the newly created workspace ID and time from localStorage
    const newWorkspaceId = localStorage.getItem('new_workspace_id');
    const newWorkspaceTimeStr = localStorage.getItem('new_workspace_redirect_time');
    const isNewlyCreatedWorkspace = newWorkspaceId === forceWorkspaceId;
    
    // Function to set the workspace when it's found
    const setWorkspaceWhenFound = () => {
      // Force setting the workspace using multiple methods
      // 1. Use the store's method
      useWorkspaceStore.setState({
        currentWorkspaceId: forceWorkspaceId,
        manualSelectionActive: true,
        lastManualSelectionTime: Date.now()
      });
      
      // 2. Set session storage flags
      sessionStorage.setItem('manual_workspace_switch', 'true');
      sessionStorage.setItem('workspace_last_switched', Date.now().toString());
      sessionStorage.setItem('forced_workspace_id', forceWorkspaceId);
      
      // 3. Add to localStorage for persistence
      try {
        const storageKey = 'workspace-state-storage';
        const existingStateStr = localStorage.getItem(storageKey);
        const existingState = existingStateStr ? JSON.parse(existingStateStr) : { state: {}, version: 0 };
        
        existingState.state.currentWorkspaceId = forceWorkspaceId;
        existingState.state.manualSelectionActive = true;
        existingState.state.lastManualSelectionTime = Date.now();
        
        localStorage.setItem(storageKey, JSON.stringify(existingState));
      } catch (e) {
        console.error('[WorkspaceProvider] Error updating localStorage:', e);
      }
      
      console.log('✅✅ [WorkspaceProvider] Successfully forced workspace selection to:', forceWorkspaceId);
      
      // Clean up the localStorage entry for new workspace
      if (isNewlyCreatedWorkspace) {
        localStorage.removeItem('new_workspace_id');
        localStorage.removeItem('new_workspace_redirect_time');
      }
    };
    
    // First check if the workspace already exists in our data
    if (workspaceData.workspaces && workspaceData.workspaces.some(w => w.id === forceWorkspaceId)) {
      setWorkspaceWhenFound();
      return;
    }
    
    // If this is a newly created workspace and it's not in the list yet,
    // we need to trigger a refetch and retry
    if (isNewlyCreatedWorkspace) {
      console.log('🕐 [WorkspaceProvider] Newly created workspace not found yet, will retry after refetching');
      
      // Force a refetch of workspaces
      workspaceData.mutate();
      
      // Set up a timer to check again after the fetch completes
      const retryTimeout = setTimeout(() => {
        // Check again if workspace exists now
        if (workspaceData.workspaces && workspaceData.workspaces.some(w => w.id === forceWorkspaceId)) {
          console.log('🕐 [WorkspaceProvider] Found workspace after refetch!');
          setWorkspaceWhenFound();
        } else {
          console.log('🕐 [WorkspaceProvider] Still couldn\'t find workspace, continuing with normal initialization');
          // Instead of showing error, we'll just let the normal initialization process happen
        }
      }, 2000); // Wait for refetch to complete
      
      return () => clearTimeout(retryTimeout);
    } else {
      // If it's not a newly created workspace and it's not in the list,
      // then it's truly an error situation
      console.warn('⚠️ [WorkspaceProvider] Could not find workspace with ID:', forceWorkspaceId, 
        'This is expected if the workspace was just created and not yet loaded.');
    }
  }, [forceWorkspaceId, workspaceData.workspaces, workspaceData.mutate]); // Run when URL changes or workspace data loads

  // Handle workspace selection logic
  useEffect(() => {
    // Only proceed if we have workspaces data
    if (!workspaceData.workspaces || workspaceData.workspaces.length === 0) {
      console.log('[WorkspaceProvider] No workspaces available, skipping workspace selection');
      return;
    }

    // IMPROVEMENT: Get both flags and timestamp for better decision-making
    const manualSwitchFlag = typeof window !== 'undefined' ? 
      window.sessionStorage.getItem('manual_workspace_switch') : null;
    const storedTimestamp = typeof window !== 'undefined' ? 
      window.sessionStorage.getItem('workspace_last_switched') : null;
    const manualTimestamp = storedTimestamp ? parseInt(storedTimestamp, 10) : 0;
    const isRecentManualSelection = (Date.now() - manualTimestamp) < 30000; // 30 seconds
    
    // If a manual switch was performed, always respect that choice
    if (manualSwitchFlag === 'true' || isRecentManualSelection) {
      console.log('[WorkspaceProvider] Manual workspace selection detected:', { 
        currentWorkspaceId,
        isRecentManualSelection,
        lastSwitchTime: new Date(manualTimestamp).toISOString()
      });
      
      // DON'T clear the flag here - let it persist a bit longer to protect against multiple revalidations
      return;
    }
    
    // If we have a saved workspace ID from localStorage, validate it
    if (currentWorkspaceId) {
      // Check if the saved workspace is still valid (user still has access)
      const isWorkspaceValid = workspaceData.workspaces.some(w => w.id === currentWorkspaceId);
      
      if (isWorkspaceValid) {
        // Current workspace selection is valid, keep using it
        console.log('[WorkspaceProvider] Using existing workspace selection:', currentWorkspaceId);
      } else {
        // Current workspace selection is invalid, select first available workspace
        const firstWorkspace = workspaceData.workspaces[0];
        
        console.log('[WorkspaceProvider] Saved workspace not found, selecting first workspace', { 
          previousId: currentWorkspaceId,
          newId: firstWorkspace.id,
          workspaceCount: workspaceData.workspaces.length
        });
        
        // IMPROVEMENT: Use selectWorkspace instead of setCurrentWorkspaceId
        // This will properly set flags to prevent race conditions
        const selectWorkspace = useWorkspaceStore.getState().selectWorkspace;
        selectWorkspace(firstWorkspace.id);
      }
    } 
    // No workspace selected yet, set to the first one
    else if (workspaceData.workspaces.length > 0) {
      const firstWorkspace = workspaceData.workspaces[0];
      
      console.log('[WorkspaceProvider] Setting initial workspace', { 
        currentId: 'none',
        firstWorkspaceId: firstWorkspace.id,
        workspaceCount: workspaceData.workspaces.length
      });
      
      // IMPROVEMENT: Use selectWorkspace instead of setCurrentWorkspaceId 
      const selectWorkspace = useWorkspaceStore.getState().selectWorkspace;
      selectWorkspace(firstWorkspace.id);
    }
  }, [workspaceData.workspaces, setCurrentWorkspaceId, isDev, currentWorkspaceId]);
  
  // Update global Zustand store when workspaces change (separate concern)
  useEffect(() => {
    if (workspaceData.workspaces && workspaceData.workspaces.length > 0) {
      // Push workspaces to global state store
      setWorkspaces([...workspaceData.workspaces]);
    }
  }, [workspaceData.workspaces, setWorkspaces]);
  
  return (
    <WorkspaceContext.Provider value={workspaceData}>
      {children}
    </WorkspaceContext.Provider>
  );
}

/**
 * React hook to access workspace data and ensure initialization
 * Must be used within a WorkspaceProvider
 */
export function useWorkspaces() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspaces must be used within a WorkspaceProvider');
  }
  return context;
}

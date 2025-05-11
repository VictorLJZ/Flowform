"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useWorkspaceInitialization } from '@/hooks/useWorkspaceInitialization';
import { Workspace } from '@/types/supabase-types';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSearchParams } from 'next/navigation';
import { initializeDefaultWorkspace } from '@/services/workspace/client';
import { useAuthSession } from '@/hooks/useAuthSession';

type WorkspaceContextType = {
  workspaces: Workspace[] | undefined;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<Workspace[] | undefined>;
  isProcessingForceSelection: boolean; // Flag for force selection loading state
  isCreatingDefaultWorkspace: boolean; // Flag for default workspace creation state
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * Provider component that wraps parts of the app that need workspace data
 * Ensures workspace initialization happens for authenticated users
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  // Add state for tracking force selection loading
  const [isProcessingForceSelection, setIsProcessingForceSelection] = useState(false);
  const [isCreatingDefaultWorkspace, setIsCreatingDefaultWorkspace] = useState(false);
  
  const workspaceData = useWorkspaceInitialization();
  const { user } = useAuthSession();
  const setWorkspaces = useWorkspaceStore(state => state.setWorkspaces);
  const needsDefaultWorkspace = useWorkspaceStore(state => state.needsDefaultWorkspace);
  
  // Get the current workspace ID
  const currentWorkspaceId = useWorkspaceStore(state => state.currentWorkspaceId);
  
  // Access Next.js routing to read URL parameters
  const searchParams = useSearchParams();
  const forceWorkspaceId = searchParams.get('force_workspace');
  
  // Handle the force_workspace query parameter with retry logic
  useEffect(() => {
    if (!forceWorkspaceId) return;
    
    // Set loading state while processing
    setIsProcessingForceSelection(true);
    console.log('🚨🚨 [WorkspaceProvider] FORCED WORKSPACE SELECTION from URL:', forceWorkspaceId);
    
    // Get the newly created workspace ID and time from localStorage
    const newWorkspaceId = localStorage.getItem('new_workspace_id');
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
      
      // Turn off loading state after successful selection
      setIsProcessingForceSelection(false);
    };
    
    // First check if the workspace already exists in our data
    if (workspaceData.workspaces && workspaceData.workspaces.some(w => w.id === forceWorkspaceId)) {
      setWorkspaceWhenFound();
      return;
    }
    
    // If this is a newly created workspace and it's not in the list yet,
    // we need to manually add it to the workspaces list and then select it
    if (isNewlyCreatedWorkspace) {
      console.log('🕐 [WorkspaceProvider] Newly created workspace not found yet, adding it manually');
      
      // Attempt to load workspace details from localStorage
      try {
        const workspaceJson = localStorage.getItem('new_workspace_details');
        if (workspaceJson) {
          const workspaceDetails = JSON.parse(workspaceJson);
          console.log('🕐 [WorkspaceProvider] Found workspace details in localStorage:', workspaceDetails);
          
          // Manually add the workspace to the SWR cache
          // This ensures it's immediately available in the UI
          workspaceData.mutate(currentWorkspaces => {
            if (!currentWorkspaces) return [workspaceDetails];
            
            // Don't add duplicates
            if (currentWorkspaces.some(w => w.id === workspaceDetails.id)) {
              return currentWorkspaces;
            }
            
            console.log('🕐 [WorkspaceProvider] Manually adding workspace to SWR cache:', workspaceDetails.id);
            return [...currentWorkspaces, workspaceDetails];
          }, false); // false = don't revalidate
          
          // Now select the workspace
          console.log('🕐 [WorkspaceProvider] Selecting manually added workspace');
          setWorkspaceWhenFound();
          return;
        }
      } catch (e) {
        console.error('[WorkspaceProvider] Error adding workspace manually:', e);
      }
      
      // Fallback to standard refetch if we couldn't find local details
      console.log('🕐 [WorkspaceProvider] No local details found, using standard refetch');
      
      // Force a refetch of workspaces
      workspaceData.mutate();
      
      // Set up a timer to check again after the fetch completes
      const retryTimeout = setTimeout(() => {
        // Check again if workspace exists now
        if (workspaceData.workspaces && workspaceData.workspaces.some(w => w.id === forceWorkspaceId)) {
          console.log('🕐 [WorkspaceProvider] Found workspace after refetch!');
          setWorkspaceWhenFound();
        } else {
          console.log('🕐 [WorkspaceProvider] Still couldn\'t find workspace after retry, forcing UI display');
          // Turn off loading state even if we can't find the workspace
          setIsProcessingForceSelection(false);
        }
      }, 3000); // Increased wait time for refetch to complete
      
      return () => clearTimeout(retryTimeout);
    } else {
      // If it's not a newly created workspace and it's not in the list,
      // then it's truly an error situation
      console.warn('⚠️ [WorkspaceProvider] Could not find workspace with ID:', forceWorkspaceId, 
        'This is expected if the workspace was just created and not yet loaded.');
        
      // Turn off loading state after warning
      setIsProcessingForceSelection(false);
    }
  }, [forceWorkspaceId, workspaceData]); // Run when URL changes or workspace data object changes

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
  }, [workspaceData, currentWorkspaceId]); // Simplified dependency array

  // Update global Zustand store when workspaces change (separate concern)
  useEffect(() => {
    if (workspaceData.workspaces && workspaceData.workspaces.length > 0) {
      // Push workspaces to global state store
      setWorkspaces([...workspaceData.workspaces]);
    }
  }, [workspaceData.workspaces, setWorkspaces, workspaceData]);
  
  // Handle default workspace creation when needed (after deletion of last workspace)
  useEffect(() => {
    if (needsDefaultWorkspace && user && !isCreatingDefaultWorkspace) {
      const createDefaultWorkspace = async () => {
        console.log('[WorkspaceProvider] Creating default workspace after deletion');
        setIsCreatingDefaultWorkspace(true);
        
        try {
          // Create a new default workspace
          const newWorkspace = await initializeDefaultWorkspace(user.id);
          
          if (newWorkspace) {
            // Add to workspace store and select it
            const addWorkspace = useWorkspaceStore.getState().addWorkspace;
            const selectWorkspace = useWorkspaceStore.getState().selectWorkspace;
            
            addWorkspace(newWorkspace);
            selectWorkspace(newWorkspace.id);
            
            // Clear the flag
            useWorkspaceStore.setState({ needsDefaultWorkspace: false });
            
            // Refresh workspace data
            await workspaceData.mutate();
            
            console.log('[WorkspaceProvider] Successfully created default workspace after deletion');
          }
        } catch (error) {
          console.error('[WorkspaceProvider] Error creating default workspace:', error);
        } finally {
          setIsCreatingDefaultWorkspace(false);
        }
      };
      
      createDefaultWorkspace();
    }
  }, [needsDefaultWorkspace, user, workspaceData, workspaceData.mutate, isCreatingDefaultWorkspace]);
  
  // Create a context value with our combined state
  const workspaceContextValue = {
    ...workspaceData,
    isProcessingForceSelection,
    isCreatingDefaultWorkspace
  };
  
  // Add an effect for timeout safety - never block UI for more than 5 seconds
  useEffect(() => {
    if (isProcessingForceSelection) {
      const safetyTimeout = setTimeout(() => {
        console.log('⚠️ [WorkspaceProvider] Force selection safety timeout reached, showing UI anyway');
        setIsProcessingForceSelection(false);
      }, 5000); // 5 second maximum wait time
      
      return () => clearTimeout(safetyTimeout);
    }
  }, [isProcessingForceSelection]);
  
  return (
    <WorkspaceContext.Provider value={workspaceContextValue}>
      {/* Improved condition: Show content after a short delay regardless of processing state */}
      {!isProcessingForceSelection && !isCreatingDefaultWorkspace ? 
        children : 
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              {isCreatingDefaultWorkspace ? 'Creating Default Workspace...' : 'Loading New Workspace...'}
            </h2>
            <p className="text-muted-foreground">
              {isCreatingDefaultWorkspace 
                ? 'Please wait while we create a new workspace for you' 
                : 'Please wait while we set up your new workspace'}
            </p>
          </div>
        </div>
      }
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

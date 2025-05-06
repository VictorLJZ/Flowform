"use client";

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useWorkspaceInitialization } from '@/hooks/useWorkspaceInitialization';
import { Workspace } from '@/types/supabase-types';
import { useWorkspaceStore } from '@/stores/workspaceStore';

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
  
  // Always debug in dev mode
  const isDev = process.env.NODE_ENV === 'development';

  // Handle workspace selection logic
  useEffect(() => {
    // Only proceed if we have workspaces data
    if (!workspaceData.workspaces || workspaceData.workspaces.length === 0) {
      return;
    }
    
    // If we have a saved workspace ID from localStorage, validate it
    if (currentWorkspaceId) {
      // Check if the saved workspace is still valid (user still has access)
      const isWorkspaceValid = workspaceData.workspaces.some(w => w.id === currentWorkspaceId);
      
      if (isWorkspaceValid) {
        // Current workspace selection is valid, keep using it
        if (isDev) {
          console.log('[Workspace] Using existing workspace selection:', currentWorkspaceId);
        }
      } else {
        // Current workspace selection is invalid, select first available workspace
        const firstWorkspace = workspaceData.workspaces[0];
        
        if (isDev) {
          console.log('[Workspace] Saved workspace not found, selecting first workspace', { 
            previousId: currentWorkspaceId,
            newId: firstWorkspace.id,
            workspaceCount: workspaceData.workspaces.length
          });
        }
        
        // Set to a valid workspace ID
        setCurrentWorkspaceId(firstWorkspace.id);
      }
    } 
    // No workspace selected yet, set to the first one
    else if (workspaceData.workspaces.length > 0) {
      const firstWorkspace = workspaceData.workspaces[0];
      
      if (isDev) {
        console.log('[Workspace] Setting initial workspace', { 
          currentId: 'none',
          firstWorkspaceId: firstWorkspace.id,
          workspaceCount: workspaceData.workspaces.length
        });
      }
      
      setCurrentWorkspaceId(firstWorkspace.id);
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

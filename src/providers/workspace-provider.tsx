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

  // Only set initial workspace selection if none exists
  useEffect(() => {
    // This effect runs separately to focus only on workspace selection
    if (workspaceData.workspaces && workspaceData.workspaces.length > 0 && !currentWorkspaceId) {
      const firstWorkspace = workspaceData.workspaces[0];
      
      // Debug what's happening
      isDev && console.log('[Workspace] Setting initial workspace', { 
        currentId: 'none',
        firstWorkspaceId: firstWorkspace.id,
        workspaceCount: workspaceData.workspaces.length
      });
      
      // Only set if no workspace is currently selected
      setCurrentWorkspaceId(firstWorkspace.id);
    } else if (currentWorkspaceId) {
      isDev && console.log('[Workspace] Using existing workspace selection:', currentWorkspaceId);
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

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode
} from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { 
  ApiWorkspace, 
  ApiWorkspaceInput 
} from "@/types/workspace/ApiWorkspace";
import { usePathname } from "next/navigation";
import { apiToUiWorkspace } from "@/utils/type-utils/workspace/ApiToUiWorkspace";
import { UiWorkspace } from "@/types/workspace/UiWorkspace";
import { useSupabase } from "@/providers/auth-provider";

// The context type specifies what data and functions the provider shares
type WorkspaceContextType = {
  // Current workspace state
  currentWorkspace: UiWorkspace | null;
  workspaces: UiWorkspace[];
  isLoading: boolean;
  error: string | null;
  
  // Functions
  selectWorkspace: (workspaceId: string | null) => void;
  createWorkspace: (name: string, description?: string) => Promise<ApiWorkspace>;
  updateWorkspace: (id: string, name: string, description?: string) => Promise<ApiWorkspace>;
  deleteWorkspace: (id: string) => Promise<void>;
  initDefaultWorkspace: () => Promise<string | null>;
};

// Create the context with default undefined value
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * Workspace Provider Component
 * Provides workspace context to the application and handles initialization
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Access auth services
  const supabase = useSupabase();
  
  // Access the workspace store
  const workspaceStore = useWorkspaceStore();
  
  // Used to track initialization status
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Transformed workspaces for UI
  const [uiWorkspaces, setUiWorkspaces] = useState<UiWorkspace[]>([]);
  
  // Transform API workspaces to UI workspaces whenever the store updates
  useEffect(() => {
    // Using the apiToUiWorkspaces utility function with the current selection
    const transformed = workspaceStore.workspaces.map(workspace => (
      apiToUiWorkspace(workspace, workspace.id === workspaceStore.currentWorkspaceId)
    ));
    setUiWorkspaces(transformed);
  }, [workspaceStore.workspaces, workspaceStore.currentWorkspaceId]);
  
  /**
   * Get the current workspace as a UI workspace
   */
  const getCurrentWorkspace = useCallback((): UiWorkspace | null => {
    if (!workspaceStore.currentWorkspaceId) return null;
    
    const apiWorkspace = workspaceStore.workspaces.find(
      w => w.id === workspaceStore.currentWorkspaceId
    );
    
    if (!apiWorkspace) return null;
    
    return apiToUiWorkspace(apiWorkspace);
  }, [workspaceStore.currentWorkspaceId, workspaceStore.workspaces]);
  
  /**
   * Create a default workspace for new users
   */
  const createDefaultWorkspace = useCallback(async (userId: string): Promise<string | null> => {
    try {
      // Create a personal workspace for the user
      const input: ApiWorkspaceInput = {
        name: "My Workspace",
        description: "My personal workspace",
        createdBy: userId
      };
      
      const workspace = await workspaceStore.createWorkspace(input);
      return workspace.id;
    } catch (error) {
      console.error("Failed to create default workspace:", error);
      return null;
    }
  }, [workspaceStore]);
  
  /**
   * Initialize the default workspace for a user
   * Will try to select an existing workspace or create a new one if needed
   */
  const initDefaultWorkspace = useCallback(async (): Promise<string | null> => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Fetch workspaces if not already loaded
      if (workspaceStore.workspaces.length === 0) {
        await workspaceStore.fetchWorkspaces();
      }
      
      // Use existing selection if available and valid
      if (
        workspaceStore.currentWorkspaceId && 
        workspaceStore.workspaces.some(w => w.id === workspaceStore.currentWorkspaceId)
      ) {
        return workspaceStore.currentWorkspaceId;
      }
      
      // If we have workspaces, select the first one
      if (workspaceStore.workspaces.length > 0) {
        const firstWorkspaceId = workspaceStore.workspaces[0].id;
        workspaceStore.selectWorkspace(firstWorkspaceId);
        return firstWorkspaceId;
      }
      
      // No workspaces found, create a default one
      return await createDefaultWorkspace(user.id);
    } catch (error) {
      console.error("Failed to initialize default workspace:", error);
      return null;
    }
  }, [supabase, workspaceStore, createDefaultWorkspace]);
  
  /**
   * Creates a new workspace with the given name and description
   */
  const createWorkspace = useCallback(
    async (name: string, description?: string): Promise<ApiWorkspace> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User must be authenticated to create a workspace");
      
      const input: ApiWorkspaceInput = {
        name,
        description,
        createdBy: user.id
      };
      
      return await workspaceStore.createWorkspace(input);
    },
    [supabase, workspaceStore]
  );
  
  /**
   * Updates an existing workspace
   */
  const updateWorkspace = useCallback(
    async (id: string, name: string, description?: string): Promise<ApiWorkspace> => {
      return await workspaceStore.updateWorkspace(id, { name, description });
    },
    [workspaceStore]
  );
  
  /**
   * Initializes workspaces on component mount
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Only proceed if we're authenticated
        if (user) {
          // Fetch workspaces
          await workspaceStore.fetchWorkspaces();
          
          // Handle workspace selection
          if (pathname?.includes('/dashboard')) {
            // Try to extract workspace ID from URL if present
            const match = pathname.match(/\/dashboard\/workspace\/([^/]+)/);
            const urlWorkspaceId = match ? match[1] : null;
            
            if (urlWorkspaceId && workspaceStore.workspaces.some(w => w.id === urlWorkspaceId)) {
              // Select the workspace from URL
              workspaceStore.selectWorkspace(urlWorkspaceId);
            } else if (!workspaceStore.currentWorkspaceId) {
              // Initialize a default workspace if none selected
              await initDefaultWorkspace();
            }
          }
        }
      } catch (error) {
        console.error("Error initializing workspace provider:", error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, supabase, workspaceStore, pathname, initDefaultWorkspace]);
  
  /**
   * Listen for auth state changes
   */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN') {
          // Fetch workspaces after sign in
          await workspaceStore.fetchWorkspaces();
          
          // Initialize default workspace if needed
          if (workspaceStore.workspaces.length === 0) {
            const defaultWorkspaceId = await initDefaultWorkspace();
            if (defaultWorkspaceId) {
              workspaceStore.selectWorkspace(defaultWorkspaceId);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear current workspace selection on sign out
          workspaceStore.selectWorkspace(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, workspaceStore, initDefaultWorkspace]);
  
  // Create the context value
  const contextValue: WorkspaceContextType = {
    currentWorkspace: getCurrentWorkspace(),
    workspaces: uiWorkspaces,
    isLoading: workspaceStore.isLoading,
    error: workspaceStore.error,
    
    selectWorkspace: workspaceStore.selectWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace: workspaceStore.deleteWorkspace,
    initDefaultWorkspace
  };
  
  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

/**
 * Hook to access the workspace context
 */
export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}

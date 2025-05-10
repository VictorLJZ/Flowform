import { useCallback } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { deleteWorkspace } from '@/services/workspace/deleteWorkspace';
import { initializeDefaultWorkspace } from '@/services/workspace/client';
import { toast } from '@/components/ui/use-toast';
import { useAuthSession } from './useAuthSession';

/**
 * Custom hook that encapsulates workspace deletion logic
 * Handles proper post-deletion workspace selection:
 * - If other workspaces exist, selects another one automatically
 * - If no workspaces remain, creates a default workspace
 */
export function useWorkspaceDeletion() {
  const { user } = useAuthSession();
  const currentWorkspaceId = useWorkspaceStore(state => state.currentWorkspaceId);
  const selectWorkspace = useWorkspaceStore(state => state.selectWorkspace);
  const setWorkspaces = useWorkspaceStore(state => state.setWorkspaces);
  const addWorkspace = useWorkspaceStore(state => state.addWorkspace);
  
  const handleDeleteWorkspace = useCallback(async (workspaceId: string) => {
    try {
      // Don't proceed if no workspace ID
      if (!workspaceId) {
        console.error('[useWorkspaceDeletion] No workspace ID provided');
        return { success: false };
      }
      
      // Step 1: Delete the workspace
      const { success, remainingWorkspaces } = await deleteWorkspace(workspaceId);
      
      if (!success) {
        throw new Error('Failed to delete workspace');
      }
      
      console.log('[useWorkspaceDeletion] Workspace deleted successfully', {
        deletedId: workspaceId,
        remainingCount: remainingWorkspaces?.length || 0
      });
      
      // Step 2: Update the workspaces in the store first before selection
      // This prevents the "not found in workspace list" error
      if (remainingWorkspaces) {
        // Update the store with the latest workspaces from the database
        setWorkspaces(remainingWorkspaces);
      }
      
      // Step 3: Handle the post-deletion workspace selection
      if (remainingWorkspaces && remainingWorkspaces.length > 0) {
        // If there are remaining workspaces, select the first one
        const nextWorkspace = remainingWorkspaces[0];
        
        // Use URL-based forced workspace selection mechanism to ensure a clean state
        // This is the most reliable approach for handling post-deletion selection
        console.log('[useWorkspaceDeletion] Setting up redirect to new workspace:', nextWorkspace.id);
        
        // Set session storage to prevent immediate overrides
        sessionStorage.setItem('manual_workspace_switch', 'true');
        sessionStorage.setItem('workspace_last_switched', Date.now().toString());
        
        // Create the redirect URL
        const currentUrl = new URL(window.location.href);
        const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;
        const redirectUrl = `${baseUrl}/dashboard?force_workspace=${nextWorkspace.id}&t=${Date.now()}`;
        
        // Use setTimeout to allow the toast to display before redirecting
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
        
        toast({
          title: "Workspace deleted",
          description: `Switched to workspace "${nextWorkspace.name}"`,
        });
        
        console.log('[useWorkspaceDeletion] Switched to workspace:', nextWorkspace.id);
      } else if (user) {
        // If no workspaces remain, create a new default workspace
        console.log('[useWorkspaceDeletion] No workspaces remain, creating default workspace');
        
        try {
          const newWorkspace = await initializeDefaultWorkspace(user.id);
          
          if (newWorkspace) {
            // Add the new workspace to the store and select it
            addWorkspace(newWorkspace);
            
            // Use URL-based forced workspace selection mechanism to ensure a clean state
            // This is the most reliable approach for handling post-deletion selection
            console.log('[useWorkspaceDeletion] Setting up redirect to new default workspace:', newWorkspace.id);
            
            // Store the newly created workspace ID in localStorage for the redirect to pick up
            localStorage.setItem('new_workspace_id', newWorkspace.id);
            localStorage.setItem('new_workspace_redirect_time', Date.now().toString());
            
            // Set session storage to prevent immediate overrides
            sessionStorage.setItem('manual_workspace_switch', 'true');
            sessionStorage.setItem('workspace_last_switched', Date.now().toString());
            
            // Create the redirect URL
            const currentUrl = new URL(window.location.href);
            const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;
            const redirectUrl = `${baseUrl}/dashboard?force_workspace=${newWorkspace.id}&t=${Date.now()}`;
            
            // Use setTimeout to allow the toast to display before redirecting
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 1000);
            
            toast({
              title: "Workspace deleted",
              description: "Created a new default workspace for you",
            });
            
            console.log('[useWorkspaceDeletion] Created and selected new default workspace:', newWorkspace.id);
          } else {
            throw new Error('Failed to create default workspace');
          }
        } catch (error) {
          console.error('[useWorkspaceDeletion] Error creating default workspace:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Deleted workspace, but failed to create a new default workspace.",
          });
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('[useWorkspaceDeletion] Error during workspace deletion workflow:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete workspace. Please try again.",
      });
      return { success: false };
    }
  }, [user, currentWorkspaceId, selectWorkspace, setWorkspaces, addWorkspace]);
  
  return { deleteWorkspace: handleDeleteWorkspace };
}

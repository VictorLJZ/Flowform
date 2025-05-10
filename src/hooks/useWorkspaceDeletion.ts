import { useCallback } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { deleteWorkspace } from '@/services/workspace/deleteWorkspace';
import { initializeDefaultWorkspace } from '@/services/workspace/client';
import { toast } from '@/components/ui/use-toast';
import { useAuthSession } from './useAuthSession';
import { useRouter } from 'next/navigation';

/**
 * Custom hook that encapsulates workspace deletion logic
 * Handles proper post-deletion workspace selection:
 * - If other workspaces exist, selects another one automatically
 * - If no workspaces remain, creates a default workspace
 */
export function useWorkspaceDeletion() {
  const { user } = useAuthSession();
  const router = useRouter();
  const currentWorkspaceId = useWorkspaceStore(state => state.currentWorkspaceId);
  const selectWorkspace = useWorkspaceStore(state => state.selectWorkspace);
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
      const setWorkspaces = useWorkspaceStore.getState().setWorkspaces;
      if (remainingWorkspaces) {
        // Update the store with the latest workspaces from the database
        setWorkspaces(remainingWorkspaces);
      }
      
      // Step 3: Handle the post-deletion workspace selection
      if (remainingWorkspaces && remainingWorkspaces.length > 0) {
        // If there are remaining workspaces, select the first one
        const nextWorkspace = remainingWorkspaces[0];
        
        // Use force option to bypass the workspace list validation
        selectWorkspace(nextWorkspace.id, { force: true });
        
        // Store in sessionStorage to ensure the selection persists
        sessionStorage.setItem('manual_workspace_switch', 'true');
        sessionStorage.setItem('workspace_last_switched', Date.now().toString());
        
        // Hard reset to dashboard with the new workspace forced in URL
        // This ensures a complete UI refresh with the new workspace
        window.location.href = `/dashboard?force_workspace=${nextWorkspace.id}`;
        
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
            
            // Force selection to bypass validation
            selectWorkspace(newWorkspace.id, { force: true });
            
            // Store in sessionStorage to ensure the selection persists
            sessionStorage.setItem('manual_workspace_switch', 'true');
            sessionStorage.setItem('workspace_last_switched', Date.now().toString());
            sessionStorage.setItem('new_workspace_id', newWorkspace.id);
            
            // Hard reset to dashboard with the new workspace forced in URL
            // This ensures a complete UI refresh with the new workspace
            window.location.href = `/dashboard?force_workspace=${newWorkspace.id}`;
            
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
  }, [user, currentWorkspaceId, selectWorkspace, addWorkspace]);
  
  return { deleteWorkspace: handleDeleteWorkspace };
}

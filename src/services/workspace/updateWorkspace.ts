import { createClient } from '@/lib/supabase/client';
import { Workspace } from '@/types/supabase-types';
import { networkLog } from '@/lib/debug-logger';
import { checkWorkspacePermissionClient } from '@/services/permissions/checkWorkspacePermissionClient';

type WorkspaceUpdateInput = Partial<Pick<Workspace, 
  'name' | 
  'description' | 
  'logo_url' | 
  'settings'
>>;

/**
 * Update an existing workspace
 * 
 * @param workspaceId - The ID of the workspace to update
 * @param workspaceData - The workspace data to update
 * @returns The updated workspace
 */
export async function updateWorkspace(
  workspaceId: string,
  workspaceData: WorkspaceUpdateInput
): Promise<Workspace> {
  networkLog('Initializing workspace update request', { workspaceId, updates: workspaceData });
  
  // Get user ID from the auth store (our single source of truth for auth state)
  const { useAuthStore } = await import('@/stores/authStore');
  const userId = useAuthStore.getState().user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const supabase = createClient();
  networkLog('Using verified user ID for permission check', { userId, workspaceId });

  // Check permissions using dedicated service with verified user ID
  const permissionCheck = await checkWorkspacePermissionClient(workspaceId, userId);
  if (!permissionCheck.hasPermission) {
    throw new Error('User does not have permission to update this workspace');
  }

  // Add updated_at timestamp
  const updateData = {
    ...workspaceData,
    updated_at: new Date().toISOString()
  };

  // Make a single database call for the update
  const { data, error } = await supabase
    .from('workspaces')
    .update(updateData)
    .eq('id', workspaceId)
    .select()
    .single();

  if (error) {
    networkLog('Error updating workspace', { 
      workspaceId, 
      errorCode: error.code,
      errorMessage: error.message
    });
    console.error('Error updating workspace:', error);
    throw error;
  }

  networkLog('Workspace updated successfully', { workspaceId, name: data.name });
  return data;
}

import { Workspace } from "@/types/supabase-types";
import { checkWorkspacePermissionClient } from "@/services/permissions/checkWorkspacePermissionClient";
import { networkLog } from "@/lib/debug-logger";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Update an existing workspace using an authenticated Supabase client
 * 
 * @param supabase - The authenticated Supabase client instance
 * @param workspaceId - The ID of the workspace to update
 * @param workspaceData - The workspace data to update
 * @returns The updated workspace
 */
type WorkspaceUpdateInput = Partial<Pick<Workspace, 
  'name' | 
  'description' | 
  'logo_url' | 
  'settings'
>>;

export async function updateWorkspace(
  supabase: SupabaseClient,
  workspaceId: string,
  workspaceData: WorkspaceUpdateInput
): Promise<Workspace> {
  networkLog('Initializing workspace update request', { workspaceId, updates: workspaceData });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Supabase client is not authenticated.");
  }
  const userId = user.id;
  networkLog('Using verified user ID from authenticated client', { userId, workspaceId });

  const permissionCheck = await checkWorkspacePermissionClient(workspaceId, userId);
  if (!permissionCheck.hasPermission) {
    throw new Error('User does not have permission to update this workspace');
  }

  const updateData = {
    ...workspaceData,
    updated_at: new Date().toISOString()
  };

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

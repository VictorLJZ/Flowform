import { DbWorkspace, ApiWorkspaceUpdateInput } from "@/types/workspace";
import { checkWorkspacePermissionClient } from "@/services/permissions/checkWorkspacePermissionClient";
import { networkLog } from "@/lib/debug-logger";
import { SupabaseClient } from "@supabase/supabase-js";
import { workspaceUpdateInputToDb } from "@/utils/type-utils";

/**
 * Update an existing workspace using an authenticated Supabase client
 * 
 * @param supabase - The authenticated Supabase client instance
 * @param workspaceId - The ID of the workspace to update
 * @param workspaceData - The workspace data to update
 * @returns The updated workspace
 */

export async function updateWorkspace(
  supabase: SupabaseClient,
  workspaceId: string,
  workspaceData: ApiWorkspaceUpdateInput
): Promise<DbWorkspace> {
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

  // Transform API data to DB format
  const updateData = workspaceUpdateInputToDb(workspaceData);

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

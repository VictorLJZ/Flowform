import { ApiWorkspaceRole } from '@/types/workspace';
import { networkLog } from '@/lib/debug-logger';

/**
 * Check if user has permission to perform operations on a workspace - Client-side implementation
 * Uses the API route to check permissions
 * 
 * @param workspaceId - ID of the workspace to check permissions for
 * @param userId - ID of the user to check permissions for
 * @param requiredRoles - Array of roles that have permission (defaults to owner and admin)
 * @returns Object with hasPermission boolean and user's role if found
 */
export async function checkWorkspacePermissionClient(
  workspaceId: string,
  userId: string,
  requiredRoles: ApiWorkspaceRole[] = ['owner', 'admin']
): Promise<{hasPermission: boolean, role?: string}> {
  if (!userId) {
    networkLog('Permission check failed - no userId provided', { workspaceId });
    return { hasPermission: false };
  }

  try {
    // Convert roles array to JSON string for URL
    const rolesParam = encodeURIComponent(JSON.stringify(requiredRoles));
    
    // Make API request
    const response = await fetch(
      `/api/permissions/workspace?workspaceId=${encodeURIComponent(workspaceId)}&userId=${encodeURIComponent(userId)}&requiredRoles=${rolesParam}`
    );
    
    // Check for success
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    // Parse response
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error checking workspace permission:', error);
    return { hasPermission: false };
  }
}

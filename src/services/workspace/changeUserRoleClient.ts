import { DbWorkspaceRole } from '@/types/workspace';

/**
 * Change the role of a workspace member - Client-side implementation
 * Uses the API route to update member roles
 * 
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user to update
 * @param role - The new role to assign
 * @returns Success status
 */
export async function changeUserRoleClient(
  workspaceId: string,
  userId: string,
  role: DbWorkspaceRole
): Promise<boolean> {
  try {
    // Make the API request
    const response = await fetch('/api/workspaces/members/role', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceId,
        userId,
        role,
      }),
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error changing user role:', error);
    throw error;
  }
}

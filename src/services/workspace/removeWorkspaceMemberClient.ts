/**
 * Remove a member from a workspace - Client-side implementation
 * Uses the API route to remove workspace members
 * 
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user to remove
 * @returns Success status
 */
export async function removeWorkspaceMemberClient(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  try {
    // Make the API request
    const response = await fetch('/api/workspaces/members', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceId,
        userId,
      }),
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error removing workspace member:', error);
    throw error;
  }
}

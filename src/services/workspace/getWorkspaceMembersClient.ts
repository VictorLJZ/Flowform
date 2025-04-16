import { WorkspaceMember, Profile } from '@/types/supabase-types';

// Define the expected return type matching the server implementation
type WorkspaceMemberWithProfile = WorkspaceMember & {
  profile: Pick<Profile, 'full_name' | 'avatar_url'> & { title?: string | null };
};

/**
 * Get all members of a workspace with their profile information - Client-side implementation
 * Uses the API route to fetch workspace members data
 * 
 * @param workspaceId - The ID of the workspace
 * @returns Array of workspace members with profiles
 */
export async function getWorkspaceMembersClient(
  workspaceId: string
): Promise<WorkspaceMemberWithProfile[]> {
  try {
    // Make the API request
    const response = await fetch(`/api/workspaces/members?workspaceId=${encodeURIComponent(workspaceId)}`);
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    // Parse the response data
    const members = await response.json();
    return members;
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    throw error;
  }
}

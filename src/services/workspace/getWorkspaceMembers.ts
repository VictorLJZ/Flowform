import { createClient } from '@/lib/supabase/server';
import { WorkspaceMemberWithProfile } from '@/types/workspace-types';

/**
 * Get all members of a workspace with their profile information
 * 
 * @param workspaceId - The ID of the workspace
 * @returns Array of workspace members with profiles
 */
export async function getWorkspaceMembers(
  workspaceId: string
): Promise<WorkspaceMemberWithProfile[]> {
  const supabase = await createClient();

  // Get all members with their profile information using a join
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      *,
      profile:profiles(user_id, full_name, avatar_url, title)
    `)
    .eq('workspace_id', workspaceId);

  if (error) {
    console.error('Error fetching workspace members:', error);
    throw error;
  }

  // Format the response to match our expected type
  const membersWithProfiles = data.map(member => {
    const { profile, ...memberData } = member;
    return {
      ...memberData,
      profile: profile || {
        full_name: 'Unknown User',
        avatar_url: null,
        title: null
      }
    };
  });

  return membersWithProfiles;
}

import { createClient } from '@/lib/supabase/server';
import { DbWorkspaceMember, DbWorkspaceMemberWithProfile } from '@/types/workspace';

/**
 * Get all members of a workspace with their profile information
 * 
 * @param workspaceId - The ID of the workspace
 * @returns Array of workspace members with profiles
 */
export async function getWorkspaceMembers(
  workspaceId: string
): Promise<DbWorkspaceMemberWithProfile[]> {
  const supabase = await createClient();

  try {
    // Fetch all workspace members first
    const { data: membersData, error: membersError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId);
    
    if (membersError) {
      console.error('Error fetching workspace members:', membersError);
      throw membersError;
    }
    
    if (!membersData || membersData.length === 0) {
      return []; // No members found
    }
    
    // Extract user IDs to fetch their profiles
    const userIds = membersData.map(member => member.user_id);
    
    // Fetch all relevant profiles in a single query
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    // Create a map of user ID to profile for easy lookup
    const profileMap = new Map();
    profilesData?.forEach(profile => {
      profileMap.set(profile.id, profile);
    });
    
    // Combine member data with profile data
    const membersWithProfiles = membersData.map(member => {
      const profile = profileMap.get(member.user_id) || {
        full_name: 'Unknown User',
        avatar_url: null,
        title: null
      };
      
      // Create a properly typed DbWorkspaceMemberWithProfile
      const memberWithProfile: DbWorkspaceMemberWithProfile = {
        ...member as DbWorkspaceMember,
        profile: {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          email: profile.email || null
        }
      };
      
      return memberWithProfile;
    });
    
    return membersWithProfiles;
  } catch (error) {
    console.error('Error in getWorkspaceMembers:', error);
    throw error;
  }
}

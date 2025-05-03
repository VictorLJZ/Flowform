import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { removeMember } from '@/services/workspace/removeMember';

// Get all members of a workspace with their profile information
// Get all members of a workspace with their profile information
export async function GET(request: Request) {
  try {
    // Extract workspaceId from query params
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch all workspace members first
    const { data: membersData, error: membersError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId);
    
    if (membersError) {
      console.error('[API] Error fetching workspace members:', membersError);
      return NextResponse.json(
        { error: membersError.message },
        { status: 500 }
      );
    }
    
    if (!membersData || membersData.length === 0) {
      return NextResponse.json([]); // No members found
    }
    
    // Extract user IDs to fetch their profiles
    const userIds = membersData.map(member => member.user_id);
    
    // Fetch all relevant profiles in a single query
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    
    if (profilesError) {
      console.error('[API] Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: profilesError.message },
        { status: 500 }
      );
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
      
      return {
        workspace_id: member.workspace_id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        profile
      };
    });

    return NextResponse.json(membersWithProfiles);
  } catch (error: unknown) {
    console.error('[API] Error in workspace members fetch:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

// Remove a member from a workspace
export async function DELETE(request: Request) {
  try {
    // Extract data from request body
    const body = await request.json();
    const { workspaceId, userId } = body;
    
    if (!workspaceId || !userId) {
      return NextResponse.json(
        { error: 'Workspace ID and user ID are required' },
        { status: 400 }
      );
    }
    
    // Call the service function to remove the member
    await removeMember(workspaceId, userId);
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[API] Error removing workspace member:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

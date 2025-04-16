import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

    // Get all members with their profile information using a join
    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        *,
        profile:profiles(user_id, full_name, avatar_url, title)
      `)
      .eq('workspace_id', workspaceId);

    if (error) {
      console.error('[API] Error fetching workspace members:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
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

    return NextResponse.json(membersWithProfiles);
  } catch (error: any) {
    console.error('[API] Error in workspace members fetch:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

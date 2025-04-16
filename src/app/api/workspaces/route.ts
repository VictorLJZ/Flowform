import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Get all workspaces for the current user
export async function GET(request: Request) {
  try {
    // Extract userId from query params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    console.log('[API] Getting workspaces for userId:', userId);

    // Get workspace memberships with timeout protection
    const { data: memberships, error: membershipError } = await supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', userId);

    // Check for errors
    if (membershipError) {
      console.error('[API] Error fetching workspace memberships:', membershipError);
      return NextResponse.json(
        { error: membershipError.message },
        { status: 500 }
      );
    }

    // Check for empty results
    if (!memberships || memberships.length === 0) {
      console.log('[API] No workspace memberships found for user');
      return NextResponse.json([]);
    }

    // Get workspace IDs from memberships
    const workspaceIds = memberships.map((m) => m.workspace_id);
    console.log('[API] Found workspace IDs:', workspaceIds);

    // Get workspaces
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('*')
      .in('id', workspaceIds);

    // Check for errors
    if (workspacesError) {
      console.error('[API] Error fetching workspaces:', workspacesError);
      return NextResponse.json(
        { error: workspacesError.message },
        { status: 500 }
      );
    }

    // Log success
    console.log('[API] Successfully fetched workspaces:', {
      count: workspaces?.length || 0,
      names: workspaces?.map((w: any) => w.name) || []
    });

    // Return workspaces
    return NextResponse.json(workspaces || []);
  } catch (error: any) {
    console.error('[API] ERROR in workspace fetch:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

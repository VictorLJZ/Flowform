import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * API route to directly verify if a workspace exists
 * This endpoint is used to break the infinite loop when forcing workspace selection
 */
export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const workspaceId = params.workspaceId;
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    console.log('[API:verify] Verifying workspace existence:', workspaceId);

    // First check if the user is a member of this workspace
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError) {
      console.error('[API:verify] Error checking membership:', memberError);
      return NextResponse.json(
        { error: memberError.message },
        { status: 500 }
      );
    }

    // If no membership record exists, check if the workspace itself exists
    if (!memberData) {
      // Verify if the workspace exists at all
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('id', workspaceId)
        .maybeSingle();

      if (workspaceError) {
        console.error('[API:verify] Error checking workspace:', workspaceError);
        return NextResponse.json(
          { error: workspaceError.message },
          { status: 500 }
        );
      }

      const exists = !!workspaceData;
      console.log('[API:verify] Workspace exists but user is not a member:', exists);
      
      // Return result
      return NextResponse.json({ 
        exists, 
        isMember: false 
      });
    }

    // User is a member of the workspace
    console.log('[API:verify] User is a member of workspace:', workspaceId);
    return NextResponse.json({ 
      exists: true,
      isMember: true
    });
  } catch (error: unknown) {
    console.error('[API:verify] Error verifying workspace:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

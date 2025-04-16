import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { WorkspaceRole } from '@/services/permissions/checkWorkspacePermission';

// API endpoint to check user permissions for a workspace
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspaceId');
    const userId = url.searchParams.get('userId');
    const requiredRoles = url.searchParams.get('requiredRoles');

    if (!workspaceId || !userId) {
      return NextResponse.json(
        { error: 'Workspace ID and User ID are required' },
        { status: 400 }
      );
    }

    // Parse required roles or use default
    let roles: WorkspaceRole[] = ['owner', 'admin'];
    if (requiredRoles) {
      try {
        roles = JSON.parse(requiredRoles) as WorkspaceRole[];
      } catch (e) {
        console.error('[API] Invalid roles format:', e);
      }
    }

    const supabase = await createClient();
    
    if (!userId) {
      return NextResponse.json({ hasPermission: false });
    }
    
    // Check membership and role with a single query
    const { data, error } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();
      
    if (error || !data) {
      return NextResponse.json({ hasPermission: false });
    }
    
    return NextResponse.json({ 
      hasPermission: roles.includes(data.role as WorkspaceRole),
      role: data.role
    });
  } catch (error: unknown) {
    console.error('[API] Error in permissions API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

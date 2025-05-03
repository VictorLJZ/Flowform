import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { changeUserRole } from '@/services/workspace/changeUserRole';

// Change a workspace member's role
export async function PATCH(request: Request) {
  try {
    // Extract data from request body
    const body = await request.json();
    const { workspaceId, userId, role } = body;
    
    if (!workspaceId || !userId || !role) {
      return NextResponse.json(
        { error: 'Workspace ID, user ID, and role are required' },
        { status: 400 }
      );
    }
    
    // Validate role
    const validRoles = ['owner', 'admin', 'editor', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }
    
    // Call the service function to change the role
    await changeUserRole(workspaceId, userId, role);
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[API] Error changing member role:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

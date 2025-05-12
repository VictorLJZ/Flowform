import { NextResponse } from 'next/server';
import { isPostgrestError } from '@/types';
import { changeUserRole } from '@/services/workspace/changeUserRole';
import { transferWorkspaceOwnership } from '@/services/workspace/transferWorkspaceOwnership';
import { createClient } from '@/lib/supabase/server';
import { ApiWorkspaceRole } from '@/types/workspace';

// Change a workspace member's role or transfer ownership
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Extract data from request body
    const body = await request.json();
    const { workspaceId, userId: targetUserId, role: requestedRole } = body;
    
    if (!workspaceId || !targetUserId || !requestedRole) {
      return NextResponse.json(
        { error: 'Workspace ID, user ID, and role are required' },
        { status: 400 }
      );
    }
    
    // Validate role
    const validRoles = ['owner', 'admin', 'editor', 'viewer'];
    if (!validRoles.includes(requestedRole)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }
    
    // --- Check for Ownership Transfer Condition --- 
    let isOwnershipTransfer = false;
    if (requestedRole === 'owner') {
      // Fetch initiator's role to confirm they are the owner
      const { data: initiatorMember, error: fetchError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single(); // Expecting only one record

      if (fetchError || !initiatorMember) {
          console.error('Error fetching initiator role for transfer check:', fetchError);
          // Don't expose detailed errors, treat as permission issue or bad request
          return NextResponse.json({ error: 'Could not verify initiator permissions.' }, { status: 403 }); 
      }

      if (initiatorMember.role === 'owner') {
        isOwnershipTransfer = true;
      }
      // If initiator is not owner but requested role is owner, changeUserRole will handle the permission error
    }
    
    // --- Execute Action --- 
    if (isOwnershipTransfer) {
      // Call the ownership transfer service function
      await transferWorkspaceOwnership(workspaceId, targetUserId);
      console.log(`[API] Initiated ownership transfer in workspace ${workspaceId} to user ${targetUserId}`);
    } else {
      // Call the standard role change service function
      await changeUserRole(workspaceId, targetUserId, requestedRole as ApiWorkspaceRole);
      console.log(`[API] Changed role for user ${targetUserId} in workspace ${workspaceId} to ${requestedRole}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[API] Error changing member role (raw):', error); 
    console.error('[API] Error changing member role (stringified):', JSON.stringify(error, null, 2));
    
    // Check if it's a Supabase specific error (PostgrestError)
    if (isPostgrestError(error)) {
      // It's a Supabase error, use its message
      const dbErrorMessage = error.message || 'An unspecified database error occurred.';
      return NextResponse.json({ error: `Database error: ${dbErrorMessage}` }, { status: 500 });
    } else if (error instanceof Error) {
      // Standard JS error
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      // Fallback for non-Error objects
      return NextResponse.json({ error: 'An unknown server error occurred while changing the role.' }, { status: 500 });
    }
  }
}

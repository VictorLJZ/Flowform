/**
 * API Routes for individual workspace invitation operations
 * 
 * DELETE /api/workspaces/[id]/invitations/[invitationId] - Delete an invitation
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as invitationsService from '@/services/workspace/invitations.server';
import * as permissionsService from '@/services/workspace/permissions.server';

/**
 * DELETE handler - delete a specific invitation
 */
export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string; invitationId: string }> | { id: string; invitationId: string } }
) {
  // Next.js 15 pattern for handling dynamic route params - we need to await the params object
  const resolvedParams = 'then' in params ? await params : params;
  const workspaceId = resolvedParams.id;
  const invitationId = resolvedParams.invitationId;
  
  try {
    
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user has admin access to manage invitations
    const canManage = await permissionsService.canManageMembers(workspaceId, user.id);
    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to manage workspace invitations' },
        { status: 403 }
      );
    }
    
    // Delete the invitation
    await invitationsService.deleteInvitation(invitationId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting workspace invitation:`, error);
    return NextResponse.json(
      { error: `Failed to delete invitation: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

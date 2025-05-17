/**
 * API Route for accepting a workspace invitation
 * 
 * POST /api/invitations/[token]/accept - Accept an invitation and join the workspace
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as invitationsService from '@/services/workspace/invitations.server';
import * as membersService from '@/services/workspace/members.server';
import * as workspacesService from '@/services/workspace/workspaces.server';

/**
 * Extract the invitation token from the params
 */
interface Params {
  params: {
    token: string;
  };
}

/**
 * POST handler - accept invitation and join workspace
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const { token } = params;
    
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get invitation by token
    const invitation = await invitationsService.getInvitationByToken(token);
    
    // If invitation not found, expired, or already accepted/declined
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `Invitation has already been ${invitation.status}` },
        { status: 400 }
      );
    }
    
    if (invitationsService.isInvitationExpired(invitation)) {
      // Update status to expired
      await invitationsService.updateInvitationStatus(invitation.id, 'expired');
      
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }
    
    // Check workspace exists
    const workspace = await workspacesService.getWorkspaceById(invitation.workspace_id);
    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace no longer exists' },
        { status: 404 }
      );
    }
    
    // Validate email matches (case insensitive)
    // Optional: Skip this check if needed for flexibility
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();
    
    if (!profile || !profile.email || profile.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }
    
    // Check if already a member
    const isMember = await membersService.checkWorkspaceMembership(invitation.workspace_id, user.id);
    if (isMember) {
      // Mark invitation as accepted
      await invitationsService.updateInvitationStatus(invitation.id, 'accepted');
      
      return NextResponse.json({
        success: true,
        workspaceId: invitation.workspace_id,
        message: 'You are already a member of this workspace'
      });
    }
    
    // Add user to workspace with the invited role
    await membersService.addWorkspaceMember({
      workspace_id: invitation.workspace_id,
      user_id: user.id,
      role: invitation.role
    });
    
    // Mark invitation as accepted
    await invitationsService.updateInvitationStatus(invitation.id, 'accepted');
    
    return NextResponse.json({
      success: true,
      workspaceId: invitation.workspace_id
    });
  } catch (error) {
    console.error(`Error accepting invitation:`, error);
    return NextResponse.json(
      { error: `Failed to accept invitation: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

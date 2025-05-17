/**
 * API Routes for public invitation operations
 * 
 * GET /api/invitations/[token] - Get invitation details by token
 */

import { NextResponse } from 'next/server';
import * as invitationsService from '@/services/workspace/invitations.server';
import * as workspacesService from '@/services/workspace/workspaces.server';
import { dbToApiWorkspaceInvitation } from '@/utils/type-utils/workspace/DbToApiWorkspace';

/**
 * Extract the invitation token from the params
 */
interface Params {
  params: {
    token: string;
  };
}

/**
 * GET handler - get invitation details by token (public endpoint)
 */
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ token: string }> | { token: string } }
) {
  // Next.js 15 pattern for handling dynamic route params - we need to await the params object
  const resolvedParams = 'then' in params ? await params : params;
  const token = resolvedParams.token;
  
  try {
    
    // Get invitation by token
    const invitation = await invitationsService.getInvitationByToken(token);
    
    // If invitation not found, or has expired
    if (!invitation || invitation.status !== 'pending' || invitationsService.isInvitationExpired(invitation)) {
      // Auto-expire if needed
      if (invitation && invitation.status === 'pending' && invitationsService.isInvitationExpired(invitation)) {
        await invitationsService.updateInvitationStatus(invitation.id, 'expired');
      }
      
      return NextResponse.json(
        { error: 'Invitation not found or has expired' },
        { status: 404 }
      );
    }
    
    // Get workspace details to include in response
    const workspace = await workspacesService.getWorkspaceById(invitation.workspace_id);
    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace no longer exists' },
        { status: 404 }
      );
    }
    
    // Transform DB invitation to API format
    const apiInvitation = dbToApiWorkspaceInvitation(invitation);
    
    // Add workspace name but not other details
    return NextResponse.json({
      ...apiInvitation,
      workspaceName: workspace.name
    });
  } catch (error) {
    console.error(`Error fetching invitation:`, error);
    return NextResponse.json(
      { error: `Failed to get invitation: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * API Routes for workspace invitation operations
 * 
 * GET /api/workspaces/[id]/invitations - Get all invitations for a workspace
 * POST /api/workspaces/[id]/invitations - Create a new invitation
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as invitationsService from '@/services/workspace/invitations.server';
import * as permissionsService from '@/services/workspace/permissions.server';
import { ApiWorkspaceInvitationInput } from '@/types/workspace';
import { dbToApiWorkspaceInvitation } from '@/utils/type-utils/workspace/DbToApiWorkspace';
import { apiToDbWorkspaceInvitationInput } from '@/utils/type-utils/workspace/ApiToDbWorkspace';

/**
 * Extract the workspace ID from the params
 */
interface Params {
  params: {
    id: string;
  };
}

/**
 * GET handler - retrieve all invitations for a workspace
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const { id: workspaceId } = params;
    
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
        { error: 'You do not have permission to view workspace invitations' },
        { status: 403 }
      );
    }
    
    // Get all invitations for this workspace
    const invitations = await invitationsService.getInvitationsByWorkspace(workspaceId);
    
    // Transform DB types to API types
    const apiInvitations = invitations.map(dbToApiWorkspaceInvitation);
    
    return NextResponse.json(apiInvitations);
  } catch (error) {
    console.error(`Error fetching workspace invitations:`, error);
    return NextResponse.json(
      { error: `Failed to get workspace invitations: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * POST handler - create a new workspace invitation
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const { id: workspaceId } = params;
    
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user has permissions to create invitations
    const canManage = await permissionsService.canManageMembers(workspaceId, user.id);
    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to invite members to this workspace' },
        { status: 403 }
      );
    }
    
    // Parse invitation data
    const invitationData = await request.json() as ApiWorkspaceInvitationInput;
    
    // Validate required fields
    if (!invitationData.email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    if (!invitationData.role || !['admin', 'editor', 'viewer'].includes(invitationData.role)) {
      return NextResponse.json(
        { error: 'Valid role (admin, editor, or viewer) is required' },
        { status: 400 }
      );
    }
    
    // Check if user is trying to assign a role higher than or equal to their own
    const currentUserRole = await permissionsService.getUserRoleInWorkspace(workspaceId, user.id);
    
    const ROLE_WEIGHTS: Record<string, number> = {
      'viewer': 1,
      'editor': 2,
      'admin': 3,
      'owner': 4
    };
    
    if (ROLE_WEIGHTS[invitationData.role] >= ROLE_WEIGHTS[currentUserRole!]) {
      return NextResponse.json(
        { error: 'You cannot assign a role equal to or higher than your own' },
        { status: 403 }
      );
    }
    
    // Transform API input to DB format
    const dbInvitationData = apiToDbWorkspaceInvitationInput({
      ...invitationData,
      workspaceId: workspaceId,
      invitedBy: user.id
    });
    
    // Create the invitation
    const createdInvitation = await invitationsService.createInvitation(dbInvitationData);
    
    // Transform DB result to API format and return
    return NextResponse.json(dbToApiWorkspaceInvitation(createdInvitation), { status: 201 });
  } catch (error) {
    console.error(`Error creating workspace invitation:`, error);
    return NextResponse.json(
      { error: `Failed to create invitation: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

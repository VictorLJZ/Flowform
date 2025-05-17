/**
 * API Routes for workspace member management
 * 
 * GET /api/workspaces/[id]/members - Get all members of a workspace
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as membersService from '@/services/workspace/members.server';
import * as permissionsService from '@/services/workspace/permissions.server';
import { dbToApiWorkspaceMemberWithProfile } from '@/utils/type-utils/workspace/DbToApiWorkspace';

/**
 * Extract the workspace ID from the params
 */
interface Params {
  params: {
    id: string;
  };
}

/**
 * GET handler - retrieve all members of a workspace
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
    
    // Check if user has access to the workspace
    const hasAccess = await permissionsService.checkWorkspaceAccess(workspaceId, user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this workspace' },
        { status: 403 }
      );
    }
    
    // Get workspace members with profiles
    const members = await membersService.getWorkspaceMembersWithProfiles(workspaceId);
    
    // Transform DB types to API types
    const apiMembers = members.map(dbToApiWorkspaceMemberWithProfile);
    
    return NextResponse.json(apiMembers);
  } catch (error) {
    console.error(`Error fetching workspace members:`, error);
    return NextResponse.json(
      { error: `Failed to get workspace members: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

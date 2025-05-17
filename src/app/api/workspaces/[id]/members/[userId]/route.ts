/**
 * API Routes for individual workspace member operations
 * 
 * PUT /api/workspaces/[id]/members/[userId] - Update a member's role
 * DELETE /api/workspaces/[id]/members/[userId] - Remove a member from the workspace
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as membersService from '@/services/workspace/members.server';
import * as permissionsService from '@/services/workspace/permissions.server';
import { ApiWorkspaceMemberUpdate, ApiWorkspaceRole } from '@/types/workspace';
import { dbToApiWorkspaceMember } from '@/utils/type-utils/workspace/DbToApiWorkspace';

/**
 * Extract the workspace ID and user ID from the params
 */
interface Params {
  params: {
    id: string;
    userId: string;
  };
}

/**
 * PUT handler - update a member's role
 */
export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ id: string; userId: string }> | { id: string; userId: string } }
) {
  // Next.js 15 pattern for handling dynamic route params - we need to await the params object
  const resolvedParams = 'then' in params ? await params : params;
  const workspaceId = resolvedParams.id;
  const targetUserId = resolvedParams.userId;
  
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
    
    // Check if user has permission to manage members
    const canManage = await permissionsService.canManageMembers(workspaceId, user.id);
    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to manage workspace members' },
        { status: 403 }
      );
    }
    
    // Parse request body to get the new role
    const { role } = await request.json() as ApiWorkspaceMemberUpdate;
    
    // Validate the role
    if (!role || !['owner', 'admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role provided' },
        { status: 400 }
      );
    }
    
    // Cannot change own role
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      );
    }
    
    // Get current user role to verify permissions
    const currentUserRole = await permissionsService.getUserRoleInWorkspace(workspaceId, user.id);
    const targetUserRole = await permissionsService.getUserRoleInWorkspace(workspaceId, targetUserId);
    
    // Check if target user exists in workspace
    if (!targetUserRole) {
      return NextResponse.json(
        { error: 'User is not a member of this workspace' },
        { status: 404 }
      );
    }
    
    // Check if current user has sufficient permissions to change the target user's role
    // Users can only manage roles lower than their own in the hierarchy
    const ROLE_WEIGHTS: Record<string, number> = {
      'viewer': 1,
      'editor': 2,
      'admin': 3,
      'owner': 4
    };
    
    if (ROLE_WEIGHTS[currentUserRole!] <= ROLE_WEIGHTS[targetUserRole]) {
      return NextResponse.json(
        { error: 'You cannot manage users with equal or higher role than your own' },
        { status: 403 }
      );
    }
    
    // Check if trying to assign a role higher than or equal to current user's role
    if (ROLE_WEIGHTS[role] >= ROLE_WEIGHTS[currentUserRole!]) {
      return NextResponse.json(
        { error: 'You cannot assign a role equal to or higher than your own' },
        { status: 403 }
      );
    }
    
    // Update the member's role
    const updatedMember = await membersService.updateMemberRole(
      workspaceId,
      targetUserId,
      role as ApiWorkspaceRole
    );
    
    // Transform DB result to API format
    return NextResponse.json(dbToApiWorkspaceMember(updatedMember));
  } catch (error) {
    console.error(`Error updating workspace member:`, error);
    return NextResponse.json(
      { error: `Failed to update workspace member: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - remove a member from a workspace
 */
export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string; userId: string }> | { id: string; userId: string } }
) {
  // Next.js 15 pattern for handling dynamic route params - we need to await the params object
  const resolvedParams = 'then' in params ? await params : params;
  const workspaceId = resolvedParams.id;
  const targetUserId = resolvedParams.userId;
  
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
    
    // Two valid cases:
    // 1. User is removing themselves (leaving the workspace)
    const isSelfRemoval = targetUserId === user.id;
    
    // 2. User has permission to manage members
    const canManage = isSelfRemoval || await permissionsService.canManageMembers(workspaceId, user.id);
    
    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to remove workspace members' },
        { status: 403 }
      );
    }
    
    // If not self-removal, check additional permissions
    if (!isSelfRemoval) {
      // Get current user role
      const currentUserRole = await permissionsService.getUserRoleInWorkspace(workspaceId, user.id);
      const targetUserRole = await permissionsService.getUserRoleInWorkspace(workspaceId, targetUserId);
      
      // Check if target user exists in workspace
      if (!targetUserRole) {
        return NextResponse.json(
          { error: 'User is not a member of this workspace' },
          { status: 404 }
        );
      }
      
      // Check if current user has sufficient permissions based on roles
      const ROLE_WEIGHTS: Record<string, number> = {
        'viewer': 1,
        'editor': 2,
        'admin': 3,
        'owner': 4
      };
      
      if (ROLE_WEIGHTS[currentUserRole!] <= ROLE_WEIGHTS[targetUserRole]) {
        return NextResponse.json(
          { error: 'You cannot remove users with equal or higher role than your own' },
          { status: 403 }
        );
      }
    }
    
    // Remove the member
    await membersService.removeWorkspaceMember(workspaceId, targetUserId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error removing workspace member:`, error);
    return NextResponse.json(
      { error: `Failed to remove workspace member: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

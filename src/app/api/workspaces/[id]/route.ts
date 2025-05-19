/**
 * API Routes for individual workspace operations
 * 
 * GET /api/workspaces/[id] - Get a specific workspace by ID
 * PUT /api/workspaces/[id] - Update a specific workspace
 * DELETE /api/workspaces/[id] - Delete a workspace
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as workspacesService from '@/services/workspace/workspaces.server';
import * as permissionsService from '@/services/workspace/permissions.server';
import { ApiWorkspaceUpdateInput } from '@/types/workspace';
import { dbToApiWorkspace } from '@/utils/type-utils/workspace/DbToApiWorkspace';
import { workspaceUpdateInputToDb } from '@/utils/type-utils/workspace/ApiToDbWorkspace';

/**
 * GET handler - retrieve a specific workspace by ID
 */
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Next.js 15 pattern for handling dynamic route params - we need to await the params object
  const resolvedParams = 'then' in params ? await params : params;
  const workspaceId = resolvedParams.id;
  
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
    
    // Check if user has access to the workspace
    const hasAccess = await permissionsService.checkWorkspaceAccess(workspaceId, user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this workspace' },
        { status: 403 }
      );
    }
    
    // Retrieve workspace
    const workspace = await workspacesService.getWorkspaceById(workspaceId);
    
    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }
    
    // Transform DB type to API type
    return NextResponse.json(dbToApiWorkspace(workspace));
  } catch (error) {
    console.error(`Error fetching workspace ${workspaceId}:`, error);
    return NextResponse.json(
      { error: `Failed to get workspace: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * PUT handler - update a specific workspace
 */
export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Next.js 15 pattern for handling dynamic route params - we need to await the params object
  const resolvedParams = 'then' in params ? await params : params;
  const workspaceId = resolvedParams.id;
  
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
    
    // Check if user has admin access to the workspace
    const hasAccess = await permissionsService.checkWorkspaceAccess(workspaceId, user.id, 'admin');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have permission to update this workspace' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const updateData = await request.json() as ApiWorkspaceUpdateInput;
    
    // Transform API input to DB format
    const dbUpdateData = workspaceUpdateInputToDb(updateData);
    
    // Update workspace
    const updatedWorkspace = await workspacesService.updateWorkspace(
      workspaceId, 
      dbUpdateData
    );
    
    // Transform DB result back to API format
    return NextResponse.json(dbToApiWorkspace(updatedWorkspace));
  } catch (error) {
    console.error(`Error updating workspace ${workspaceId}:`, error);
    return NextResponse.json(
      { error: `Failed to update workspace: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - delete a workspace
 */
export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Next.js 15 pattern for handling dynamic route params - we need to await the params object
  const resolvedParams = 'then' in params ? await params : params;
  const workspaceId = resolvedParams.id;
  
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
    
    // Check if user has owner access to the workspace
    const canDelete = await permissionsService.canDeleteWorkspace(workspaceId, user.id);
    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this workspace' },
        { status: 403 }
      );
    }
    
    // Delete workspace and all associated data
    await workspacesService.deleteWorkspace(workspaceId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting workspace ${workspaceId}:`, error);
    return NextResponse.json(
      { error: `Failed to delete workspace: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

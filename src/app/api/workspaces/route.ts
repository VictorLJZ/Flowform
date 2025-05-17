/**
 * API Routes for workspace core operations
 * 
 * GET /api/workspaces - Get all user's workspaces
 * POST /api/workspaces - Create a new workspace
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as workspacesService from '@/services/workspace/workspaces.server';
import { ApiWorkspaceInput } from '@/types/workspace';
import { dbToApiWorkspace } from '@/utils/type-utils/workspace/DbToApiWorkspace';
import { apiToDbWorkspace } from '@/utils/type-utils/workspace/ApiToDbWorkspace';

/**
 * GET handler - retrieve all workspaces for the current user
 */
export async function GET() {
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
    
    // Get workspaces the user is a member of
    const userWorkspaces = await workspacesService.getUserWorkspaces(user.id);
    
    // Transform DB types to API types
    const apiWorkspaces = userWorkspaces.map(dbToApiWorkspace);
    
    return NextResponse.json(apiWorkspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: `Failed to get workspaces: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * POST handler - create a new workspace
 */
export async function POST(request: Request) {
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
    
    // Parse request body
    const workspaceInput = await request.json() as ApiWorkspaceInput;
    
    // Validate required fields
    if (!workspaceInput.name?.trim()) {
      return NextResponse.json(
        { error: 'Workspace name is required' },
        { status: 400 }
      );
    }
    
    // Transform API input to DB format
    const dbWorkspaceData = apiToDbWorkspace({
      ...workspaceInput,
      createdBy: user.id
    });
    
    // Create workspace
    const createdWorkspace = await workspacesService.createWorkspace(dbWorkspaceData);
    
    // Transform DB result back to API format
    return NextResponse.json(dbToApiWorkspace(createdWorkspace), { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: `Failed to create workspace: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

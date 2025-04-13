import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Input validation schema
const FormCreateSchema = z.object({
  workspace_id: z.string().uuid({
    message: "Workspace ID must be a valid UUID"
  })
});

/**
 * POST /api/forms
 * Creates a new form with secure authentication using Admin Client
 */
export async function POST(request: Request) {
  try {
    // 1. Get the request body first
    let requestBody;
    try {
      requestBody = await request.json();
      FormCreateSchema.parse(requestBody); // Validate the request body
    } catch (validationError) {
      logger.warn('Invalid form creation data', { error: validationError });
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    const { workspace_id } = requestBody;
    console.log("[DEBUG] /api/forms - Received workspace_id:", workspace_id);
    
    // 2. Create admin client that bypasses RLS
    const adminClient = createAdminClient();
    
    // 3. Get the authorization header from the request
    // Our middleware now adds this automatically to API requests
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';
    
    // 4. Validate the user's session with the token if available
    let userId;
    
    if (token) {
      // Try to get the user from the token
      const { data } = await adminClient.auth.getUser(token);
      userId = data?.user?.id;
      console.log("[DEBUG] /api/forms - Authenticated user ID:", userId);
    }
    
    // If no valid user was found, use secure fallback for dev/testing
    if (!userId) {
      if (process.env.NODE_ENV === 'production') {
        logger.warn('Unauthorized form creation attempt');
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      } else {
        // For development only - use a default user ID
        userId = process.env.NEXT_PUBLIC_DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000000';
        logger.info('Using default user ID for development', { userId });
      }
    }
    

    
    // 5. Verify user is a member of the requested workspace
    // This adds an extra layer of security beyond RLS
    console.log("[DEBUG] /api/forms - Checking membership for user:", userId, "in workspace:", workspace_id);
    
    // Log all workspace memberships for this user to debug
    const { data: allMemberships } = await adminClient
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', userId);
    console.log("[DEBUG] /api/forms - User's workspace memberships:", allMemberships);
    
    const { data: workspaceMembership, error: membershipError } = await adminClient
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspace_id)
      .eq('user_id', userId)
      .single();
    
    if (membershipError || !workspaceMembership) {
      logger.warn('Unauthorized workspace access attempt', { 
        userId, 
        workspaceId: workspace_id,
        error: membershipError 
      });
      return NextResponse.json(
        { error: 'You do not have permission to create forms in this workspace' },
        { status: 403 }
      );
    }
    
    // 6. Create the form with the authenticated user's ID
    const { data: form, error } = await adminClient
      .from('forms')
      .insert({
        workspace_id,
        created_by: userId, // Use the verified user ID
        title: 'Untitled Form',
        description: '',
        status: 'draft',
        settings: {
          showProgressBar: true,
          requireSignIn: false,
          theme: 'default',
          primaryColor: '#0284c7',
          fontFamily: 'inter'
        }
      })
      .select()
      .single();
      
    if (error) {
      logger.error('Database error when creating form', { error });
      throw error;
    }
    
    logger.info('Form created successfully', { formId: form.form_id, userId });
    return NextResponse.json({ form_id: form.form_id });
  } catch (error: any) {
    // Structured error logging
    logger.error('Unhandled error in form creation', { 
      error: error.message,
      stack: error.stack,
    });
    
    // Return appropriate error response
    return NextResponse.json(
      { error: 'An error occurred while creating the form' }, 
      { status: 500 }
    );
  }
}

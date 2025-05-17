import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { dbToApiForm } from '@/utils/type-utils/form/DbToApiForm';
import type { DbForm } from '@/types/form/DbForm';
import type { ApiForm } from '@/types/form/ApiForm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/forms
 * Retrieves forms for a workspace
 */
export async function GET(request: Request) {
  try {
    // Get the workspace_id from the query parameters
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspace_id');
    
    // Validate workspaceId is provided
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';
    
    // Create admin client to check authorization
    const adminClient = createAdminClient();
    
    // Get the user from the token
    const { data: userData } = await adminClient.auth.getUser(token);
    const userId = userData?.user?.id;
    
    if (!userId) {
      logger.warn('Unauthorized forms access attempt');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is a member of the workspace
    const { data: members, error: memberError } = await adminClient
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);
    
    if (memberError || !members || members.length === 0) {
      logger.warn(`User ${userId} unauthorized for workspace ${workspaceId}`);
      return NextResponse.json(
        { error: 'You do not have access to this workspace' },
        { status: 403 }
      );
    }
    
    // Get forms for the workspace
    const { data: forms, error } = await adminClient
      .from('forms')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      logger.error('Error fetching forms', { error });
      return NextResponse.json(
        { error: 'Error fetching forms' },
        { status: 500 }
      );
    }
    
    // Transform DB forms to API forms
    const apiForms: ApiForm[] = forms.map(dbToApiForm);
    
    return NextResponse.json(apiForms);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unhandled error in GET /api/forms', { error: errorMessage });
    
    return NextResponse.json(
      { error: 'An error occurred while fetching forms' },
      { status: 500 }
    );
  }
}

// Input validation schema
const FormCreateSchema = z.object({
  workspace_id: z.string().uuid({
    message: "Workspace ID must be a valid UUID"
  })
});

/**
 * POST /api/forms
 * Creates a new form using the create_form stored procedure
 * 
 * This implementation leverages a database stored procedure that handles
 * all security checks and form creation in a single database call, improving
 * performance significantly over the previous multi-query approach.
 */
export async function POST(request: Request) {
  try {
    // 1. Validate the request body
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
    
    // Extract form data from request
    const { 
      workspace_id,
      title = 'Untitled Form',
      description = '',
      status = 'draft',
      settings = {
        showProgressBar: true,
        requireSignIn: false,
        theme: 'default',
        primaryColor: '#0284c7',
        fontFamily: 'inter'
      },
      // This field is now optional and only used for backwards compatibility
      user_id: requestProvidedUserId = null
    } = requestBody;
    
    logger.info('Form creation request received', { workspace_id });
    
    // 2. Create admin client that bypasses RLS
    const adminClient = createAdminClient();
    
    // 3. Get the authorization header from the request
    // Our middleware now adds this automatically to API requests
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';
    
    // 4. Get the authenticated user ID from the session token
    let userId;
    
    if (token) {
      // Try to get the user from the token
      const { data } = await adminClient.auth.getUser(token);
      userId = data?.user?.id;
      logger.debug('Authenticated user for form creation', { userId });
    } else {
      // Check for backwards compatibility with old clients
      userId = requestProvidedUserId;
      if (userId) {
        logger.warn('Using user ID from request body (deprecated)', { userId });
      }
    }
    
    // If no valid user was found, use secure fallback for dev/testing or return error
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
    
    // 5. Use the stored procedure to create the form with all security checks
    // This replaces multiple database queries with a single call
    const { data, error } = await adminClient.rpc('create_form', {
      p_workspace_id: workspace_id,
      p_user_id: userId,
      p_title: title,
      p_description: description,
      p_status: status,
      p_settings: settings
    });
    
    // 6. Handle errors from the stored procedure
    if (error) {
      // Handle specific error codes from the stored procedure
      if (error.message && error.message.includes('not a member of this workspace')) {
        logger.warn('Unauthorized workspace access attempt', { 
          userId, 
          workspaceId: workspace_id,
          error 
        });
        return NextResponse.json(
          { error: 'You do not have permission to create forms in this workspace' },
          { status: 403 }
        );
      } else if (error.message && (error.message.includes('User does not exist') || 
                                 error.message.includes('Workspace does not exist'))) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      
      // Generic error handling
      logger.error('Database error when creating form', { error });
      return NextResponse.json(
        { error: 'An error occurred while creating the form' },
        { status: 500 }
      );
    }
    
    // Form created successfully
    if (!data || data.length === 0) {
      logger.error('No data returned from form creation');
      return NextResponse.json(
        { error: 'Form created but no data returned' },
        { status: 500 }
      );
    }
    
    const form = data[0];
    logger.info('Form created successfully', { formId: form.form_id, userId });
    return NextResponse.json({ form_id: form.form_id });
  } catch (error: unknown) {
    // Structured error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Unhandled error in form creation', { 
      error: errorMessage,
      stack: errorStack,
    });
    
    // Return appropriate error response
    return NextResponse.json(
      { error: 'An error occurred while creating the form' }, 
      { status: 500 }
    );
  }
}

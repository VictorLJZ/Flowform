import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { ApiWorkspaceRole } from '@/types/workspace';

// Create a logger for tracking the invitation email process
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INVITE-EMAIL-INFO] ${new Date().toISOString()} | ${message}`, data ? data : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[INVITE-EMAIL-WARN] ${new Date().toISOString()} | ${message}`, data ? data : '');
  },
  error: (message: string, data?: any) => {
    console.error(`[INVITE-EMAIL-ERROR] ${new Date().toISOString()} | ${message}`, data ? data : '');
  },
  debug: (message: string, data?: any) => {
    console.debug(`[INVITE-EMAIL-DEBUG] ${new Date().toISOString()} | ${message}`, data ? data : '');
  }
};

// Get invitation URL using the token
function getInvitationUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/invite/${token}`; // Fixed path to match route handler
}

// Process workspace invitation email
export async function POST(request: Request) {
  logger.info('Email sending process started');
  
  // Check if environment variables are set
  const resendApiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL;
  
  if (!resendApiKey) {
    logger.error('RESEND_API_KEY environment variable is not set');
    return NextResponse.json({ error: 'Email service not properly configured' }, { status: 500 });
  }
  
  if (!senderEmail) {
    logger.error('SENDER_EMAIL environment variable is not set');
    return NextResponse.json({ error: 'Sender email not configured' }, { status: 500 });
  }
  
  logger.info('Environment variables validated', { resendKeyExists: !!resendApiKey, senderEmailExists: !!senderEmail });
  
  // Initialize Resend with API key
  const resend = new Resend(resendApiKey);
  logger.info('Resend client initialized');
  
  try {
    // Get the Supabase client (it's an async function in this project)
    const supabase = await createClient();
    logger.info('Supabase client created');
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    logger.info('Auth session checked', { sessionExists: !!session });
    
    if (!session) {
      logger.error('Unauthorized request - No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request data
    const requestBody = await request.json();
    const { invitationId } = requestBody;
    
    logger.info('Request parsed', { invitationId, requestBody });
    
    if (!invitationId) {
      logger.error('Invitation ID missing in request');
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch the invitation details
    logger.info('Fetching invitation details', { invitationId });
    const { data: invitation, error: invitationError } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();
      
    if (invitationError) {
      logger.error('Error fetching invitation from database', { error: invitationError });
      return NextResponse.json(
        { error: 'Invitation not found', details: invitationError.message },
        { status: 404 }
      );
    }
    
    if (!invitation) {
      logger.error('No invitation found with provided ID', { invitationId });
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    logger.info('Invitation found', { invitation });
    
    // Fetch the workspace details
    logger.info('Fetching workspace details', { workspaceId: invitation.workspace_id });
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('name')
      .eq('id', invitation.workspace_id)
      .single();
      
    if (workspaceError) {
      logger.error('Error fetching workspace from database', { error: workspaceError });
      return NextResponse.json(
        { error: 'Workspace details not available', details: workspaceError.message },
        { status: 500 }
      );
    }
    
    logger.info('Workspace found', { workspace });
    
    // Fetch inviter's profile
    logger.info('Fetching inviter profile', { inviterId: invitation.invited_by });
    const { data: inviter, error: inviterError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', invitation.invited_by)
      .single();
      
    if (inviterError) {
      logger.warn('Error fetching inviter profile from database', { error: inviterError });
      // Continue with a fallback name
    } else {
      logger.info('Inviter profile found', { inviter });
    }
    
    // Format role for display
    const getRoleName = (role: ApiWorkspaceRole): string => {
      switch (role) {
        case 'owner': return 'Owner';
        case 'admin': return 'Administrator';
        case 'editor': return 'Editor';
        case 'viewer': return 'Viewer';
        default: return role;
      }
    };
    
    const roleName = getRoleName(invitation.role as ApiWorkspaceRole);
    
    // Generate the invitation URL
    const invitationUrl = getInvitationUrl(invitation.token);
    
    // Format expiration date
    const expirationDate = new Date(invitation.expires_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // HTML email template - Updated with improved styling
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to join ${workspace.name} on Flowform</title>
        <style>
          /* Reset and base styles */
          body { 
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; 
            line-height: 1.6;
            color: #1D172C; /* --foreground */
            background-color: #f9fafb; /* Use a light grey background for contrast */
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff; /* white */
            border: 1px solid #E3E1E8; /* --border */
            border-radius: 8px;
            overflow: hidden;
          }
          .email-header {
            background-color: #0f172b; /* --primary */
            color: #F8F8FA; /* --primary-foreground */
            padding: 24px;
            text-align: center;
          }
          .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .email-content {
            padding: 32px;
          }
          .email-content p {
            margin: 0 0 16px;
            font-size: 16px;
            color: #1D172C; /* --foreground */
          }
          .email-content strong {
            color: #1D172C; /* --foreground */
            font-weight: 600;
          }
          .button-container {
            margin: 32px 0;
            text-align: center;
          }
          .button {
            display: inline-block;
            background-color: #0f172b; /* Keep distinct interactive color */
            color: #ffffff !important; /* Ensure text is white */
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
          }
          .button:hover {
            background-color: #080f1f; /* Darker shade of button color */
          }
          .details {
            font-size: 14px;
            color: #7A738B; /* --muted-foreground */
            margin-bottom: 16px;
          }
          .email-footer { 
            margin-top: 32px;
            padding: 24px;
            border-top: 1px solid #E3E1E8; /* --border */
            font-size: 12px;
            color: #7A738B; /* --muted-foreground */
            text-align: center;
          }
          .email-footer p {
            margin: 0 0 8px;
          }

          /* Responsive adjustments */
          @media (max-width: 640px) {
            .email-container {
              margin: 20px;
              width: auto;
            }
            .email-content {
              padding: 24px;
            }
            .email-header {
              padding: 20px;
            }
             .email-header h1 {
               font-size: 20px;
             }
            .email-content p, .details {
              font-size: 15px;
            }
            .button {
              padding: 12px 24px;
              font-size: 15px;
            }
            .email-footer {
              padding: 20px;
              font-size: 11px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>You're Invited to Flowform</h1>
          </div>
          <div class="email-content">
            <p>Hello,</p>
            <p><strong>${inviter?.full_name || 'A Flowform user'}</strong> has invited you to collaborate on the <strong>${workspace.name}</strong> workspace as a <strong>${roleName}</strong>.</p>
            <p>Flowform helps teams build and manage forms and workflows efficiently.</p>
            
            <div class="button-container">
              <a href="${invitationUrl}" class="button" target="_blank" style="color: #ffffff;">Accept Invitation</a>
            </div>
            
            <p class="details">This invitation will expire on: <strong>${expirationDate}</strong>.</p>
            <p class="details">If you don't have a Flowform account, you'll be prompted to create one after accepting.</p>
          </div>
          <div class="email-footer">
            <p>If you have questions or weren't expecting this, please contact the person who invited you.</p>
            <p>Flowform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Plain text version for email clients that don't support HTML
    const textContent = `
      You've been invited to Flowform
      
      Hello,
      
      ${inviter?.full_name || 'A Flowform user'} has invited you to join ${workspace.name} as a ${roleName} on Flowform.
      
      As a ${roleName}, you'll be able to collaborate on forms and workflows in this workspace.
      
      To accept this invitation, please visit:
      ${invitationUrl}
      
      This invitation will expire on ${expirationDate}.
      
      If you don't have a Flowform account yet, you'll be able to create one when you accept the invitation.
      
      If you have any questions, please contact the person who invited you.
      This is an automated email from Flowform.
    `;
    
    // Get the sender email address from environment variables
    const fromAddress = process.env.SENDER_EMAIL;
    
    logger.info('Preparing email parameters', { fromAddress, toEmail: invitation.email });
    
    // Always send to the actual invited email address
    const toEmail = invitation.email;
    
    // Log sending details
    logger.info('Preparing to send email', {
      from: fromAddress,
      to: toEmail,
      subject: `You've been invited to join ${workspace.name} on Flowform`
    });
    
    // Send email via Resend
    logger.debug('Email content prepared', {
      htmlLength: htmlContent.length,
      textLength: textContent.length
    });
    
    try {
      // Send email via Resend
      const emailResponse = await resend.emails.send({
      from: fromAddress as string, // Use the configured sender email, cast to string to satisfy TS
      to: [toEmail],    // Send to the actual recipient
      subject: `You've been invited to join ${workspace.name} on Flowform`,
      html: htmlContent,
      text: textContent,
    });
    
      logger.info('Email sending response received', { emailResponse });
      
      if ('error' in emailResponse && emailResponse.error) {
        logger.error('Resend API returned error', { error: emailResponse.error });
        return NextResponse.json(
          { error: 'Failed to send invitation email', details: emailResponse.error },
          { status: 500 }
        );
      }
      
      logger.info('Email sent successfully', { emailData: emailResponse });
      
      return NextResponse.json({ 
        success: true,
        message: 'Invitation email sent successfully',
        emailData: emailResponse
      });
    } catch (sendError) {
      logger.error('Exception during email sending', { error: sendError });
      return NextResponse.json(
        { error: 'Failed to send invitation email', details: sendError instanceof Error ? sendError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Unhandled exception in invitation email sending process', { error });
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { ApiWorkspaceRole } from '@/types/workspace';

// Get invitation URL using the token
function getInvitationUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/invite/${token}`; // Fixed path to match route handler
}

// Process workspace invitation email
export async function POST(request: Request) {
  // Initialize Resend with API key
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    // Get the Supabase client (it's an async function in this project)
    const supabase = await createClient();
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request data
    const { invitationId } = await request.json();
    
    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch the invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();
      
    if (invitationError || !invitation) {
      console.error('Error fetching invitation:', invitationError);
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    // Fetch the workspace details
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('name')
      .eq('id', invitation.workspace_id)
      .single();
      
    if (workspaceError) {
      console.error('Error fetching workspace:', workspaceError);
      return NextResponse.json(
        { error: 'Workspace details not available' },
        { status: 500 }
      );
    }
    
    // Fetch inviter's profile
    const { data: inviter, error: inviterError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', invitation.invited_by)
      .single();
      
    if (inviterError) {
      console.error('Error fetching inviter profile:', inviterError);
      // Continue with a fallback name
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
    
    if (!fromAddress) {
      console.error('[sendInvitationEmail] Error: SENDER_EMAIL environment variable is not set.');
      // Consider throwing an error or returning a specific response
      // For now, just log and potentially fail silently or gracefully
      return; // Or throw new Error('Sender email not configured');
    }
    
    // Always send to the actual invited email address
    const toEmail = invitation.email;
    
    // Log sending details
    console.log(`[sendInvitationEmail] Sending production invitation email`);
    console.log(`From: ${fromAddress}`);
    console.log(`To: ${toEmail}`);
    
    // Send email via Resend
    const { error } = await resend.emails.send({
      from: fromAddress, // Use the configured sender email
      to: [toEmail],    // Send to the actual recipient
      subject: `You've been invited to join ${workspace.name} on Flowform`,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error('Error sending invitation email:', error);
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Invitation email sent successfully'
    });
  } catch (error) {
    console.error('Invitation email error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

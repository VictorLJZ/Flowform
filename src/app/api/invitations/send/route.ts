import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { WorkspaceRole } from '@/types/workspace-types';

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
    const getRoleName = (role: WorkspaceRole): string => {
      switch (role) {
        case 'owner': return 'Owner';
        case 'admin': return 'Administrator';
        case 'editor': return 'Editor';
        case 'viewer': return 'Viewer';
        default: return role;
      }
    };
    
    const roleName = getRoleName(invitation.role as WorkspaceRole);
    
    // Generate the invitation URL
    const invitationUrl = getInvitationUrl(invitation.token);
    
    // Format expiration date
    const expirationDate = new Date(invitation.expires_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to join ${workspace.name} on Flowform</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.5;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header { padding-bottom: 20px; }
          .content { padding: 20px 0; }
          .button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer { 
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eaeaea;
            font-size: 0.8em;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>You've been invited to Flowform</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p><strong>${inviter?.full_name || 'A Flowform user'}</strong> has invited you to join <strong>${workspace.name}</strong> as a <strong>${roleName}</strong> on Flowform.</p>
          <p>As a ${roleName}, you'll be able to collaborate on forms and workflows in this workspace.</p>
          
          <a href="${invitationUrl}" class="button">Accept Invitation</a>
          
          <p>This invitation will expire on ${expirationDate}.</p>
          <p>If you don't have a Flowform account yet, you'll be able to create one when you accept the invitation.</p>
        </div>
        <div class="footer">
          <p>If you have any questions, please contact the person who invited you.</p>
          <p>This is an automated email from Flowform.</p>
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

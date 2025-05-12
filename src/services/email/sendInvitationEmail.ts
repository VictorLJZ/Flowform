// src/services/email/sendInvitationEmail.ts
import { sendEmail } from './sendEmail';
import { DbWorkspaceInvitation, ApiWorkspaceRole } from '@/types/workspace';

/**
 * Generate a URL for accepting a workspace invitation
 * 
 * @param token - The invitation token
 * @returns The full URL to the invitation acceptance page
 */
function getInvitationUrl(token: string): string {
  // Use environment variable for the base URL, fallback to localhost in development
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/invitations/${token}`;
}

/**
 * Get a user-friendly role name for display in emails
 * 
 * @param role - The workspace role
 * @returns A user-friendly role name
 */
function getRoleName(role: ApiWorkspaceRole): string {
  switch (role) {
    case 'owner': return 'Owner';
    case 'admin': return 'Administrator';
    case 'editor': return 'Editor';
    case 'viewer': return 'Viewer';
    default: return role;
  }
}

/**
 * Send a workspace invitation email to a user
 * 
 * @param invitation - The workspace invitation object
 * @param workspaceName - The name of the workspace
 * @param inviterName - The name of the person who sent the invitation
 * @returns A promise that resolves with the result of sending the email
 */
export async function sendInvitationEmail(
  invitation: DbWorkspaceInvitation,
  workspaceName: string,
  inviterName: string
): Promise<{success: boolean, messageId?: string, error?: string}> {
  const invitationUrl = getInvitationUrl(invitation.token);
  const roleName = getRoleName(invitation.role as ApiWorkspaceRole);
  const expirationDate = new Date(invitation.expires_at).toLocaleDateString();
  
  // HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitation to join ${workspaceName} on Flowform</title>
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
        <p><strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> as a <strong>${roleName}</strong> on Flowform.</p>
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
    
    ${inviterName} has invited you to join ${workspaceName} as a ${roleName} on Flowform.
    
    As a ${roleName}, you'll be able to collaborate on forms and workflows in this workspace.
    
    To accept this invitation, please visit:
    ${invitationUrl}
    
    This invitation will expire on ${expirationDate}.
    
    If you don't have a Flowform account yet, you'll be able to create one when you accept the invitation.
    
    If you have any questions, please contact the person who invited you.
    This is an automated email from Flowform.
  `;
  
  return sendEmail(
    invitation.email,
    `Invitation to join ${workspaceName} on Flowform`,
    htmlContent,
    textContent
  );
}

// src/services/workspace/sendInvitationEmail.ts

/**
 * Sends an invitation email for a workspace invitation
 * 
 * @param invitationId - ID of the invitation to send email for
 * @returns Result of the email sending operation
 */
export async function sendInvitationEmail(invitationId: string): Promise<{ 
  success: boolean, 
  message?: string, 
  error?: string 
}> {
  try {
    const response = await fetch('/api/invitations/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ invitationId }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error sending invitation email:', result.error);
      return {
        success: false,
        error: result.error || 'Failed to send invitation email'
      };
    }

    return {
      success: true,
      message: result.message || 'Invitation email sent successfully'
    };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

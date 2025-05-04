// src/services/email/sendEmail.ts
import { createClient } from '@/lib/supabase/client';
// Edge Function is now at src/lib/supabase/functions/send-email

/**
 * Generic email service using Supabase Edge Functions
 * 
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param htmlContent - HTML content of the email
 * @param textContent - Plain text content of the email (fallback)
 * @returns A promise that resolves when the email is sent
 */
export async function sendEmail(
  to: string, 
  subject: string, 
  htmlContent: string, 
  textContent?: string
): Promise<{success: boolean, messageId?: string, error?: string}> {
  const supabase = createClient();
  
  try {
    // Call the Supabase Edge Function for sending emails
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        htmlContent,
        textContent: textContent || htmlContent.replace(/<[^>]*>/g, '') // Strip HTML if text not provided
      }
    });

    if (error) {
      console.error('Error sending email via edge function:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      messageId: data?.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email sending error'
    };
  }
}

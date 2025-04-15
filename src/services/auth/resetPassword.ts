import { createClient } from '@/lib/supabase/client';

/**
 * Send a password reset email to the user
 * 
 * @param email - User's email to send the reset link to
 * @returns void
 */
export async function resetPassword(email: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  
  if (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

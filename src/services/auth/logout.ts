import { createClient } from '@/lib/supabase/client';

/**
 * Logout the current user
 * @returns void
 */
export async function logout(): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

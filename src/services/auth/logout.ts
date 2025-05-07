import { createClient } from '@/lib/supabase/client';
import { mutate } from 'swr';

const AUTH_SWR_KEY = 'auth-session';

/**
 * Logout the current user and clear all authentication state
 * @returns void
 */
export async function logout(): Promise<void> {
  
  try {
    // Create a fresh Supabase client
    const supabase = createClient();
    
    // Clear auth state from Supabase

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[AUTH DEBUG] Logout error:', error);
      throw error;
    }
    
    
    // Force clear any cached authentication data
    mutate(AUTH_SWR_KEY, null, { revalidate: false });
    
    // Store logout timestamp in localStorage for components to detect auth change
    // This serves as a backup mechanism in case SWR revalidation fails
    localStorage.setItem('auth_logout_timestamp', Date.now().toString());
    

  } catch (error) {
    console.error('[AUTH DEBUG] Error during logout:', error);
    throw error;
  }
}

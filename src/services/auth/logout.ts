import { createClient } from '@/lib/supabase/client';
import { mutate } from 'swr';

const AUTH_SWR_KEY = 'auth-session';

/**
 * Logout the current user and clear all authentication state
 * @returns void
 */
export async function logout(): Promise<void> {
  console.log('[AUTH DEBUG] logout service called from:', new Error().stack?.split('\n').slice(2, 4).join('\n'));
  
  try {
    // Create a fresh Supabase client
    const supabase = createClient();
    
    // Clear auth state from Supabase
    console.log('[AUTH DEBUG] Calling supabase.auth.signOut()');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[AUTH DEBUG] Logout error:', error);
      throw error;
    }
    
    console.log('[AUTH DEBUG] signOut completed successfully');
    
    // Force clear any cached authentication data
    mutate(AUTH_SWR_KEY, null, { revalidate: false });
    
    // Store logout timestamp in localStorage for components to detect auth change
    // This serves as a backup mechanism in case SWR revalidation fails
    localStorage.setItem('auth_logout_timestamp', Date.now().toString());
    
    console.log('[AUTH DEBUG] Auth cache cleared, logout successful');
  } catch (error) {
    console.error('[AUTH DEBUG] Error during logout:', error);
    throw error;
  }
}

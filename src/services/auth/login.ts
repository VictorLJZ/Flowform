import { createClient } from '@/lib/supabase/client';
import { ApiAuthUser, ApiUserMetadata } from '@/types/user';

/**
 * Login a user with email and password
 * 
 * @param email - User's email
 * @param password - User's password
 * @returns User data if successful
 */
export async function login(email: string, password: string): Promise<ApiAuthUser> {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Login error:', error);
    throw error;
  }
  
  if (!data.user) {
    throw new Error('No user data returned');
  }
  
  // Return the complete user object with metadata that includes profile information
  return {
    id: data.user.id,
    email: data.user.email || '',
    userMetadata: data.user.user_metadata as ApiUserMetadata || {},
    appMetadata: data.user.app_metadata || {}
  };
}

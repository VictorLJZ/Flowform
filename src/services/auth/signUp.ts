import { createClient } from '@/lib/supabase/client';
import { User } from '@/types/auth-types';

/**
 * Register a new user with email and password
 * 
 * @param email - User's email
 * @param password - User's password
 * @returns User data if successful
 */
export async function signUp(email: string, password: string): Promise<User | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('Signup error:', error);
    throw error;
  }
  
  // If email confirmation is required, the user might not be fully created yet
  if (!data.user) {
    return null;
  }
  
  // Return the complete user object with metadata that includes profile information
  return {
    id: data.user.id,
    email: data.user.email || '',
    user_metadata: data.user.user_metadata || {},
    app_metadata: data.user.app_metadata || {}
  };
}

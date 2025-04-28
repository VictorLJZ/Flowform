import { createClient } from '@/lib/supabase/client';

/**
 * Get the current authenticated user
 * This is a direct server-side function that doesn't rely on client state
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  
  return data.user;
}

/**
 * Get the current user ID
 * @returns The current user ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

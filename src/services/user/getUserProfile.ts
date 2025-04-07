import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/supabase-types';

/**
 * Get a user's profile
 * 
 * @param userId - Optional user ID (uses authenticated user if not provided)
 * @returns The user profile or null if not found
 */
export async function getUserProfile(userId?: string): Promise<Profile | null> {
  const supabase = createClient();
  
  // If no userId is provided, get the current user
  if (!userId) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return null;
    }
    userId = userData.user.id;
  }

  // Get the profile
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Profile not found
      return null;
    }
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return data;
}

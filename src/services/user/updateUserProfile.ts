import { createClient } from '@/lib/supabase/client';
import { DbProfile } from '@/types/user';
import { ApiProfileUpdateInput } from '@/types/user';
import { profileUpdateInputToDb } from '@/utils/type-utils/user';

/**
 * Update a user's profile
 * 
 * @param profileData - The profile data to update
 * @param userId - Optional user ID (uses authenticated user if not provided)
 * @returns The updated profile
 */
export async function updateUserProfile(
  profileData: ApiProfileUpdateInput,
  userId?: string
): Promise<DbProfile> {
  const supabase = createClient();
  
  // If no userId is provided, get the current user
  if (!userId) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('No authenticated user found');
    }
    userId = userData.user.id;
  }

  // Convert API input to DB format with proper naming conventions
  const updateData = profileUpdateInputToDb(profileData);

  // Update the profile
  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
}

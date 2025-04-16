import { Profile } from '@/types/supabase-types';

/**
 * Get a user's profile - Client-side implementation
 * Uses the API route to fetch user profile data
 * 
 * @param userId - Optional user ID (uses authenticated user if not provided)
 * @returns The user profile or null if not found
 */
export async function getUserProfileClient(userId?: string): Promise<Profile | null> {
  try {
    // Construct the query parameters
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    
    // Make the API request
    const response = await fetch(`/api/users/profile?${params.toString()}`);
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    // Parse the response data
    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

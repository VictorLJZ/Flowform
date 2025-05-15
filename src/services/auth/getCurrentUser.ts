import { getVerifiedUser, transformToUserType } from './verifiedAuth';
import { ApiAuthUser } from '@/types/user';

/**
 * Get the current authenticated user
 * This is a direct server-side function that doesn't rely on client state
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<ApiAuthUser | null> {
  try {
    console.log('[getCurrentUser] Fetching verified user');
    const user = await getVerifiedUser();
    
    if (!user) {
      console.log('[getCurrentUser] No authenticated user found');
      return null;
    }
    
    return transformToUserType(user);
  } catch (error) {
    console.error('[getCurrentUser] Error:', error);
    return null;
  }
}

/**
 * Get the current user ID
 * @returns The current user ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

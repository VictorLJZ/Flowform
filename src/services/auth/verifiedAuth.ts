/**
 * Secure authentication services that use verified user data
 * 
 * SECURITY MODEL:
 * - Always use getUser() to verify user identity with the Supabase auth server
 * - Never rely solely on session data from cookies/local storage
 * - Use these services for all authentication needs to ensure consistent security
 */

import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import { ApiAuthUser, ApiUserMetadata } from '@/types/user';

/**
 * Get verified user data from Supabase auth server
 * This ensures the user data is cryptographically verified
 */
export async function getVerifiedUser(): Promise<SupabaseUser | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      // Don't log expected auth session errors
      if (!error.message.includes('session')) {
        console.error("[Auth] Error getting user:", error);
      }
      return null;
    }
    
    return data.user;
  } catch (error) {
    // Silently handle expected auth errors
    if (error instanceof Error && 
        !error.message.includes('session') &&
        !error.message.includes('Auth session')) {
      console.error("[Auth] Error:", error);
    }
    return null;
  }
}

/**
 * Get both verified user data and session
 * This provides both secure user verification and access to tokens
 */
export async function getSessionWithVerifiedUser(): Promise<{
  session: Session | null;
  user: SupabaseUser | null;
}> {
  try {
    const supabase = createClient();
    
    // Get verified user first
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      return { session: null, user: null };
    }
    
    // Get session for token access
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      return {
        session: sessionData.session,
        user: userData.user
      };
    } catch {
      // Return user even if session retrieval fails
      return { session: null, user: userData.user };
    }
  } catch {
    return { session: null, user: null };
  }
}

/**
 * Transform Supabase User to our application ApiAuthUser type
 */
export function transformToUserType(supabaseUser: SupabaseUser | null): ApiAuthUser | null {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    userMetadata: supabaseUser.user_metadata as ApiUserMetadata || {},
    appMetadata: supabaseUser.app_metadata || {}
  };
}

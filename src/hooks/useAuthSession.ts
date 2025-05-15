// src/hooks/useAuthSession.ts
import useSWR from 'swr';
import { useSupabase } from '@/providers/auth-provider'; 
import type { Session } from '@supabase/supabase-js';
import { ApiAuthUser, ApiUserMetadata } from '@/types/user';

const SWR_KEY = 'auth-session';

// Define the shape of the data returned by the SWR hook
type AuthSessionData = {
  session: Session | null;
  user: ApiAuthUser | null; // Use our defined ApiAuthUser
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Profile structure TBD
  profile: any | null; // Keep profile for potential future use
  isLoggedOut?: boolean; // Flag to indicate logged out state
};

// Standard error handling for auth session errors
function isAuthSessionError(error: unknown): boolean {
  if (!error) return false;
  return error instanceof Error && (
    error.message.includes('Auth session') || 
    error.message.includes('session')
  );
}

export function useAuthSession() {
  const supabase = useSupabase();
  const isDev = process.env.NODE_ENV === 'development';

  const fetcher = async (): Promise<AuthSessionData> => {
    try {
      // Safely get user and session in parallel
      const [userResponse, sessionResponse] = await Promise.all([
        supabase.auth.getUser().catch(error => {
          if (isDev && !isAuthSessionError(error)) {
            console.error("[Auth] User error:", error);
          }
          return { data: { user: null }, error };
        }),
        supabase.auth.getSession().catch(error => {
          if (isDev && !isAuthSessionError(error)) {
            console.error("[Auth] Session error:", error);
          }
          return { data: { session: null }, error };
        })
      ]);
      
      const { data: userData } = userResponse;
      const { data: sessionData } = sessionResponse;
      
      // No session or user data available
      if (!sessionData?.session || !userData?.user) {
        return { 
          session: null, 
          user: null, 
          profile: null,
          isLoggedOut: true 
        };
      }

      // Transform to our user format
      const user: ApiAuthUser = {
        id: userData.user.id,
        email: userData.user.email ?? '',
        userMetadata: userData.user.user_metadata as ApiUserMetadata || {},
        appMetadata: userData.user.app_metadata || {}
      };

      return { 
        session: sessionData.session, 
        user, 
        profile: null, 
        isLoggedOut: false 
      };
    } catch (error) {
      // Don't log expected auth errors
      if (isDev && !isAuthSessionError(error)) {
        console.error("[Auth] Error:", error);
      }
      return { 
        session: null, 
        user: null, 
        profile: null,
        isLoggedOut: true 
      };
    }
  };

  const { data, error, isLoading, mutate } = useSWR<AuthSessionData>(
    SWR_KEY, // SWR key
    fetcher,
    {
      // Force revalidation on focus, mount, reconnect - important for auth state
      keepPreviousData: true,
      revalidateOnFocus: true,
      revalidateIfStale: true,
      revalidateOnMount: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0, // Disable deduping to ensure we always revalidate
      errorRetryCount: 3,
      shouldRetryOnError: error => !isAuthSessionError(error),
      refreshInterval: 60000, // Refresh session every minute to maintain fresh auth state
    }
  );

  // Determine logged out state from data or error
  const isLoggedOut = data?.isLoggedOut || 
                     error?.message?.includes('Auth session missing') || 
                     (!data?.session && !isLoading);
  
  return {
    session: data?.session ?? null,
    user: data?.user ?? null,
    profile: data?.profile ?? null,
    error,
    isLoading,
    isLoggedOut,
    mutate, // Expose mutate for manual triggers if needed elsewhere
  };
}

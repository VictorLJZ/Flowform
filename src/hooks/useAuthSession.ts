// src/hooks/useAuthSession.ts
import useSWR from 'swr';
import { useSupabase } from '@/providers/auth-provider'; // We'll export this from AuthProvider
import type { Session } from '@supabase/supabase-js';
import { User as UserType } from "@/types/auth-types"; // Use UserType alias

const SWR_KEY = 'auth-session';

// Define the shape of the data returned by the SWR hook
type AuthSessionData = {
  session: Session | null;
  user: UserType | null; // Use our defined UserType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Profile structure TBD
  profile: any | null; // Keep profile for potential future use
  isLoggedOut?: boolean; // Flag to indicate logged out state
};

export function useAuthSession() {
  const supabase = useSupabase(); // Get the current supabase client

  // Only log in development mode
  const isDev = process.env.NODE_ENV === 'development';
  // Get caller information for debug purposes - but only in dev and less verbose
  const callerInfo = isDev ? new Error().stack?.split('\n')[2]?.trim() || 'unknown' : '';

  const fetcher = async (): Promise<AuthSessionData> => {
    if (isDev) {
      console.log(`[AUTH] Fetching auth data for ${callerInfo}`);
    }
    
    try {
      // Get both user and session in parallel to speed things up
      const [userResponse, sessionResponse] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession()
      ]);
      
      const { data: userData, error: userError } = userResponse;
      const { data: sessionData, error: sessionError } = sessionResponse;
      
      if (userError || sessionError) {
        if (isDev) {
          console.error("[AUTH] Error fetching auth data:", userError || sessionError);
        }
        return { 
          session: null, 
          user: null, 
          profile: null,
          isLoggedOut: true 
        };
      }
      
      const session = sessionData.session;
      const supabaseUser = userData.user; // Using verified user data

      // Check if we have proper auth data
      if (!session || !supabaseUser) {
        return { 
          session: null, 
          user: null, 
          profile: null,
          isLoggedOut: true 
        };
      }

      // Transform verified Supabase user to our UserType
      const user = {
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        user_metadata: supabaseUser.user_metadata || {},
        app_metadata: supabaseUser.app_metadata || {}
      };

      // Placeholder for profile fetching if needed later
      const profile = null;
      
      if (isDev) {
        console.log("[AUTH] Auth successful", { 
          userId: user.id.substring(0, 8) + '...',
          email: user.email.split('@')[0] + '@...' 
        });
      }

      return { session, user, profile, isLoggedOut: false };
    } catch (error) {
      if (isDev) {
        console.error("[AUTH] Unexpected error in useAuthSession:", error);
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
      // Important: Keep session data across revalidations until new data arrives
      keepPreviousData: true,
      // Balance between performance and reliability
      revalidateOnFocus: true, // Re-enable focus revalidation for better session handling
      revalidateIfStale: true,
      revalidateOnMount: true,
      revalidateOnReconnect: true, // Re-enable reconnect revalidation
      dedupingInterval: 15000, // 15 seconds - more frequent but still reasonable
      errorRetryCount: 3,
      // No automatic refresh interval needed as onAuthStateChange triggers manual mutate
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

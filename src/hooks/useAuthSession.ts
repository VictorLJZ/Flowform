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

  // Get caller information for debug purposes
  const callerInfo = new Error().stack?.split('\n').slice(2, 4).join('\n') || 'unknown';
  console.log(`[AUTH DEBUG] useAuthSession called from:\n${callerInfo}`);

  const fetcher = async (): Promise<AuthSessionData> => {
    console.log(`[AUTH DEBUG] useAuthSession.fetcher executing for caller:\n${callerInfo}`);
    
    try {
      // Get verified user data from the Supabase auth server
      console.log('[AUTH DEBUG] Calling supabase.auth.getUser()');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("[AUTH DEBUG] Error fetching verified user:", userError);
        // Instead of throwing, return a structured error response
        return { 
          session: null, 
          user: null, 
          profile: null,
          isLoggedOut: true 
        };
      }

      // We still need the session for token access
      console.log('[AUTH DEBUG] Calling supabase.auth.getSession()');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("[AUTH DEBUG] Error fetching session:", sessionError);
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

      console.log("[AUTH DEBUG] Fetched auth data:", { 
        hasSession: !!session, 
        hasUser: !!user,
        email: user?.email || 'none',
        caller: callerInfo.split('\n')[0].trim()
      });

      return { session, user, profile, isLoggedOut: false };
    } catch (error) {
      console.error("[AUTH DEBUG] Unexpected error in useAuthSession:", error);
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
       // Revalidate on mount, focus, reconnect by default (good for auth)
      revalidateOnFocus: true, // Ensure it revalidates on focus
      revalidateIfStale: true,
      revalidateOnMount: true,
      revalidateOnReconnect: true,
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

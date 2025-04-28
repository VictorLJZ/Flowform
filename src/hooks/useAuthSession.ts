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
};

export function useAuthSession() {
  const supabase = useSupabase(); // Get the current supabase client

  const fetcher = async (): Promise<AuthSessionData> => {
    // Get verified user data from the Supabase auth server
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("[useAuthSession] Error fetching verified user:", userError);
      throw userError; // Throw error for SWR to catch
    }

    // We still need the session for token access
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("[useAuthSession] Error fetching session:", sessionError);
      throw sessionError;
    }
    
    const session = sessionData.session;
    const supabaseUser = userData.user; // Using verified user data

    // Transform verified Supabase user to our UserType
    const user = supabaseUser ? {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      user_metadata: supabaseUser.user_metadata || {},
      app_metadata: supabaseUser.app_metadata || {}
    } : null;

    // Placeholder for profile fetching if needed later
    const profile = null;

    console.log("[useAuthSession] Fetched verified user:", user?.email, "Session active:", !!session);

    return { session, user, profile };
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

  return {
    session: data?.session ?? null,
    user: data?.user ?? null,
    profile: data?.profile ?? null,
    error,
    isLoading,
    mutate, // Expose mutate for manual triggers if needed elsewhere
  };
}

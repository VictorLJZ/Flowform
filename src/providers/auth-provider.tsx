"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { getVerifiedUser } from "@/services/auth/verifiedAuth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { mutate } from 'swr'; 

const AUTH_SWR_KEY = 'auth-session';

type AuthContextType = {
  supabase: SupabaseClient;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState(() => {
    console.log("[AuthProvider] Initializing state with new client.");
    return createClient();
  });
  const router = useRouter();

  useEffect(() => {
    console.log("[AuthProvider] Setting up auth state listener.");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthProvider] Auth state changed:", event, session ? 'New session' : 'No session');

      console.log(`[AuthProvider] Triggering SWR mutate for key: ${AUTH_SWR_KEY}`);
      mutate(AUTH_SWR_KEY);

      if (event === 'SIGNED_OUT') {
          router.push('/');
      }
    });

    return () => {
      console.log("[AuthProvider] Cleaning up auth listener.");
      subscription?.unsubscribe();
    };
  }, [supabase, router]); 

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("[AuthProvider] Tab focused, recreating Supabase client...");
        setSupabase(createClient()); 
      } else {
         console.log("[AuthProvider] Tab unfocused.");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    console.log("[AuthProvider] Visibility listener added.");

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      console.log("[AuthProvider] Visibility listener removed.");
    };
  }, []); 

  /**
   * Securely sign out the user and clear authentication state
   */
  const signOut = useCallback(async () => {
    // Track calling component/location
    console.log("[AUTH DEBUG] AuthProvider.signOut called from:", 
      new Error().stack?.split('\n').slice(2, 4).join('\n'));
    
    // Verify user is authenticated before attempting sign out
    console.log("[AUTH DEBUG] Verifying user before signOut");
    const user = await getVerifiedUser();
    
    if (user) {
      console.log("[AUTH DEBUG] User verified, proceeding with signOut. User:", user.email);
      console.log("[AUTH DEBUG] Calling supabase.auth.signOut()");
      
      await supabase.auth.signOut();
      
      console.log("[AUTH DEBUG] supabase.auth.signOut() completed");
      console.log("[AUTH DEBUG] Triggering SWR cache clearing for auth");
      
      // More aggressive cache invalidation strategy: 
      // 1. Pass null as data to clear the cache immediately
      // 2. Set revalidate to false to prevent immediate revalidation
      // 3. This ensures we don't immediately try to fetch auth data again
      mutate(AUTH_SWR_KEY, null, { revalidate: false });
      
      // Store logout timestamp in localStorage for components to detect auth change
      localStorage.setItem('auth_logout_timestamp', Date.now().toString());
      
      console.log("[AUTH DEBUG] SWR cache cleared and logout timestamp set");
    } else {
      console.log("[AUTH DEBUG] Sign out called but no verified user found");
      // Still clear cache even if no verified user found
      mutate(AUTH_SWR_KEY, null, { revalidate: false });
    }
    console.log("[AUTH DEBUG] signOut function completed - router navigation should happen via onAuthStateChange");
    // Router navigation happens via the onAuthStateChange listener
  }, [supabase]);

  const value = {
    supabase,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * React hook to access the Supabase client and auth functions
 * @returns The Supabase client and auth functions
 */
export function useSupabase() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within an AuthProvider");
  }
  return context.supabase;
}

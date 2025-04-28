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
    console.log("[AuthProvider] Signing out user");
    // Verify user is authenticated before attempting sign out
    const user = await getVerifiedUser();
    
    if (user) {
      await supabase.auth.signOut();
      console.log("[AuthProvider] User signed out successfully");
      // Force revalidation of auth state
      mutate(AUTH_SWR_KEY);
    } else {
      console.log("[AuthProvider] Sign out called but no verified user found");
    }
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

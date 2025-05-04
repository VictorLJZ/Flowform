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
  const [supabase, setSupabase] = useState(() => createClient());
  const router = useRouter();
  const isDev = process.env.NODE_ENV === 'development';

  // Handle auth state changes
  useEffect(() => {
    // Clear any stale redirect flags on initialization
    if (typeof window !== 'undefined') {
      const now = Date.now();
      const redirectTime = parseInt(sessionStorage.getItem('redirect_in_progress') || '0');
      if (now - redirectTime > 5000) {
        sessionStorage.removeItem('redirect_in_progress');
      }
    }
    
    // Setup auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (isDev) console.log("[Auth] State changed:", event);
      
      // Force data refresh to update auth state across the app
      mutate(AUTH_SWR_KEY, undefined, { revalidate: true });

      // Handle sign out event
      if (event === 'SIGNED_OUT') {
        // Check if we recently signed in to prevent redirect loops
        if (!sessionStorage.getItem('just_signed_in')) {
          // Check for too frequent redirects
          const lastRedirect = parseInt(sessionStorage.getItem('last_redirect') || '0');
          if (Date.now() - lastRedirect < 2000) {
            if (isDev) console.log("[Auth] Skipping redirect - too recent");
            return;
          }
          
          // Record redirect and go to home page
          sessionStorage.setItem('last_redirect', Date.now().toString());
          sessionStorage.setItem('redirect_in_progress', Date.now().toString());
          router.push('/');
        }
      } 
      // Handle sign in event
      else if (event === 'SIGNED_IN') {
        // Mark as just signed in to prevent redirect loops
        sessionStorage.setItem('just_signed_in', Date.now().toString());
        
        // Clear this flag after a delay
        setTimeout(() => {
          sessionStorage.removeItem('just_signed_in');
        }, 5000);
      }
    });

    return () => subscription?.unsubscribe();
  }, [supabase, router, isDev]);

  // Refresh auth state when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setSupabase(createClient());
        mutate(AUTH_SWR_KEY, undefined, { revalidate: true });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      const user = await getVerifiedUser();
      if (user) {
        await supabase.auth.signOut();
        mutate(AUTH_SWR_KEY, null, { revalidate: false });
      }
    } catch (error) {
      if (isDev) console.error("[Auth] Sign out error:", error);
      mutate(AUTH_SWR_KEY, null, { revalidate: false });
    }
  }, [supabase, isDev]);

  return <AuthContext.Provider value={{ supabase, signOut }}>{children}</AuthContext.Provider>;
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

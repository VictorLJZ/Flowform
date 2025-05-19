"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { mutate } from 'swr'; 

const AUTH_SWR_KEY = 'auth-session';

type AuthContextType = {
  supabase: SupabaseClient;
  signOut: () => Promise<void>;
  user: User | null;
  isLoading: boolean;
  userId: string | null;
  refreshUser: () => Promise<User | null>;
  lastRefreshed: number;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(0);
  const router = useRouter();
  const isDev = process.env.NODE_ENV === 'development';
  
  // Derived state
  const userId = user?.id || null;

  // Function to refresh user data
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setLastRefreshed(Date.now());
      return currentUser;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);
  
  // Initial load of user data
  useEffect(() => {
    const loadUser = async () => {
      await refreshUser();
    };
    loadUser();
  }, [refreshUser]);

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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Update user state immediately based on the session
      setUser(session?.user || null);
      setLastRefreshed(Date.now());
      
      // Force data refresh to update auth state across the app
      mutate(AUTH_SWR_KEY, undefined, { revalidate: true });

      // Handle sign out event
      if (event === 'SIGNED_OUT') {
        // Check if we recently signed in to prevent redirect loops
        if (!sessionStorage.getItem('just_signed_in')) {
          // Check for too frequent redirects
          const lastRedirect = parseInt(sessionStorage.getItem('last_redirect') || '0');
          if (Date.now() - lastRedirect < 2000) {
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
  }, [supabase, router, isDev, refreshUser]);

  // Refresh auth state when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only refresh if it's been a while since the last refresh (5 minutes)
        if (Date.now() - lastRefreshed > 5 * 60 * 1000) {
          setSupabase(createClient());
          refreshUser();
          mutate(AUTH_SWR_KEY, undefined, { revalidate: true });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lastRefreshed, refreshUser]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      if (user) {
        await supabase.auth.signOut();
        setUser(null);
        mutate(AUTH_SWR_KEY, null, { revalidate: false });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setUser(null);
      mutate(AUTH_SWR_KEY, null, { revalidate: false });
    }
  }, [supabase, user]);

  return (
    <AuthContext.Provider 
      value={{
        supabase,
        signOut,
        user,
        isLoading,
        userId,
        refreshUser,
        lastRefreshed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * React hook to access just the current user
 * This hook avoids unnecessary renders when only the user info is needed
 * @returns The current user, loading state, and userId
 */
export function useCurrentUser() {
  const { user, isLoading, userId, refreshUser } = useAuth();
  return { user, isLoading, userId, refreshUser };
}

/**
 * React hook to access the Supabase client
 * @returns The Supabase client
 */
export function useSupabase() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within an AuthProvider");
  }
  return context.supabase;
}

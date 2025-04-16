import { create } from 'zustand'
import { User, AuthState as BaseAuthState } from '@/types/auth-types'
import { login as loginService } from '@/services/auth/login'
import { signUp as signUpService } from '@/services/auth/signUp'
import { logout as logoutService } from '@/services/auth/logout'
import { resetPassword as resetPasswordService } from '@/services/auth/resetPassword'
import { createClient, reconnectClient } from '@/lib/supabase/client'
import { authLog, networkLog } from '@/lib/debug-logger'

type SyncStatus = 'ready' | 'verifying' | 'refreshing'

type AuthState = BaseAuthState & {
  // Sync state
  syncStatus: SyncStatus
  lastVerified: number
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  setUser: (user: User | null) => void
  
  // Auth synchronization
  verifyAuth: () => Promise<boolean | void> // Return success/failure status
  ensureStableAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  syncStatus: 'ready' as SyncStatus,
  lastVerified: Date.now(),
  
  login: async (email, password) => {
    set({ isLoading: true, error: null })
    
    try {
      const user = await loginService(email, password)
      set({ user, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  signUp: async (email, password) => {
    set({ isLoading: true, error: null })
    
    try {
      const user = await signUpService(email, password)
      set({ user, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null })
    
    try {
      await logoutService()
      set({ user: null, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  resetPassword: async (email) => {
    set({ isLoading: true, error: null })
    
    try {
      await resetPasswordService(email)
      set({ isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  setUser: (user) => {
    set({ user })
  },
  
  /**
   * Verify auth state with the server
   * This ensures we have the latest auth state after tab switches
   */
  verifyAuth: async () => {
    console.log('⭐ [AUTH] STARTING verification, current syncStatus:', get().syncStatus);
    
    // Don't start a new verification if one is already in progress
    if (get().syncStatus === 'verifying') {
      console.log('⭐ [AUTH] Already verifying, returning existing verification promise');
      return
    }
    
    // Force a ready state if it's been too long since the last verification attempt
    // This prevents the app from getting permanently stuck in a verifying state
    const lastSyncStatusChange = get().lastVerified || 0;
    const timeInCurrentState = Date.now() - lastSyncStatusChange;
    
    if (get().syncStatus !== 'ready' && timeInCurrentState > 6000) {
      console.warn('⭐ [AUTH] Detected stale syncStatus, forcing to ready before verification');
      set({ 
        syncStatus: 'ready',
        lastVerified: Date.now()
      });
    }
    
    authLog('Starting auth verification after tab switch', {
      previousStatus: get().syncStatus,
      timestamp: new Date().toISOString()
    })
    
    console.log('⭐ [AUTH] Setting syncStatus to verifying');
    set({ 
      syncStatus: 'verifying',
      lastVerified: Date.now(), // Update verification timestamp
      error: null // Clear previous errors
    })
    
    // Use a shorter timeout to prevent UI freezing
    const verificationTimeout = setTimeout(() => {
      if (get().syncStatus === 'verifying') {
        console.error('⭐ [AUTH] TIMEOUT: Auth verification took too long, resetting to ready');
        set({ 
          syncStatus: 'ready', 
          error: 'Auth verification timed out',
          lastVerified: Date.now()
        });
      }
    }, 5000); // Reduced from 10 to 5 seconds
    
    try {
      // Instead of using Supabase's WebSocket-based getUser (which can hang),
      // let's use a direct fetch to the auth endpoint with our current token
      // This bypasses potential WebSocket issues after tab switching
      console.log('⭐ [AUTH] Using direct HTTP approach for auth verification');
      
      // First get the current session token the traditional way (but with a short timeout)
      const currentSession = await Promise.race([
        createClient().auth.getSession(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('getSession call timed out')), 1500);
        })
      ]) as any;
      
      // If we have a session token, use a direct fetch which is more reliable after tab switching
      let data: any = null;
      let error: any = null;
      
      if (currentSession?.data?.session?.access_token) {
        console.log('⭐ [AUTH] Found session token, using direct fetch approach');
        try {
          // Use direct fetch with proper auth header
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
            headers: {
              'Authorization': `Bearer ${currentSession.data.session.access_token}`,
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            },
            method: 'GET'
          });
          
          if (!response.ok) {
            throw new Error(`Direct auth API request failed: ${response.status}`);
          }
          
          const userData = await response.json();
          
          // Format the response to match Supabase's format
          data = { user: userData };
          error = null;
          console.log('⭐ [AUTH] Direct auth verification successful');
        } catch (fetchError) {
          console.error('⭐ [AUTH] Direct fetch auth verification failed:', fetchError);
          // Fall back to regular Supabase auth check with timeout
          console.log('⭐ [AUTH] Falling back to regular auth check');
          const supabase = createClient();
          const result = await Promise.race([
            supabase.auth.getUser(),
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Fallback getUser API call timed out')), 2000);
            })
          ]) as any;
          data = result.data;
          error = result.error;
        }
      } else {
        // If we don't have a session token, try the regular approach
        console.log('⭐ [AUTH] No session token found, using regular auth check');
        const supabase = createClient();
        const result = await Promise.race([
          supabase.auth.getUser(),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Regular getUser API call timed out')), 2000);
          })
        ]) as any;
        data = result.data;
        error = result.error;
      }
      
      console.log('⭐ [AUTH] getUser result:', { 
        success: !!data?.user,
        error: error?.message || null,
        userId: data?.user?.id || null
      });
      
      if (error) throw error
      
      if (data?.user) {
        console.log('⭐ [AUTH] User found, updating state to ready');
        authLog('Auth verification successful', {
          userId: data.user.id,
          timestamp: new Date().toISOString()
        })
        
        set({ 
          user: {
            id: data.user.id,
            email: data.user.email || '',
            user_metadata: data.user.user_metadata || {},
            app_metadata: data.user.app_metadata || {}
          },
          syncStatus: 'ready',
          lastVerified: Date.now(),
          error: null
        })
        console.log('⭐ [AUTH] State updated, syncStatus is now:', get().syncStatus);
      } else {
        console.log('⭐ [AUTH] No user found, updating state to ready');
        authLog('Auth verification complete - no user', {
          timestamp: new Date().toISOString()
        })
        
        set({ 
          user: null,
          syncStatus: 'ready',
          lastVerified: Date.now(),
          error: null
        })
        console.log('⭐ [AUTH] State updated, syncStatus is now:', get().syncStatus);
      }
      
      // Success - clear the timeout
      clearTimeout(verificationTimeout);
      return true;
    } catch (error: any) {
      console.error('⭐ [AUTH] ERROR in verification:', error.message);
      authLog('Auth verification failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      })
      
      // Set auth state to ready even on error to prevent stuck states
      set({ 
        error: error.message,
        syncStatus: 'ready',
        lastVerified: Date.now()
      })
      console.log('⭐ [AUTH] Reset syncStatus to ready after error');
      
      // Clear timeout and return false to indicate failure
      clearTimeout(verificationTimeout);
      return false;
    }
  },
  
  /**
   * Ensure auth is in a stable state before proceeding
   * This prevents operations from running with stale auth state
   */
  ensureStableAuth: async () => {
    console.log('⭐ [AUTH] ensureStableAuth called, current syncStatus:', get().syncStatus);
    
    // If auth is already stable, return immediately
    if (get().syncStatus === 'ready') {
      console.log('⭐ [AUTH] Auth already stable, proceeding immediately');
      return;
    }
    
    authLog('Waiting for stable auth state', {
      currentStatus: get().syncStatus,
      timestamp: new Date().toISOString()
    })
    
    // Create a timeout promise that will resolve after 5 seconds
    // This ensures we don't get stuck waiting forever
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn('⭐ [AUTH] TIMEOUT: ensureStableAuth waited too long, forcing resolution');
        
        // Force the syncStatus to ready to unblock the application
        if (get().syncStatus !== 'ready') {
          console.warn('⭐ [AUTH] Forcing syncStatus to ready after timeout');
          set({ syncStatus: 'ready' });
        }
        
        resolve();
      }, 5000); // 5 second timeout
    });
    
    // Race between normal resolution and timeout
    return Promise.race([
      timeoutPromise,
      new Promise<void>(resolve => {
        // Set up subscription to watch for state changes
        const unsubscribe = useAuthStore.subscribe(state => {
          console.log('⭐ [AUTH] Auth state changed, new syncStatus:', state.syncStatus);
          
          if (state.syncStatus === 'ready') {
            unsubscribe();
            console.log('⭐ [AUTH] Auth state now stable, proceeding with operation');
            authLog('Auth state now stable, proceeding with operation', {
              timestamp: new Date().toISOString()
            });
            resolve();
          }
        });
      })
    ]);
  }
}))

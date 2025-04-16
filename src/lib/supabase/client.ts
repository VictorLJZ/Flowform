import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { networkLog } from '@/lib/debug-logger'

// Singleton instance that persists across function calls
let supabaseClient: SupabaseClient | null = null

/**
 * Creates or returns the singleton Supabase client instance
 * Using a singleton pattern ensures that we maintain a stable connection
 * across tab switches and multiple requests
 */
export function createClient(): SupabaseClient {
  return getOrCreateClient()
}

/**
 * Forces a reconnection of the Supabase client
 * This is useful after tab focus events to ensure we have a fresh connection
 * to prevent orphaned queries
 */
export function reconnectClient(): SupabaseClient {
  console.log('🔄 [SUPABASE_RECONNECT] Starting reconnection at', new Date().toISOString());
  
  try {
    if (supabaseClient) {
      console.log('🔄 [SUPABASE_RECONNECT] Existing client found, will disconnect:', {
        clientExists: !!supabaseClient,
        clientType: typeof supabaseClient,
        hasAuth: !!(supabaseClient.auth),
        timestamp: new Date().toISOString()
      });
      
      networkLog('Forcing Supabase client reconnection after tab switch', {
        timestamp: new Date().toISOString()
      })
      
      // Disconnect realtime subscriptions (which use WebSockets)
      try {
        console.log('🔄 [SUPABASE_RECONNECT] Removing all channels');
        supabaseClient.removeAllChannels()
        console.log('🔄 [SUPABASE_RECONNECT] Successfully removed all channels');
      } catch (e) {
        console.error('🔄 [SUPABASE_RECONNECT] ERROR disconnecting Supabase realtime channels:', e)
      }
      
      // Clear the client so a new one will be created
      console.log('🔄 [SUPABASE_RECONNECT] Setting client to null to force recreation');
      supabaseClient = null
    } else {
      console.log('🔄 [SUPABASE_RECONNECT] No existing client, will create new one');
    }
    
    // Create and return a fresh client
    console.log('🔄 [SUPABASE_RECONNECT] Calling getOrCreateClient() to create fresh client');
    const newClient = getOrCreateClient();
    console.log('🔄 [SUPABASE_RECONNECT] New client created successfully:', {
      clientExists: !!newClient,
      hasAuth: !!(newClient.auth),
      timestamp: new Date().toISOString()
    });
    
    return newClient;
  } catch (error) {
    console.error('🔄 [SUPABASE_RECONNECT] CRITICAL ERROR during reconnection:', error);
    // If reconnection fails, attempt to return a fallback client
    if (supabaseClient) {
      console.log('🔄 [SUPABASE_RECONNECT] Returning existing client as fallback after error');
      return supabaseClient;
    }
    // Last resort - create new client
    console.log('🔄 [SUPABASE_RECONNECT] Creating emergency client as last resort');
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}

/**
 * Internal helper to create or get the Supabase client
 */
function getOrCreateClient(): SupabaseClient {
  // Only create a new client if one doesn't exist and we're in browser environment
  if (!supabaseClient && typeof window !== 'undefined') {
    networkLog('Creating new Supabase client instance', {
      timestamp: new Date().toISOString(),
      isNewInstance: true
    })
    
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } else if (supabaseClient) {
    networkLog('Reusing existing Supabase client instance', {
      timestamp: new Date().toISOString(),
      isNewInstance: false
    })
  }
  
  // If we're in SSR and don't have a client, create a temporary one
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  return supabaseClient
}

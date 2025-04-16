import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import { networkLog } from '../debug-logger'

let supabaseClient: SupabaseClient | null = null

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
let connectionState: ConnectionState = 'disconnected';

// --- Simple Event Emitter ---
type Listener<T = unknown> = (...args: T[]) => void;
const emitter = {
  events: {} as Record<string, Listener[] | undefined>,
  on<T = unknown>(event: string, listener: Listener<T>) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]!.push(listener as Listener);
  },
  off<T = unknown>(event: string, listener: Listener<T>) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event]!.filter(l => l !== listener);
  },
  emit<T = unknown>(event: string, ...args: T[]) {
    if (!this.events[event]) return;
    // Call listeners on a copy in case one listener modifies the array
    [...this.events[event]!].forEach(listener => listener(...args));
  }
};
// --------------------------

// Timeout for WebSocket connection attempts
const CONNECTION_TIMEOUT_MS = 10000; // 10 seconds

let isReconnecting = false; // Flag to prevent concurrent reconnections

/**
 * Forces a reconnection of the Supabase client
 * Ensures the WebSocket connection is established before resolving.
 */
export async function reconnectClient(): Promise<void> {
  const reconnectId = Date.now(); // Simple ID for tracking this specific attempt
  networkLog(`[WS] 🔄 [SUPABASE_RECONNECT] Starting reconnection attempt #${reconnectId} at ${new Date().toISOString()}`);

  if (isReconnecting) {
    networkLog(`[WS] 🔄 [SUPABASE_RECONNECT] Attempt #${reconnectId} aborted: Reconnection already in progress.`);
    return; // Prevent concurrent executions
  }

  isReconnecting = true;

  try {
    networkLog('[WS] 🔄 [SUPABASE_RECONNECT] Starting reconnection at', new Date().toISOString());

    if (supabaseClient) {
      networkLog('[WS] 🔄 [SUPABASE_RECONNECT] Existing client found, will disconnect:', {
        clientExists: !!supabaseClient,
        connectionState,
      });
      // Attempt to remove all channels before disconnecting
      try {
        networkLog('[WS] 🔄 [SUPABASE_RECONNECT] Removing all channels');
        await supabaseClient.removeAllChannels();
        networkLog('[WS] 🔄 [SUPABASE_RECONNECT] Successfully removed all channels');
      } catch (channelError) {
        console.error('🔄 [SUPABASE_RECONNECT] Error removing channels:', channelError);
        networkLog('[WS] 🔄 [SUPABASE_RECONNECT] Error removing channels:', channelError);
      }
      // Disconnect the client if possible (might not be exposed directly, setting to null forces recreation)
      networkLog('[WS] 🔄 [SUPABASE_RECONNECT] Setting client to null to force recreation');
      supabaseClient = null;
      connectionState = 'disconnected'; // Reset state
      // No resolvers to reset
    }

    networkLog('[WS] 🔄 [SUPABASE_RECONNECT] Calling getOrCreateClient() to create fresh client');
    // Get or create the client instance (still synchronous)
    getOrCreateClient(); 
    
    networkLog('[WS] 🔄 [SUPABASE_RECONNECT] Waiting for WebSocket connection...');
    // Wait for the WebSocket connection to be established
    await ensureConnected(); // Wait for onOpen
    
    networkLog('[WS] 🔄 [SUPABASE_RECONNECT] Reconnection complete and WebSocket connected.');

  } catch (error) {
    console.error('🔄 [SUPABASE_RECONNECT] Error during reconnection process:', error);
    networkLog('[WS] 🔄 [SUPABASE_RECONNECT] Error during reconnection process:', { message: (error as Error)?.message });
    // Reset state on error
    connectionState = 'error'; 
    // Rethrow or handle as needed - rethrowing makes the caller aware
    throw new Error(`Supabase reconnection failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    networkLog(`[WS] 🔄 [SUPABASE_RECONNECT] Attempt #${reconnectId}: Releasing reconnection lock.`);
    isReconnecting = false; // Release the lock
  }
}

/**
 * Returns a promise that resolves when the WebSocket connection is established,
 * or rejects on error or timeout.
 */
export function ensureConnected(timeoutMs: number = CONNECTION_TIMEOUT_MS): Promise<void> {
  networkLog(`[WS] 🔌 Ensuring connection state: ${connectionState}`);
  if (connectionState === 'connected') {
    networkLog('[WS] 🔌✅ Already connected.');
    return Promise.resolve();
  }

  if (connectionState === 'error') {
    networkLog('[WS] 🔌❌ Connection already in error state.');
    // Reject immediately if already in error state
    return Promise.reject(new Error(`Supabase WebSocket is in an error state.`));
  }
  
  // If disconnected, trigger connection attempt via getOrCreateClient if needed
  if (connectionState === 'disconnected') {
    networkLog('[WS] 🔌 Disconnected, ensuring client exists to trigger connection.');
    getOrCreateClient(); // This should trigger 'connecting' state and events
    // Fall through to wait for the 'connecting' state events
  }

  // Wait for the connection using the event emitter
  networkLog('[WS] 🔌 Connection not established, waiting for events...');
  return new Promise<void>((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | null = null;
    let settled = false;

    const cleanup = () => {
      if (settled) return; // Prevent multiple cleanups
      settled = true;
      networkLog('[WS] 🔌 Cleaning up ensureConnected listeners and timeout.');
      if (timeoutId) clearTimeout(timeoutId);
      emitter.off('connected', onConnected);
      emitter.off('error', onError);
      emitter.off('closed', onClosed); // Also listen for unexpected close
    };

    const onConnected = () => {
      networkLog('[WS] 🔌✅ Event received: connected. Resolving ensureConnected.');
      cleanup();
      resolve();
    };

    const onError = (error?: Error) => {
      networkLog('[WS] 🔌❌ Event received: error. Rejecting ensureConnected.', { message: error?.message });
      cleanup();
      reject(error || new Error('Supabase WebSocket entered error state.'));
    };

    const onClosed = () => {
      networkLog('[WS] 🔌🚫 Event received: closed. Rejecting ensureConnected.');
      cleanup();
      reject(new Error('Supabase WebSocket closed unexpectedly while waiting for connection.'));
    };

    // Attach listeners
    emitter.on('connected', onConnected);
    emitter.on('error', onError);
    emitter.on('closed', onClosed);

    // Start timeout
    timeoutId = setTimeout(() => {
      networkLog(`[WS] 🔌❌ ensureConnected timed out after ${timeoutMs}ms.`);
      // Update state if still connecting (though should have been done by emitter)
      if (connectionState === 'connecting') connectionState = 'error';
      cleanup();
      reject(new Error(`Supabase WebSocket connection timed out after ${timeoutMs}ms.`));
    }, timeoutMs);

    // Initial check: If state changed *between* the initial check and attaching listeners
    if (connectionState === 'connected') {
      networkLog('[WS] 🔌✅ State became connected immediately after check. Resolving.');
      onConnected();
    } else if (connectionState === 'error') {
      networkLog('[WS] 🔌❌ State became error immediately after check. Rejecting.');
      onError(new Error('Supabase WebSocket entered error state immediately after check.'));
    }
  });
}

/**
 * Gets the existing Supabase client instance or creates a new one.
 * Attaches permanent WebSocket event listeners.
 */
function getOrCreateClient(): SupabaseClient {
  networkLog('Getting Supabase client instance', { clientExists: !!supabaseClient, connectionState });
  if (supabaseClient) {
    networkLog('Reusing existing Supabase client instance', { connectionState });
    // If reusing, ensure connection state is accurate or trigger connection check
    if (connectionState === 'disconnected') {
        networkLog('[WS] 🔌 Reused client was disconnected, attempting connect.');
        connectionState = 'connecting';
        supabaseClient.realtime?.connect(); // Attempt connect
    }
    return supabaseClient;
  }

  networkLog('Creating new Supabase client instance', { connectionState });
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          eventsPerSecond: 10, // Default is 10
        },
      },
      global: {
        fetch: (input, init) => {
          // Optional: Add request tracing here if needed
          networkLog('TRACE: Supabase request started', { input: input.toString(), method: init?.method || 'GET' });
          return fetch(input, init).then(response => {
            networkLog('TRACE: Supabase request completed', { url: response.url, status: response.status });
            // Optional: Log response body carefully for debugging (can be large)
            // response.clone().text().then(body => networkLog('TRACE: Supabase response body', { body: body.substring(0, 500) + (body.length > 500 ? '...' : '') }));
            return response;
          });
        },
      },
    }
  );

  connectionState = 'connecting'; // Set state to connecting
  networkLog('[WS] 🔌 New client created, state set to connecting.');
  
  networkLog('[WS] 🔌 Attaching permanent WebSocket listeners...');
  // Attach permanent listeners to the new client
  const realtimeConn = supabaseClient.realtime;
  if (realtimeConn) {
    // Ensure the connection attempt is made.
    // It's generally safe to call connect() multiple times; it's idempotent.
    realtimeConn.connect();
    
    // Access underlying WebSocket connection object (`conn`) if available
    if (realtimeConn.conn) { 
      networkLog('[WS] 🔌 Attaching listeners to realtimeConn.conn');
      realtimeConn.conn.onopen = () => {
        networkLog('[WS] 🔌✅ WebSocket connection opened (via conn.onopen).');
        // Only update state if we were actually connecting
        if (connectionState === 'connecting') { 
          connectionState = 'connected';
          emitter.emit('connected'); // Emit connected event
        } else {
          networkLog('[WS] 🔌✅ Opened event received but state was not connecting.', { currentState: connectionState });
        }
      };

      realtimeConn.conn.onerror = (event: Event) => { // Note: WebSocket onerror often just gets a generic Event
        // Log the event object for more details if needed
        console.error('❌ [SUPABASE_WS] WebSocket error (via conn.onerror):', event);
        networkLog('[WS] 🔌❌ WebSocket error (via conn.onerror):', event);
        const oldState = connectionState;
        connectionState = 'error';
        // Emit error event, only if state actually changed to error
        if (oldState !== 'error') {
          emitter.emit('error', event instanceof Error ? event : new Error('WebSocket error event received'));
          networkLog('[WS] 🔌❌ Connection state set to error.');
        }
      };

      realtimeConn.conn.onclose = (event: CloseEvent) => {
        networkLog(`[WS] 🔌🚫 WebSocket connection closed (via conn.onclose). Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`);
        const oldState = connectionState;
        // Avoid setting state to 'disconnected' if an error occurred just before closing
        // Or if it was already disconnected.
        if (connectionState !== 'error' && connectionState !== 'disconnected') { 
          connectionState = 'disconnected';
          // If we were connecting and it closed, treat it as an error for ensureConnected
          if (oldState === 'connecting') {
            emitter.emit('closed'); 
          } else {
            // If we were connected and it closed, just note the state change
            // Does not automatically trigger an error for ensureConnected callers
          }
          networkLog('[WS] 🔌🚫 Connection state set to disconnected.');
        } else {
          networkLog('[WS] 🔌🚫 Close event received but state was already error/disconnected.', { currentState: connectionState });
        }
      };
      networkLog('[WS] 🔌 Permanent WebSocket listeners attached via conn.');
    } else {
      networkLog('[WS] 🔌⚠️ realtimeConn.conn is not available to attach listeners directly.');
      // Fallback or error state if direct connection access isn't possible
      connectionState = 'error';
      emitter.emit('error', new Error('Cannot access realtimeConn.conn to monitor WebSocket state.'));
    }
  } else {
    networkLog('[WS] 🔌⚠️ supabaseClient.realtime is not available to attach listeners.');
    connectionState = 'error'; // Cannot connect
    emitter.emit('error', new Error('supabaseClient.realtime is not available.'));
  }

  return supabaseClient;
}

// Export the function to get or create the client
export function createClient(): SupabaseClient {
  // Using an event emitter should be much more robust.
  return getOrCreateClient()
}

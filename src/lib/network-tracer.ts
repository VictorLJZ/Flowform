/**
 * Network request tracer for debugging Supabase requests
 * Helps pinpoint where requests fail during tab switching
 */

import { networkLog } from './debug-logger';

// Only run this code in the browser environment
const isBrowser = typeof window !== 'undefined';

// Map to store active requests
let activeRequests = new Map<string, {
  startTime: number;
  requestId: string;
  url: string;
  method: string;
  completed: boolean;
}>();

// Generate a unique request ID
function generateRequestId(): string {
  return `req_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
}

// Set up fetch interception, but only in the browser
if (isBrowser) {
  // Store the original fetch function
  const originalFetch = window.fetch;
  
  // Override the fetch function
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Only track Supabase requests (look for the Supabase URL)
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (!url.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || '')) {
      return originalFetch(input, init);
    }

    const method = init?.method || 'GET';
    const requestId = generateRequestId();
    const startTime = performance.now();

    // Save request information
    activeRequests.set(requestId, {
      startTime,
      requestId,
      url,
      method,
      completed: false
    });

    // Log request start
    networkLog('TRACE: Supabase request started', {
      requestId,
      url,
      method,
      tabVisible: document.visibilityState === 'visible',
      headers: init?.headers ? Object.fromEntries(new Headers(init.headers).entries()) : {}
    });

    try {
      // Send the actual request
      const response = await originalFetch(input, init);
      
      // Clone the response to read it
      const clonedResponse = response.clone();
      const status = clonedResponse.status;
      
      // Log request completion
      networkLog('TRACE: Supabase request completed', {
        requestId,
        status,
        duration: performance.now() - startTime,
        tabVisible: document.visibilityState === 'visible'
      });

      // Mark as completed
      const requestInfo = activeRequests.get(requestId);
      if (requestInfo) {
        requestInfo.completed = true;
        activeRequests.set(requestId, requestInfo);
      }

      // Try to read the response body
      try {
        const contentType = clonedResponse.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const body = await clonedResponse.json();
          networkLog('TRACE: Supabase response body', {
            requestId,
            body,
            tabVisible: document.visibilityState === 'visible'
          });
        }
      } catch (err) {
        // Reading the body failed, but the request itself succeeded
        networkLog('TRACE: Could not read response body', {
          requestId,
          error: err instanceof Error ? err.message : String(err)
        });
      }

      return response;
    } catch (error) {
      // Log the error
      networkLog('TRACE: Supabase request failed', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        duration: performance.now() - startTime,
        tabVisible: document.visibilityState === 'visible'
      });

      // Re-throw the original error
      throw error;
    }
  };

  // Set up visibility change tracking
  document.addEventListener('visibilitychange', () => {
    const isVisible = document.visibilityState === 'visible';
    
    // Check for active requests when visibility changes
    if (activeRequests.size > 0) {
      networkLog('TRACE: Tab visibility changed with active requests', {
        tabVisible: isVisible,
        activeRequestCount: activeRequests.size,
        activeRequests: Array.from(activeRequests.values())
          .filter(req => !req.completed)
          .map(req => ({
            requestId: req.requestId,
            url: req.url,
            method: req.method,
            elapsedMs: performance.now() - req.startTime
          }))
      });
    }

    // If becoming visible, check for potentially stalled requests
    if (isVisible) {
      const now = performance.now();
      const stalledRequests = Array.from(activeRequests.values())
        .filter(req => !req.completed && (now - req.startTime > 5000));
      
      if (stalledRequests.length > 0) {
        networkLog('TRACE: Detected potentially stalled requests', {
          stalledRequests: stalledRequests.map(req => ({
            requestId: req.requestId,
            url: req.url,
            method: req.method,
            elapsedMs: now - req.startTime
          }))
        });
      }
    }
  });
}

/**
 * Initialize the network tracer
 * Should be called as early as possible in the application
 */
export function initNetworkTracer() {
  if (isBrowser) {
    networkLog('Network tracer initialized', {
      timestamp: new Date().toISOString()
    });
    
    // Make the tracer available globally for debugging
    // @ts-ignore - Adding to window for debugging
    window.__networkTracer = {
      getActiveRequests
    };
    
    console.log(
      '%c[NetworkTracer] Initialized and ready for debugging tab switch issues',
      'color: purple; font-weight: bold;'
    );
  }
}

/**
 * Get the current active requests
 * Useful for debugging in the console
 */
export function getActiveRequests() {
  if (!isBrowser) return [];
  return Array.from(activeRequests.values());
}

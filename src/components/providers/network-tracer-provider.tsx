'use client';

import { useEffect } from 'react';
import { initNetworkTracer } from '@/lib/network-tracer';

/**
 * Provider component that initializes the network tracer
 * This should be placed high in the component tree
 */
export function NetworkTracerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize the network tracer on the client side
    initNetworkTracer();
    
    // Log when the network tracer is available in the console
    console.log(
      '%c[NetworkTracer] Initialized and available in console as window.__networkTracer',
      'color: purple; font-weight: bold'
    );
    
    // Add a command to the console to check active requests
    console.log(
      '%c[NetworkTracer] Check active requests with: window.__networkTracer.getActiveRequests()',
      'color: purple'
    );
  }, []);

  return <>{children}</>;
}

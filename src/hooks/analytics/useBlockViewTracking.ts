import { useEffect, useRef, useMemo } from 'react';
// Import directly from the source file instead of the index
import { trackBlockViewClient } from '@/services/analytics/trackBlockViewClient';
import { getVisitorId } from '@/lib/analytics/visitorId';

// Verify the import is working
console.log('🚨 DEBUG useBlockViewTracking - trackBlockViewClient import check:', {
  trackBlockViewClientExists: typeof trackBlockViewClient === 'function'
});

/**
 * Hook to track when a form block becomes visible
 * 
 * Uses IntersectionObserver to track when a block enters the viewport
 * 
 * @param blockId - The ID of the block to track
 * @param formId - The ID of the form containing the block
 * @param options - Optional configuration
 * @returns An object containing a ref to attach to the block element
 */
export function useBlockViewTracking(
  blockId: string | undefined,
  formId: string | undefined,
  options: {
    responseId?: string;
    threshold?: number;
    disabled?: boolean;
    metadata?: Record<string, unknown>;
  } = {}
) {
  const { 
    responseId,
    threshold = 0.5, // Default: track when 50% of block is visible
    disabled = false,
    metadata = {}
  } = options;
  
  const blockRef = useRef<HTMLDivElement>(null);
  const hasTracked = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    // Debug: Log initial state of hook
    console.log(`🔍 DEBUG: useBlockViewTracking for block ${blockId}`, {
      disabled,
      hasTrackedCurrent: hasTracked.current,
      blockRefExists: !!blockRef.current
    });
    
    // If disabled, either ID is missing, or already tracked, don't track
    if (disabled || !blockId || !formId || hasTracked.current) {
      console.log(`🚫 DEBUG: Skipping block tracking for ${blockId}`, {
        reason: disabled ? 'disabled' : !blockId ? 'missing blockId' : !formId ? 'missing formId' : 'already tracked'
      });
      return;
    }
    
    // Clean up any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    
    // Setup intersection observer to track when the block becomes visible
    const observer = new IntersectionObserver(
      (entries) => {
        // Find our target entry
        const entry = entries.find(e => e.target === blockRef.current);
        if (!entry) return;
        
        // If block is visible and hasn't been tracked yet
        if (entry.isIntersecting && !hasTracked.current) {
          hasTracked.current = true;
          
          const visitorId = getVisitorId();
          
          // 👀 DISTINCTIVE VERIFICATION LOG - Look for this in console
          console.log('👀 BLOCK TRACKING VERIFICATION: About to track block', blockId);
          
          // Track the block view
          trackBlockViewClient(blockId, formId, responseId, {
            visitor_id: visitorId,
            visibility_percentage: Math.round(entry.intersectionRatio * 100),
            ...metadata
          }).catch((error: unknown) => {
            console.error('Error tracking block view:', error);
          });
          
          // Once tracked, disconnect the observer
          observer.disconnect();
          observerRef.current = null;
        }
      },
      { threshold }
    );
    
    // Store the observer for cleanup
    observerRef.current = observer;
    
    // Start observing the block element if it exists
    if (blockRef.current) {
      console.log(`📣 DEBUG: Starting observation of block ${blockId}`, {
        element: blockRef.current,
        threshold
      });
      observer.observe(blockRef.current);
    } else {
      console.log(`⚠️ DEBUG: Cannot observe block ${blockId} - ref is null`);
    }
    
    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [blockId, formId, responseId, threshold, disabled, metadata]);
  
  // Memoize the return object
  const hasTrackedValue = hasTracked.current;
  return useMemo(() => ({
    blockRef,
    hasTracked: hasTrackedValue
  }), [blockRef, hasTrackedValue]); // Include blockRef for completeness, though it's stable
}

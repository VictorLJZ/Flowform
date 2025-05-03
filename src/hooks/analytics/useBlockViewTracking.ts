import { useEffect, useRef, useMemo } from 'react';
import { trackBlockViewClient } from '@/services/analytics/client';
import { getVisitorId } from '@/lib/analytics/visitorId';

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
    // If disabled, either ID is missing, or already tracked, don't track
    if (disabled || !blockId || !formId || hasTracked.current) {
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
      observer.observe(blockRef.current);
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

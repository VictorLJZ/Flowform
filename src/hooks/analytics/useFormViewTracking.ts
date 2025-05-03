import { useEffect, useRef, useMemo } from 'react';
import { trackFormViewClient } from '@/services/analytics/client';
import { getVisitorId, isUniqueFormVisit } from '@/lib/analytics/visitorId';

/**
 * Hook to track form views
 * 
 * Automatically tracks when a form is viewed by the user.
 * Only tracks once per component mount.
 * 
 * @param formId - The ID of the form being viewed
 * @param options - Optional configuration
 * @returns Object with tracking info
 */
export function useFormViewTracking(
  formId: string | undefined,
  options: {
    source?: string;
    disabled?: boolean;
    metadata?: Record<string, unknown>;
  } = {}
) {
  const { source, disabled = false, metadata = {} } = options;
  const hasTracked = useRef(false);
  
  useEffect(() => {
    // If disabled, form ID is missing, or already tracked in this component lifetime, don't track
    if (disabled || !formId || hasTracked.current) {
      return;
    }
    
    // Set tracked flag to true to prevent duplicate tracking
    hasTracked.current = true;
    
    const visitorId = getVisitorId();
    const isUnique = isUniqueFormVisit(formId);
    
    // Track the form view
    const trackingPromise = trackFormViewClient(formId, {
      source,
      visitor_id: visitorId,
      is_unique: isUnique,
      ...metadata
    });
    
    // Handle the promise but don't block rendering
    trackingPromise.catch((error: unknown) => {
      console.error('Error tracking form view:', error);
    });
    
  }, [formId, source, disabled, metadata]);
  
  // Memoize the return object
  // We're directly using the ref value, so no dependencies needed for this memo
  return useMemo(() => ({
    hasTracked: hasTracked.current
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
}

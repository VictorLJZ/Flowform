import { useEffect, useRef } from 'react';
import { useViewTrackingStore } from '@/stores/viewTrackingStore';

/**
 * Hook for tracking form views with automatic deduplication
 * 
 * Automatically tracks a view when the component mounts
 * Prevents duplicate tracking within a configurable cooldown period
 * 
 * @param formId - ID of the form to track views for
 * @param options - Optional configuration options
 * @returns Object with tracking state and methods
 */
export function useViewTracking(
  formId: string | undefined,
  options: {
    disabled?: boolean;
    cooldownMinutes?: number;
    metadata?: Record<string, unknown>;
  } = {}
) {
  // Extract options with defaults
  const { 
    disabled = false,
    cooldownMinutes = 30,
    metadata = {}
  } = options;
  
  // Get methods from the store
  const { 
    trackView, 
    hasViewedRecently, 
    getFormViewCount 
  } = useViewTrackingStore();
  
  // Track whether we've already tracked a view in this component instance
  const hasTrackedRef = useRef(false);
  
  // Effect to track the view once on mount
  useEffect(() => {
    // Skip if disabled, no form ID, or already tracked in this component instance
    if (disabled || !formId || hasTrackedRef.current) {
      return;
    }
    
    // Check if we've viewed this form recently
    const viewedRecently = hasViewedRecently(formId, cooldownMinutes);
    
    if (!viewedRecently) {
      console.log('[useViewTracking] Tracking view for form:', formId);
      
      // Track the view and mark as tracked for this component instance
      trackView(formId, metadata)
        .then(tracked => {
          if (tracked) {
            hasTrackedRef.current = true;
          }
        })
        .catch(error => {
          console.error('[useViewTracking] Error tracking view:', error);
        });
    } else {
      console.log('[useViewTracking] Skipping duplicate view for form:', formId);
      hasTrackedRef.current = true;
    }
  }, [formId, disabled, metadata, cooldownMinutes, trackView, hasViewedRecently]);
  
  // Return tracking state and methods
  return {
    // Read-only state
    hasTracked: hasTrackedRef.current || (formId ? hasViewedRecently(formId, cooldownMinutes) : false),
    viewCount: formId ? getFormViewCount(formId) : 0,
    
    // Methods
    forceTrackView: formId ? () => trackView(formId, metadata) : async () => false
  };
}

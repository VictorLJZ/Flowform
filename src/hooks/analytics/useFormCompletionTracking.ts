import { useRef, useCallback, useMemo } from 'react';
import { trackFormCompletionClient } from '@/services/analytics/client';
import { getVisitorId } from '@/lib/analytics/visitorId';

/**
 * Hook to track form completion
 * 
 * Provides a function to call when the form is completed
 * 
 * @param formId - The ID of the form
 * @param responseId - The ID of the form response
 * @param options - Optional configuration
 * @returns Object with trackCompletion function
 */
export function useFormCompletionTracking(
  formId: string | undefined,
  responseId: string | undefined,
  options: {
    disabled?: boolean;
    metadata?: Record<string, unknown>;
  } = {}
) {
  const { 
    disabled = false,
    metadata = {}
  } = options;
  
  // DEBUGGING: Log hook initialization
  console.log('[TRACKING DEBUG] useFormCompletionTracking initialized with:', {
    formId,
    responseId,
    disabled,
    has_metadata: !!metadata && Object.keys(metadata).length > 0
  });
  
  // Track when the form was started for duration calculation
  const startTimeRef = useRef<number>(Date.now());
  const hasTracked = useRef<boolean>(false);
  
  /**
   * Track form completion
   * 
   * @param additionalMetadata - Additional metadata for the completion event
   * @returns Promise that resolves when tracking is complete
   */
  const trackCompletion = useCallback(async (
    additionalMetadata: Record<string, unknown> = {}
  ) => {
    // DEBUGGING: Log what data is received by trackCompletion
    console.log('[TRACKING DEBUG] trackCompletion called with:', {
      additionalMetadata,
      formId,
      responseId,
      hasTracked: hasTracked.current,
      disabled
    });
    
    // Don't track if disabled, missing IDs, or already tracked
    if (disabled || !formId || !responseId || hasTracked.current) {
      console.warn('[TRACKING DEBUG] Skipping form completion tracking due to:', {
        disabled,
        formId_missing: !formId,
        responseId_missing: !responseId,
        already_tracked: hasTracked.current
      });
      return;
    }
    
    // Mark as tracked to prevent duplicate tracking
    hasTracked.current = true;
    
    const visitorId = getVisitorId();
    console.log('[TRACKING DEBUG] Got visitor ID:', visitorId);
    
    // Calculate total time spent on form
    const totalTimeSeconds = Math.floor(
      (Date.now() - startTimeRef.current) / 1000
    );
    
    try {
      console.log('[TRACKING DEBUG] Preparing form completion tracking payload:', {
        form_id: formId,
        response_id: responseId,
        visitor_id: visitorId,
        total_time_seconds: totalTimeSeconds,
        metadata_keys: Object.keys(metadata),
        additionalMetadata_keys: Object.keys(additionalMetadata)
      });
      
      // IMPORTANT: We need to match the client function's snake_case parameter naming
      // Convert from camelCase variables to snake_case parameters
      console.log('[TRACKING DEBUG] Calling trackFormCompletionClient with parameters:',
        formId,
        responseId
      );
      
      await trackFormCompletionClient(
        formId, // This becomes form_id in the client function 
        responseId, // This becomes response_id in the client function
        {
          visitor_id: visitorId,
          total_time_seconds: totalTimeSeconds,
          ...metadata,
          ...additionalMetadata
        }
      );
      
      console.log('[TRACKING DEBUG] Successfully called completion tracking client');
      // No return value from client implementation
      return true;
    } catch (error) {
      console.error('Error tracking form completion:', error);
      throw error;
    }
  }, [formId, responseId, disabled, metadata]);
  
  // Memoize the return object
  const hasTrackedValue = hasTracked.current;
  return useMemo(() => ({
    trackCompletion,
    hasTracked: hasTrackedValue
  }), [trackCompletion, hasTrackedValue]);
}

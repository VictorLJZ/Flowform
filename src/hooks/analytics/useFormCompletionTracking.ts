import { useRef, useCallback } from 'react';
import { trackFormCompletion } from '@/services/analytics';
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
    // Don't track if disabled, missing IDs, or already tracked
    if (disabled || !formId || !responseId || hasTracked.current) {
      return;
    }
    
    // Mark as tracked to prevent duplicate tracking
    hasTracked.current = true;
    
    const visitorId = getVisitorId();
    
    // Calculate total time spent on form
    const totalTimeSeconds = Math.floor(
      (Date.now() - startTimeRef.current) / 1000
    );
    
    try {
      const result = await trackFormCompletion(
        formId, 
        responseId,
        totalTimeSeconds,
        {
          visitor_id: visitorId,
          ...metadata,
          ...additionalMetadata
        }
      );
      
      return result;
    } catch (error) {
      console.error('Error tracking form completion:', error);
      throw error;
    }
  }, [formId, responseId, disabled, metadata]);
  
  return {
    trackCompletion,
    hasTracked: hasTracked.current
  };
}

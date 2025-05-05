import { useCallback, useMemo, useRef } from 'react';
import { trackBlockSubmitClient } from '@/services/analytics/trackBlockSubmitClient';
import { getVisitorId } from '@/lib/analytics/visitorId';

/**
 * Hook to track form block submissions
 * 
 * Simplified replacement for useBlockInteractionTracking that focuses only on submit events
 * 
 * @param blockId - The ID of the block to track
 * @param formId - The ID of the form containing the block
 * @param options - Optional configuration
 * @returns Object with submit tracking handler
 */
export function useBlockSubmitTracking(
  blockId: string | undefined,
  formId: string | undefined,
  options: {
    responseId?: string;
    disabled?: boolean;
    metadata?: Record<string, unknown>;
  } = {}
) {
  const { 
    responseId,
    disabled = false,
    metadata = {}
  } = options;
  
  const hasTracked = useRef(false);
  
  /**
   * Track a block submission
   * 
   * @param additionalMetadata - Additional metadata specific to this submission
   */
  const trackSubmit = useCallback(async (
    additionalMetadata: Record<string, unknown> = {}
  ) => {
    // Add detailed logging for debugging
    console.log('[useBlockSubmitTracking] trackSubmit called with:', {
      blockId,
      formId,
      responseId,
      disabled,
      hasTracked: hasTracked.current,
      additionalMetadata
    });

    if (disabled || !blockId || !formId || !responseId) {
      console.log(`[useBlockSubmitTracking] Skipping block submit tracking:`, {
        reason: disabled ? 'disabled' : 
               !blockId ? 'missing blockId' : 
               !formId ? 'missing formId' : 
               !responseId ? 'missing responseId' : 'unknown'
      });
      return;
    }
    
    const visitorId = getVisitorId();
    
    try {
      console.log('[DEBUG] Tracking block submit for block:', blockId);
      
      await trackBlockSubmitClient(
        blockId, 
        formId,
        responseId,
        {
          visitor_id: visitorId,
          ...metadata,
          ...additionalMetadata
        }
      );
    } catch (error) {
      console.error(`Error tracking block submit:`, error);
    }
  }, [blockId, formId, responseId, disabled, metadata]);
  
  /**
   * Handler for submit events
   * 
   * @param valueInfo - Information about the value that was submitted
   */
  const handleSubmit = useCallback((valueInfo: Record<string, unknown> = {}) => {
    trackSubmit(valueInfo);
  }, [trackSubmit]);
  
  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // Main submit handler
    handleSubmit,
    
    // Direct access to the tracking function
    trackSubmit
  }), [handleSubmit, trackSubmit]);
}

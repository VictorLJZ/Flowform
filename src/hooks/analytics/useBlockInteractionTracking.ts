import { useCallback, useMemo } from 'react';
import { trackBlockInteractionClient } from '@/services/analytics/client';
import { getVisitorId } from '@/lib/analytics/visitorId';

// Only track submit events for simplicity
type InteractionType = 'submit';

/**
 * Hook to track interactions with a form block
 * 
 * Simplified to only track submit events
 * 
 * @param blockId - The ID of the block to track
 * @param formId - The ID of the form containing the block
 * @param options - Optional configuration
 * @returns Object with handler for submit events
 */
export function useBlockInteractionTracking(
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
  
  /**
   * Track a submit interaction
   * 
   * @param additionalMetadata - Additional metadata specific to this interaction
   */
  const trackSubmit = useCallback(async (
    additionalMetadata: Record<string, unknown> = {}
  ) => {
    if (disabled || !blockId || !formId) {
      return;
    }
    
    const visitorId = getVisitorId();
    
    try {
      await trackBlockInteractionClient(
        blockId, 
        formId,
        'submit',
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
  
  // Memoize the return object
  return useMemo(() => ({
    // Only expose submit functionality
    handleSubmit,
    
    // Expose the track submit function for direct use
    trackSubmit,
    
    // Return empty handlers for other events to maintain API compatibility
    handleFocus: () => {},
    handleBlur: () => {},
    handleChange: () => {},
    handleError: () => {},
  }), [handleSubmit, trackSubmit]);
}

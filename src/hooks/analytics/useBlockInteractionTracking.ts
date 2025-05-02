import { useRef, useCallback } from 'react';
import { trackBlockInteraction } from '@/services/analytics';
import { getVisitorId } from '@/lib/analytics/visitorId';

// Interaction types supported by the block interaction tracking
type InteractionType = 'focus' | 'blur' | 'change' | 'submit' | 'error';

/**
 * Hook to track interactions with a form block
 * 
 * Provides handlers for tracking focus, blur, change, submit, and error events
 * 
 * @param blockId - The ID of the block to track
 * @param formId - The ID of the form containing the block
 * @param options - Optional configuration
 * @returns Object with handlers for different interaction types
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
  
  // Keep track of focus time for duration calculations
  const focusStartTime = useRef<number | null>(null);
  
  /**
   * Track a block interaction
   * 
   * @param interactionType - Type of interaction to track
   * @param additionalMetadata - Additional metadata specific to this interaction
   * @param durationMs - Optional duration in milliseconds
   */
  const trackInteraction = useCallback(async (
    interactionType: InteractionType,
    additionalMetadata: Record<string, unknown> = {},
    durationMs?: number
  ) => {
    if (disabled || !blockId || !formId) {
      return;
    }
    
    const visitorId = getVisitorId();
    
    try {
      await trackBlockInteraction(
        blockId, 
        formId,
        interactionType,
        responseId,
        durationMs,
        {
          visitor_id: visitorId,
          ...metadata,
          ...additionalMetadata
        }
      );
    } catch (error) {
      console.error(`Error tracking block ${interactionType}:`, error);
    }
  }, [blockId, formId, responseId, disabled, metadata]);
  
  /**
   * Handler for focus events
   */
  const handleFocus = useCallback(() => {
    // Record focus start time for duration calculation
    focusStartTime.current = Date.now();
    
    trackInteraction('focus');
  }, [trackInteraction]);
  
  /**
   * Handler for blur events
   */
  const handleBlur = useCallback(() => {
    // Calculate focus duration if available
    const durationMs = focusStartTime.current
      ? Date.now() - focusStartTime.current
      : undefined;
    
    // Reset focus start time
    focusStartTime.current = null;
    
    trackInteraction('blur', {}, durationMs);
  }, [trackInteraction]);
  
  /**
   * Handler for change events
   * 
   * @param valueInfo - Information about the value that changed
   */
  const handleChange = useCallback((valueInfo: Record<string, unknown> = {}) => {
    trackInteraction('change', valueInfo);
  }, [trackInteraction]);
  
  /**
   * Handler for submit events
   * 
   * @param valueInfo - Information about the value that was submitted
   */
  const handleSubmit = useCallback((valueInfo: Record<string, unknown> = {}) => {
    // Calculate total interaction duration if focus time is available
    const durationMs = focusStartTime.current
      ? Date.now() - focusStartTime.current
      : undefined;
    
    // Reset focus start time
    focusStartTime.current = null;
    
    trackInteraction('submit', valueInfo, durationMs);
  }, [trackInteraction]);
  
  /**
   * Handler for error events
   * 
   * @param errorInfo - Information about the error
   */
  const handleError = useCallback((errorInfo: Record<string, unknown> = {}) => {
    trackInteraction('error', errorInfo);
  }, [trackInteraction]);
  
  return {
    handleFocus,
    handleBlur,
    handleChange,
    handleSubmit,
    handleError,
    trackInteraction // Expose the base function for custom tracking needs
  };
}

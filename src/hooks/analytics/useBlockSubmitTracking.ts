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
    console.log('🔄 [useBlockSubmitTracking] trackSubmit called with:', {
      blockId,
      formId,
      responseId,
      disabled,
      hasTracked: hasTracked.current,
      additionalMetadata
    });

    // Even if some fields are missing, we'll try to track what we can
    // This ensures we don't lose tracking data due to missing fields
    const effectiveBlockId = blockId || additionalMetadata.block_id as string || 'unknown_block';
    const effectiveFormId = formId || additionalMetadata.form_id as string || 'unknown_form';
    const effectiveResponseId = responseId || additionalMetadata.response_id as string || 'unknown_session';
    
    // Skip only if explicitly disabled
    if (disabled) {
      console.log(`⛔ [useBlockSubmitTracking] Skipping block submit tracking because it's disabled`);
      return;
    }
    
    console.log('✅ [useBlockSubmitTracking] Preparing to track block submission');
    const visitorId = getVisitorId();
    console.log('👤 [useBlockSubmitTracking] Got visitor ID:', visitorId);
    
    try {
      console.log('🔍 [useBlockSubmitTracking] About to call trackBlockSubmitClient for block:', effectiveBlockId);
      
      // Create a combined metadata object with all the information we have
      const combinedMetadata = {
        visitor_id: visitorId,
        ...metadata,
        ...additionalMetadata,
        // Force these fields to ensure they're always present
        block_id: effectiveBlockId,
        form_id: effectiveFormId,
        response_id: effectiveResponseId,
        // Add timestamp for debugging
        tracked_at: new Date().toISOString()
      };
      
      // Log the full argument details
      console.log('📝 [useBlockSubmitTracking] Calling with arguments:', {
        blockId: effectiveBlockId, 
        formId: effectiveFormId,
        responseId: effectiveResponseId,
        metadata: combinedMetadata
      });
      
      // Extract duration_ms from metadata if present
      const durationMs = additionalMetadata.duration_ms || metadata.duration_ms;
      
      console.log('⏱️ [useBlockSubmitTracking] Extracted durationMs:', durationMs);
      
      // Always call trackBlockSubmitClient, even if some fields are missing
      await trackBlockSubmitClient(
        effectiveBlockId, 
        effectiveFormId,
        effectiveResponseId,
        typeof durationMs === 'number' ? durationMs : undefined,
        combinedMetadata
      );
      
      // Mark as tracked
      hasTracked.current = true;
      
      console.log('🎉 [useBlockSubmitTracking] Successfully called trackBlockSubmitClient');
    } catch (error) {
      console.error(`❌ [useBlockSubmitTracking] Error tracking block submit:`, error);
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

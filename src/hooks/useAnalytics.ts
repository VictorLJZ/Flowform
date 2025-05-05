/**
 * Main analytics hook that integrates all tracking capabilities
 */

import { useCallback, useMemo, useEffect } from 'react';
import {
  useBlockViewTracking,
  useBlockSubmitTracking, // Use the new simplified tracking hook
  useFormCompletionTracking,
  useTimingMeasurement
} from '@/hooks/analytics';
import type { MutableRefObject } from 'react';

/**
 * Main analytics hook
 * 
 * Provides a unified interface for all analytics tracking capabilities
 * 
 * @param options Analytics configuration options
 * @returns Combined analytics tracking utilities
 */
export function useAnalytics(options: {
  formId?: string;
  blockId?: string;
  responseId?: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
  abandonmentReason?: string; // Optional reason for abandonment
} = {}) {
  const {
    formId,
    blockId,
    responseId,
    disabled = false,
    metadata = {}
    // abandonmentReason removed as it's not used anywhere
  } = options;

  // NOTE: Form view tracking has been migrated to useViewTracking hook.
  // All view tracking should now use the dedicated hook instead of this one.

  const blockView = useBlockViewTracking(blockId, formId, {
    responseId,
    disabled,
    metadata
  });

  // Use the new block submit tracking hook which focuses only on submit events
  const blockSubmit = useBlockSubmitTracking(blockId, formId, {
    responseId,
    disabled,
    metadata
  });

  const formCompletion = useFormCompletionTracking(formId, responseId, {
    disabled,
    metadata
  });

  const timing = useTimingMeasurement();

  // Function to track the entire form session (except views)
  // Form views are now tracked separately via useViewTracking
  const trackFormSession = useCallback(async (sessionMetadata: Record<string, unknown> = {}) => {
    if (!formId || !responseId || disabled) {
      return false;
    }
    
    // Stop the timer and get the total elapsed time
    const elapsedTimeMs = timing.stopTimer();
    const elapsedTimeSeconds = Math.floor(elapsedTimeMs / 1000);
    
    try {
      // Track the completion with timing information
      await formCompletion.trackCompletion({
        ...sessionMetadata,
        elapsed_time_seconds: elapsedTimeSeconds
      });
      
      console.log('[ANALYTICS] Form session tracking complete');
      return true;
    } catch (error) {
      console.error('Error tracking form session:', error);
      return false;
    }
  }, [formId, responseId, disabled, timing, formCompletion]);

  // Track form abandonment functionality removed as it's not being used
  // Keeping abandonmentReason variable as it might be used elsewhere

  useEffect(() => {
    console.log('[ANALYTICS DEBUG] useAnalytics detected changes:', { 
      formId, 
      responseId, 
      disabled,
      formCompletionDisabled: disabled
    });
  }, [formId, responseId, disabled]);

  // Memoize the return object
  return useMemo(() => {
    console.log('[ANALYTICS DEBUG] useAnalytics re-rendering return value with:', { 
      responseId, 
      disabled,
      formCompletionDisabled: disabled 
    });
    
    return {
      // Block-specific tracking
      blockView,
      blockSubmit,
      
      // Legacy property name for backward compatibility
      blockInteraction: blockSubmit,
      
      // Form tracking
      formCompletion,
      
      // Timing utilities
      timing,
      
      // Status flags
      blockViewTracked: blockView.hasTracked,
      formCompleted: formCompletion.hasTracked,
      
      // Track block submission 
      trackBlockInteraction: (interactionType: 'submit', valueInfo: Record<string, unknown> = {}) => {
        if (blockId) {
          blockSubmit.trackSubmit(valueInfo);
        }
      },
      
      // Shortcuts to specific handlers
      trackSubmit: blockSubmit.handleSubmit,
      
      // Form completion tracking
      trackCompletion: formCompletion.trackCompletion,
      
      // Timing utilities
      startTiming: timing.startTimer,
      pauseTiming: timing.pauseTimer,
      stopTiming: timing.stopTimer,
      getElapsedTiming: timing.getElapsedTime,
      formatTiming: timing.formatTime,
      
      // Combined tracking functions
      trackFormSession,
      
      // Helper references for parent components
      blockRef: blockView.blockRef as MutableRefObject<HTMLDivElement | null>,
    };
  }, [blockId, blockView, blockSubmit, formCompletion, timing, trackFormSession, disabled, responseId]);
}

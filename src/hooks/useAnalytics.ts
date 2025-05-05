/**
 * Main analytics hook that integrates all tracking capabilities
 */

import { useCallback, useMemo, useEffect } from 'react';
import {
  useBlockViewTracking,
  useBlockInteractionTracking,
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
    metadata = {},
    abandonmentReason
  } = options;

  // NOTE: Form view tracking has been migrated to useViewTracking hook.
  // All view tracking should now use the dedicated hook instead of this one.

  const blockView = useBlockViewTracking(blockId, formId, {
    responseId,
    disabled,
    metadata
  });

  const blockInteraction = useBlockInteractionTracking(blockId, formId, {
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

  // Track form abandonment
  const trackAbandonment = useCallback((data: Record<string, unknown> = {}) => {
    if (!formId || disabled) return;
    const eventData = { ...data, event_type: 'form_abandonment', abandonment_reason: abandonmentReason };
    console.log('[Analytics] trackAbandonment:', eventData);
    // TODO: Send data to analytics backend
  }, [formId, disabled, abandonmentReason]);

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
      // Combined refs
      blockRef: blockView.blockRef as MutableRefObject<HTMLDivElement | null>,
      
      // Status indicators
      blockViewTracked: blockView.hasTracked,
      formCompleted: formCompletion.hasTracked,
      
      // Block interaction handlers
      trackFocus: blockInteraction.handleFocus,
      trackBlur: blockInteraction.handleBlur,
      trackChange: blockInteraction.handleChange,
      trackSubmit: blockInteraction.handleSubmit,
      trackError: blockInteraction.handleError,
      trackInteraction: blockInteraction.trackInteraction,
      
      // Form completion tracking
      trackCompletion: formCompletion.trackCompletion,
      
      // Combined tracking
      trackFormSession,
      trackAbandonment,
      
      // Timing utilities
      timing,
      
      // Raw hooks for advanced usage
      blockView,
      blockInteraction,
      formCompletion
    };
  // Add formId, responseId, and disabled as dependencies to ensure the hook re-initializes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId, responseId, disabled, formCompletion]);
}

/**
 * Main analytics hook that integrates all tracking capabilities
 */

import { useCallback, useMemo } from 'react';
import {
  useFormViewTracking,
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

  // Initialize individual tracking hooks
  const formView = useFormViewTracking(formId, {
    disabled,
    metadata
  });

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

  // Helper to track a full form session in one call
  const trackFormSession = useCallback(async (sessionMetadata: Record<string, unknown> = {}) => {
    if (!formId || !responseId || disabled) {
      return;
    }
    
    // Stop the timer and get the total elapsed time
    const elapsedTimeMs = timing.stopTimer();
    const elapsedTimeSeconds = Math.floor(elapsedTimeMs / 1000);
    
    // Track the completion with timing information
    await formCompletion.trackCompletion({
      ...sessionMetadata,
      elapsed_time_seconds: elapsedTimeSeconds
    });
  }, [formId, responseId, disabled, timing, formCompletion]);

  // Track form abandonment
  const trackAbandonment = useCallback((data: Record<string, unknown> = {}) => {
    if (!formId || disabled) return;
    const eventData = { ...data, event_type: 'form_abandonment', abandonment_reason: abandonmentReason };
    console.log('[Analytics] trackAbandonment:', eventData);
    // TODO: Send data to analytics backend
  }, [formId, disabled, abandonmentReason]);

  return useMemo(() => ({
    // Combined refs
    blockRef: blockView.blockRef as MutableRefObject<HTMLDivElement | null>,
    
    // Status indicators
    formViewTracked: formView.hasTracked,
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
    formView,
    blockView,
    blockInteraction,
    formCompletion
  }), [
    blockView.blockRef,
    formView.hasTracked,
    blockView.hasTracked,
    formCompletion.hasTracked,
    blockInteraction.handleFocus,
    blockInteraction.handleBlur,
    blockInteraction.handleChange,
    blockInteraction.handleSubmit,
    blockInteraction.handleError,
    blockInteraction.trackInteraction,
    formCompletion.trackCompletion,
    trackFormSession,
    trackAbandonment,
    timing,
    formView,
    blockView,
    blockInteraction,
    formCompletion,
  ]);
}

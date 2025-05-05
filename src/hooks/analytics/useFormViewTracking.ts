import { useMemo } from 'react';
import { useViewTracking } from './useViewTracking';

/**
 * DEPRECATED: Use useViewTracking instead
 * 
 * This is a compatibility wrapper around the new useViewTracking hook
 * for backward compatibility with existing code.
 */

interface UseFormViewTrackingResult {
  hasTracked: boolean;
}

/**
 * @deprecated Use useViewTracking instead
 */
export function useFormViewTracking(
  formId: string | undefined,
  options: { 
    source?: string;
    disabled?: boolean;
    metadata?: Record<string, unknown>;
  } = {}
): UseFormViewTrackingResult {
  const { 
    source,
    disabled = false,
    metadata = {}
  } = options;
  
  // Use the new hook implementation
  const { hasTracked } = useViewTracking(formId, {
    disabled,
    metadata: { ...metadata, source },
    cooldownMinutes: 30
  });
  
  // Return the same interface for backward compatibility
  return useMemo(() => ({
    hasTracked
  }), [hasTracked]);
}

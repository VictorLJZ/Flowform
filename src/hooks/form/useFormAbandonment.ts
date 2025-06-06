import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics'; // Assuming trackAbandonment will be added here

interface UseFormAbandonmentProps {
  responseId: string | null;
  currentBlockId: string | null;
  completed: boolean;
  analytics: ReturnType<typeof useAnalytics>; // Pass the analytics instance
}

/**
 * Hook to track form abandonment via analytics.
 * Adds a 'beforeunload' event listener to track when the user leaves the form page.
 */
export const useFormAbandonment = ({
  responseId,
  currentBlockId,
  completed,
  analytics,
}: UseFormAbandonmentProps): void => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only track abandonment if the form isn't completed and we have a responseId
      if (!completed && responseId) {
        console.log(`[Analytics] Tracking form abandonment. Response ID: ${responseId}, Last Block ID: ${currentBlockId}`);
        
        // Since trackAbandonment is now removed from the analytics hook,
        // we'll use blockSubmit.trackSubmit instead, with abandonment metadata
        if (analytics.blockSubmit && typeof analytics.blockSubmit.trackSubmit === 'function') {
          analytics.blockSubmit.trackSubmit({
            event_type: 'form_abandonment',
            response_id: responseId,
            last_block_id: currentBlockId,
            is_abandoned: true
          }).catch(err => {
            console.error('[Analytics] Error tracking form abandonment:', err);
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup listener on component unmount or dependency change
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);

    // Re-run effect if completion status, responseId, blockId or analytics instance changes
  }, [completed, responseId, currentBlockId, analytics]); 
};

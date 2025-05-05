import { createClient } from '@/lib/supabase/client';
import { getVisitorId } from '@/lib/analytics/visitorId';
import { queueEvent } from '@/lib/analytics/eventQueue';

/**
 * Track form completion - Client-side implementation
 * Uses the API route to track form completions
 */

/**
 * Track a form completion event
 * 
 * @param form_id - The ID of the form
 * @param response_id - The ID of the form response
 * @param metadata - Additional metadata about the completion
 * @returns Promise that resolves when tracking is complete
 */
export async function trackFormCompletionClient(
  form_id: string,
  response_id: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  // DEBUGGING: Log the exact input parameters
  console.log('[TRACKING DEBUG] trackFormCompletionClient called with:', {
    form_id,
    response_id,
    metadata_keys: Object.keys(metadata),
    metadata_values: metadata
  });
  try {
    // Extract these values once
    const visitor_id = metadata?.visitor_id || getVisitorId();
    const total_time_seconds = metadata?.total_time_seconds || null;
    
    // Create a clean metadata object without these properties 
    const cleanMetadata = { ...metadata };
    delete cleanMetadata?.visitor_id;
    delete cleanMetadata?.total_time_seconds;
    
    const timestamp = new Date().toISOString();
    
    // Queue the event for analytics batch processing (just like form view)
    queueEvent({
      type: 'form_completion',
      timestamp,
      properties: {
        form_id,
        response_id,
        visitor_id,
        total_time_seconds,
        ...cleanMetadata
      }
    });
    
    console.log('[ANALYTICS] Tracking form completion with data:', {
      form_id,
      response_id,
      visitor_id,
      total_time_seconds
    });
    
    // Construct the API payload
    const apiPayload = {
      form_id,
      response_id,
      visitor_id,
      total_time_seconds,
      timestamp,
      metadata: cleanMetadata
    };
    
    // Function to attempt the API call with retries (similar to form view client)
    const trackWithRetry = async (retries = 2): Promise<void> => {
      try {
        // Get the current session/token (optional, not required)
        const supabaseClient = createClient();
        const { data: { session } } = await supabaseClient.auth.getSession();
        const accessToken = session?.access_token;

        console.log('[ANALYTICS] Sending form completion request to API');
        const response = await fetch('/api/analytics/track/form-completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add Authorization header if token exists (optional)
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          credentials: 'same-origin', // Include credentials for same-origin requests
          body: JSON.stringify(apiPayload),
        });

        if (!response.ok) {
          console.error(`Error tracking form completion (${response.status}): ${response.statusText}`);
          
          // Get response body for debugging
          let errorResponse = '';
          try { 
            errorResponse = await response.text(); 
            console.error('Error response:', errorResponse);
          } catch {}
          
          // Retry on 401/403 errors or network errors if retries remain
          if ((response.status === 401 || response.status === 403 || response.status >= 500) && retries > 0) {
            console.log(`Retrying form completion tracking (${retries} retries left)`);
            return trackWithRetry(retries - 1);
          }
        } else {
          console.log('[ANALYTICS] Form completion tracking successful');
        }
      } catch (error) {
        console.error('Failed to track form completion:', error);
        // Retry network errors if retries remain
        if (retries > 0) {
          console.log(`Retrying form completion tracking after error (${retries} retries left)`);
          return trackWithRetry(retries - 1);
        }
      }
    };
    
    // Begin tracking attempt
    await trackWithRetry();
  } catch (error) {
    console.error('Unexpected error in form completion tracking:', error);
    // Fail silently in production to not disrupt user experience
  }
}

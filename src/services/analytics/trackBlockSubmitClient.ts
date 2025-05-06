import { getVisitorId } from '@/lib/analytics/visitorId';
import { queueEvent } from '@/lib/analytics/eventQueue';
import { createClient } from '@/lib/supabase/client';

/**
 * Track block submit events - Client-side implementation
 * Follows the consistent pattern used in other successful analytics tracking
 */

/**
 * Track when a form block is submitted
 * 
 * @param blockId - The ID of the block being submitted
 * @param formId - The ID of the form containing the block
 * @param responseId - ID of the form response (required for submissions)
 * @param durationMs - Optional duration in milliseconds the user spent on the block
 * @param metadata - Additional metadata about the submission
 * @returns Promise that resolves when tracking is complete
 */
export async function trackBlockSubmitClient(
  blockId: string,
  formId: string,
  responseId: string,
  durationMs?: number,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  console.log('💬 [trackBlockSubmitClient] Block submit tracking called with:', {
    blockId,
    formId,
    responseId,
    durationMs,
    metadataKeys: Object.keys(metadata)
  });
  
  // Validate inputs - log warnings but continue with what we have
  if (!blockId || typeof blockId !== 'string') {
    console.warn('⚠️ [trackBlockSubmitClient] Invalid blockId:', blockId);
    blockId = String(blockId || metadata.block_id || 'unknown_block');
  }
  
  if (!formId || typeof formId !== 'string') {
    console.warn('⚠️ [trackBlockSubmitClient] Invalid formId:', formId);
    formId = String(formId || metadata.form_id || 'unknown_form');
  }
  
  if (!responseId || typeof responseId !== 'string') {
    console.warn('⚠️ [trackBlockSubmitClient] Invalid responseId:', responseId);
    responseId = String(responseId || metadata.response_id || 'unknown_response');
  }
  
  // Get visitor ID for tracking
  const visitorId = getVisitorId();
  const timestamp = new Date().toISOString();
  
  console.log('🕵️ [trackBlockSubmitClient] Using visitorId:', visitorId);
  
  // Queue the event for batch processing
  console.log('📃 [trackBlockSubmitClient] Queueing block submit event');
  queueEvent({
    type: 'block_submit',
    timestamp,
    properties: {
      block_id: blockId,
      form_id: formId,
      response_id: responseId,
      visitor_id: visitorId,
      duration_ms: durationMs,
      ...metadata
    }
  });
  
  // Enrich metadata with additional context that might be needed by the API
  const enrichedMetadata = {
    ...metadata,
    event_type: 'block_submit',
    block_id: blockId,
    form_id: formId,
    response_id: responseId,
    timestamp
  };
  
  console.log('📦 [trackBlockSubmitClient] Preparing API call to track block submit');
  
  // Function to attempt the API call with retries (similar to form view client)
  const trackWithRetry = async (retries = 2): Promise<void> => {
    try {
      // Get the current session/token (optional, not required)
      const supabaseClient = createClient();
      const { data: { session } } = await supabaseClient.auth.getSession();
      const accessToken = session?.access_token;

      // Create a properly formatted request body - match exact schema expected by API
      const requestBody = {
        blockId,         // UUID format
        formId,          // UUID format
        responseId,      // UUID format
        durationMs,      // Number (optional)
        visitorId,       // String
        metadata: enrichedMetadata,  // Record with extra data
        timestamp        // ISO date string
      };
      
      console.log('🔍 [trackBlockSubmitClient] Request body:', JSON.stringify(requestBody));
      
      // Make the API call with proper error handling
      const response = await fetch('/api/analytics/track/block-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if token exists
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          // Add public access header for public forms
          'x-flowform-public-access': 'true'
        },
        credentials: 'same-origin', // Include credentials for same-origin requests
        body: JSON.stringify(requestBody),
      });

      // Handle API response
      if (!response.ok) {
        console.error('❌ [trackBlockSubmitClient] API error:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.error('🚨 [trackBlockSubmitClient] Error details:', errorData);
          
          // Log validation errors in a more readable format
          if (errorData.details) {
            console.error('⛔ [trackBlockSubmitClient] Validation errors:', 
              errorData.details.map((e: { path: string; message: string }) => `${e.path}: ${e.message}`).join(', '));
          }
        } catch {
          console.error('❌ [trackBlockSubmitClient] Could not parse error response');
        }
        
        // Retry on 401/403 errors or network errors if retries remain
        if ((response.status === 401 || response.status === 403 || response.status >= 500) && retries > 0) {
          console.log(`🔄 Retrying block submit tracking (${retries} retries left)`);
          return trackWithRetry(retries - 1);
        }
      } else {
        // Success path
        const responseData = await response.json();
        console.log('✅ [trackBlockSubmitClient] API success:', responseData);
        
        if (responseData.data?.id) {
          console.log('🎉 [trackBlockSubmitClient] Block submit tracked with ID:', responseData.data.id);
        }
      }
    } catch (error) {
      // Don't fail the form submission due to tracking errors, but log them
      console.error('💥 [trackBlockSubmitClient] Network error tracking block submit:', error);
      
      // Retry network errors if retries remain
      if (retries > 0) {
        console.log(`🔄 Retrying block submit tracking after error (${retries} retries left)`);
        return trackWithRetry(retries - 1);
      }
    }
  };
  
  // Begin tracking attempt
  await trackWithRetry();
  
  // Notify developer of function completion
  console.log('✅ [trackBlockSubmitClient] Block submit tracking complete for block:', blockId);
}

/**
 * Track block interactions - Client-side implementation
 * Simplified to only track submit events to avoid unnecessary API calls
 */

/**
 * Track a block submit event
 * 
 * @param blockId - The ID of the block
 * @param formId - The ID of the form
 * @param eventType - The type of interaction (only 'submit' is actively tracked)
 * @param responseId - Optional ID of the form response
 * @param metadata - Additional metadata about the interaction
 * @returns Promise that resolves when tracking is complete
 */
export async function trackBlockInteractionClient(
  blockId: string,
  formId: string,
  eventType: string,
  responseId?: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  // Only track submit events, ignore other event types
  if (eventType !== 'submit') {
    return;
  }
  
  try {
    const response = await fetch('/api/analytics/track/interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blockId,
        formId,
        responseId,
        eventType,
        metadata,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      console.error('Error tracking block submit:', response.statusText);
    }
  } catch (error) {
    console.error('Failed to track block submit:', error);
    // Fail silently in production to not disrupt user experience
  }
}

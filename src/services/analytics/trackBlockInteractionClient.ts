/**
 * Track block interactions - Client-side implementation
 * Uses the API route to track block interactions
 */

/**
 * Track a block interaction event
 * 
 * @param blockId - The ID of the block
 * @param formId - The ID of the form
 * @param eventType - The type of interaction (focus, blur, change, etc.)
 * @param metadata - Additional metadata about the interaction
 * @returns Promise that resolves when tracking is complete
 */
export async function trackBlockInteractionClient(
  blockId: string,
  formId: string,
  eventType: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const response = await fetch('/api/analytics/track/interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blockId,
        formId,
        eventType,
        metadata,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      console.error('Error tracking block interaction:', response.statusText);
    }
  } catch (error) {
    console.error('Failed to track block interaction:', error);
    // Fail silently in production to not disrupt user experience
  }
}

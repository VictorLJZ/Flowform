/**
 * Track block view events - Client-side implementation
 * Uses the API route to track when a form block becomes visible
 */

/**
 * Track when a form block becomes visible
 * 
 * @param blockId - The ID of the block
 * @param formId - The ID of the form
 * @param responseId - Optional ID of the response
 * @param metadata - Additional metadata about the view
 * @returns Promise that resolves when tracking is complete
 */
export async function trackBlockViewClient(
  blockId: string,
  formId: string,
  responseId?: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const response = await fetch('/api/analytics/track/block-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blockId,
        formId,
        responseId,
        metadata,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      console.error('Error tracking block view:', response.statusText);
    }
  } catch (error) {
    console.error('Failed to track block view:', error);
    // Fail silently in production to not disrupt user experience
  }
}

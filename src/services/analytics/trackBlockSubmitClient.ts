/**
 * Track block submit events - Client-side implementation
 * Simplified approach that only tracks block submissions
 */

/**
 * Track when a form block is submitted
 * 
 * @param blockId - The ID of the block
 * @param formId - The ID of the form
 * @param responseId - ID of the form response (required for submissions)
 * @param metadata - Additional metadata about the submission
 * @returns Promise that resolves when tracking is complete
 */
export async function trackBlockSubmitClient(
  blockId: string,
  formId: string,
  responseId: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const response = await fetch('/api/analytics/track/block-submit', {
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
      console.error('Error tracking block submit:', response.statusText);
    }
  } catch (error) {
    console.error('Failed to track block submit:', error);
    // Fail silently in production to not disrupt user experience
  }
}

/**
 * Track form completion - Client-side implementation
 * Uses the API route to track form completions
 */

/**
 * Track a form completion event
 * 
 * @param formId - The ID of the form
 * @param responseId - The ID of the form response
 * @param metadata - Additional metadata about the completion
 * @returns Promise that resolves when tracking is complete
 */
export async function trackFormCompletionClient(
  formId: string,
  responseId: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const response = await fetch('/api/analytics/track/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId,
        responseId,
        metadata,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      console.error('Error tracking form completion:', response.statusText);
    }
  } catch (error) {
    console.error('Failed to track form completion:', error);
    // Fail silently in production to not disrupt user experience
  }
}

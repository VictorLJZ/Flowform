/**
 * Analytics Event Queue
 * Handles batching events and retry mechanisms
 */

// Define the event interface for all analytics events
export interface AnalyticsEvent {
  type: string;
  timestamp: string;
  properties: Record<string, unknown>;
}

// Default batch size and retry settings
const DEFAULT_BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// In-memory queue of events pending to be sent
let eventQueue: AnalyticsEvent[] = [];
let isFlushing = false;

/**
 * Add an event to the queue
 * 
 * @param event - The analytics event to queue
 */
export function queueEvent(event: AnalyticsEvent): void {
  // Add timestamp if not provided
  if (!event.timestamp) {
    event.timestamp = new Date().toISOString();
  }
  
  // Add to queue
  eventQueue.push(event);
  
  // Try to flush if we've reached batch size
  if (eventQueue.length >= DEFAULT_BATCH_SIZE) {
    void flushQueue();
  }
}

/**
 * Flush the queue by sending events to the API
 * 
 * @param forceFlush - Whether to flush regardless of batch size
 */
export async function flushQueue(forceFlush = false): Promise<void> {
  // Don't run if already flushing or no events
  if (isFlushing || eventQueue.length === 0) {
    return;
  }
  
  // Only flush if we have a full batch or force flush is true
  if (eventQueue.length < DEFAULT_BATCH_SIZE && !forceFlush) {
    return;
  }
  
  // Set flushing flag
  isFlushing = true;
  
  try {
    // Take events from queue up to batch size
    const batch = eventQueue.slice(0, DEFAULT_BATCH_SIZE);
    
    // Send to API endpoint
    await sendEventBatch(batch);
    
    // Remove sent events from queue
    eventQueue = eventQueue.slice(batch.length);
  } catch (error) {
    console.error('Failed to flush analytics events:', error);
  } finally {
    // Reset flushing flag
    isFlushing = false;
    
    // If there are more events, try to flush again
    if (eventQueue.length >= DEFAULT_BATCH_SIZE) {
      void flushQueue();
    }
  }
}

/**
 * Send a batch of events to the API with retry logic
 * 
 * @param events - The batch of events to send
 * @param retryCount - Current retry count
 */
async function sendEventBatch(
  events: AnalyticsEvent[],
  retryCount = 0
): Promise<void> {
  try {
    const response = await fetch('/api/analytics/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  } catch (error) {
    // Retry if we haven't exceeded max retries
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return sendEventBatch(events, retryCount + 1);
    }
    
    // Otherwise, rethrow the error
    throw error;
  }
}

/**
 * Register a beforeunload handler to flush events when page is unloaded
 */
export function registerUnloadFlushing(): void {
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      void flushQueue(true);
    });
  }
}

// Initialize unload flushing when module is imported
registerUnloadFlushing();

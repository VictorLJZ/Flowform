/**
 * Simple event bus for broadcasting application events
 * Used primarily for auth state changes that need to be reflected across components
 */

type EventCallback = (payload?: any) => void;

class EventBus {
  private events: Record<string, EventCallback[]> = {};

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event: string, callback: EventCallback): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, payload?: any): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(payload));
    }
  }
}

// Singleton instance for app-wide event management
export const eventBus = new EventBus();

// Define authentication event constants
export const AUTH_EVENTS = {
  SIGNED_OUT: 'auth:signed_out',
  SIGNED_IN: 'auth:signed_in',
  SESSION_EXPIRED: 'auth:session_expired'
};

/**
 * UI-level conversation types
 * 
 * These types represent conversation data as it's used in UI components.
 * They use camelCase naming and include UI-specific properties.
 */

import { 
  ApiChatSession, 
  ApiChatMessage, 
  ApiConversationEmbedding 
} from './ApiConversation';

/**
 * UI-formatted chat session with display enhancements
 */
export interface UiChatSession extends ApiChatSession {
  displayTitle: string;         // Formatted title (uses default if null)
  formattedCreatedAt: string;   // Human-readable date
  formattedUpdatedAt?: string;  // Human-readable date
  messageCount?: number;        // Number of messages in session
  isActive: boolean;            // Whether this is the currently active session
}

/**
 * UI-formatted chat message with display enhancements
 */
export interface UiChatMessage extends ApiChatMessage {
  formattedTime: string;        // Human-readable time
  isCurrentUser: boolean;       // Whether this message is from the current user
  isLoading?: boolean;          // Whether this message is still being processed
  formattedRole: string;        // User-friendly role name
}

/**
 * UI-formatted conversation embedding with display enhancements
 */
export interface UiConversationEmbedding extends ApiConversationEmbedding {
  truncatedText: string;        // Truncated preview of conversation text
  formattedCreatedAt: string;   // Human-readable date
  similarityScore?: number;     // Score when used in similarity search results
}

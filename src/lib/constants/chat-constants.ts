/**
 * Chat Constants
 * Centralized constants for chat functionality
 */
export const CHAT_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_MESSAGES_PER_PAGE: 20,
    MIN_MESSAGES_PER_PAGE: 5
  },
  ERROR_MESSAGES: {
    LOAD_FAILURE: 'Failed to load messages',
    SEND_FAILURE: 'Failed to send message',
    DELETE_FAILURE: 'Failed to delete message',
    NO_SESSION: 'No active session',
    AI_RESPONSE_FAILURE: 'Failed to generate AI response',
    PROCESS_FAILURE: 'Failed to process message'
  },
  DEFAULTS: {
    TEMP_PREFIX: 'temp-',
    DEFAULT_ROLE: 'assistant'
  }
};

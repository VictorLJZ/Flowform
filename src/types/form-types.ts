// Types for form component interfaces and handles
import { QAPair } from './supabase-types';

/**
 * Interface for AIConversationBlock component ref methods
 * Used to allow parent components to control conversation flow
 */
export interface AIConversationHandle {
  // Reset the conversation to initial state
  reset: () => void;
  
  // Submit the current answer and return success status
  submitCurrentAnswer: () => Promise<boolean>;
  
  // Check if the conversation is complete
  isComplete: () => boolean;
  
  // Get the current conversation history
  getConversation: () => QAPair[];
  
  // Alternative name for getConversation for compatibility
  getMessages: () => QAPair[];
}

/**
 * Form component ref methods for controlling form navigation
 */
export interface FormHandle {
  // Move to the next form section
  next: () => Promise<void>;
  
  // Move to the previous form section
  previous: () => Promise<void>;
  
  // Submit the form
  submit: () => Promise<void>;
  
  // Get the form completion percentage
  getProgress: () => number;
  
  // Reset the form to initial state
  reset: () => void;
} 
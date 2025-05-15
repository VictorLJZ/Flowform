// Types for form component interfaces and handles
import { ApiQAPair } from '@/types/response';
import { DbBlock } from '@/types/block/DbBlock';

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
  getConversation: () => ApiQAPair[];
  
  // Alternative name for getConversation for compatibility
  getMessages: () => ApiQAPair[];
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

/**
 * Complete form data including blocks for client-side use
 * This matches the format returned by the form API endpoints
 * Using snake_case property names as it represents data at the database layer
 */
export interface CompleteForm {
  // Form properties
  form_id: string;
  title: string;
  description: string | null;
  workspace_id: string;
  created_by: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  settings: Record<string, unknown>;
  theme: Record<string, unknown> | null;
  
  // Related data
  blocks: DbBlock[];
  workflow_edges?: Array<{
    id: string;
    source_id: string;
    target_id: string;
    source_block_id?: string;
    target_block_id?: string;
    source_handle?: string;
    target_handle?: string;
    default_target_id?: string;
    is_explicit?: boolean;
    order_index?: number;
    rules?: string;
  }> | null;
} 
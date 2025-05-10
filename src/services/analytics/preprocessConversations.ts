import { createClient } from '@/lib/supabase/client';
import { storeConversationEmbedding, embeddingExists } from '../ai/generateEmbeddings';

// Define a type for chat messages
interface ChatMessage {
  role: string;
  content: string;
  // Add other relevant fields like 'name' or 'tool_calls' if they exist
}

/**
 * Formats a conversation for embedding
 * Converts the JSONB conversation array into a readable text format
 * 
 * @param conversation The conversation array from the database
 * @returns Formatted text suitable for generating embeddings
 */
export function formatConversationForEmbedding(conversation: ChatMessage[]): string {
  if (!Array.isArray(conversation)) {
    return '';
  }
  
  return conversation.map((item) => {
    // Assuming 'role' and 'content' are the key fields. Adjust if different.
    const speaker = item.role === 'user' ? 'User' : item.role === 'assistant' ? 'Assistant' : 'System';
    return `${speaker}: ${item.content}`;
  }).join('\n');
}

/**
 * Process all conversations from a specific form and generate embeddings
 * 
 * @param formId The form ID
 * @returns Object containing success status and stats
 */
export async function processFormConversations(formId: string): Promise<{
  success: boolean;
  processed: number;
  skipped: number;
  errors: number;
}> {
  const supabase = createClient();
  
  try {
    // Fetch all dynamic block responses for the form
    const { data: blocks, error: blocksError } = await supabase
      .from('form_blocks')
      .select('id')
      .eq('form_id', formId)
      .eq('type', 'dynamic');
      
    if (blocksError) {
      console.error('Error fetching dynamic blocks:', blocksError);
      throw blocksError;
    }
    
    const blockIds = blocks.map(block => block.id);
    
    if (blockIds.length === 0) {
      return { success: true, processed: 0, skipped: 0, errors: 0 };
    }
    
    // Fetch conversations for these blocks
    const { data: responses, error: responsesError } = await supabase
      .from('dynamic_block_responses')
      .select('response_id, block_id, conversation')
      .in('block_id', blockIds);
      
    if (responsesError) {
      console.error('Error fetching dynamic responses:', responsesError);
      throw responsesError;
    }
    
    // Process each conversation
    let processed = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const response of responses) {
      try {
        // Skip if an embedding already exists
        const exists = await embeddingExists(formId, response.block_id, response.response_id);
        
        if (exists) {
          skipped++;
          continue;
        }
        
        // Format conversation text
        const conversationText = formatConversationForEmbedding(response.conversation);
        
        if (!conversationText) {
          console.warn('Empty conversation, skipping', response.response_id);
          skipped++;
          continue;
        }
        
        // Store embedding
        await storeConversationEmbedding(
          formId, 
          response.block_id, 
          response.response_id, 
          conversationText
        );
        
        processed++;
      } catch (error) {
        console.error('Error processing conversation:', error);
        errors++;
      }
    }
    
    return { success: true, processed, skipped, errors };
  } catch (error) {
    console.error('Failed to process form conversations:', error);
    throw new Error('Failed to process form conversations');
  }
} 
import { createClient } from '@/lib/supabase/client';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate an embedding for a conversation text
 * 
 * @param text The conversation text to generate an embedding for
 * @returns The embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Process a single conversation and store its embedding in the database
 * 
 * @param formId The form ID
 * @param blockId The block ID
 * @param responseId The response ID
 * @param conversationText The conversation text
 * @returns The ID of the created embedding record
 */
export async function storeConversationEmbedding(
  formId: string,
  blockId: string,
  responseId: string,
  conversationText: string
): Promise<string> {
  const supabase = createClient();
  
  try {
    // Generate embedding for the conversation
    const embedding = await generateEmbedding(conversationText);
    
    // Store in database
    const { data, error } = await supabase
      .from('conversation_embeddings')
      .upsert({
        form_id: formId,
        block_id: blockId,
        response_id: responseId,
        conversation_text: conversationText,
        embedding: embedding
      }, { onConflict: 'form_id,block_id,response_id' })
      .select('id')
      .single();
      
    if (error) {
      console.error('Error storing embedding:', error);
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error('Failed to process conversation embedding:', error);
    throw new Error('Failed to process conversation embedding');
  }
}

/**
 * Check if an embedding exists for a specific conversation
 * 
 * @param formId The form ID
 * @param blockId The block ID
 * @param responseId The response ID
 * @returns Boolean indicating if embedding exists
 */
export async function embeddingExists(
  formId: string,
  blockId: string,
  responseId: string
): Promise<boolean> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('conversation_embeddings')
    .select('id')
    .eq('form_id', formId)
    .eq('block_id', blockId)
    .eq('response_id', responseId)
    .maybeSingle();
    
  if (error) {
    console.error('Error checking embedding existence:', error);
    throw error;
  }
  
  return !!data;
} 
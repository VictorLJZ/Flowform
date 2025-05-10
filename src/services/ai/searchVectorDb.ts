import { createClient } from '@/lib/supabase/client';
import { generateEmbedding } from './generateEmbeddings';

export interface ConversationResult {
  id: string;
  form_id: string;
  block_id: string;
  response_id: string;
  conversation_text: string;
  similarity: number;
}

/**
 * Search for similar conversations using vector similarity
 * 
 * @param query The search query text
 * @param formId The form ID to search within (optional)
 * @param limit The maximum number of results (default: 5)
 * @returns Array of conversation results with similarity scores
 */
export async function searchSimilarConversations(
  query: string,
  formId?: string,
  limit: number = 5
): Promise<ConversationResult[]> {
  const supabase = createClient();
  
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    
    // Construct the base query
    let vectorQuery = supabase
      .rpc('match_conversation_embeddings', {
        query_embedding: embedding,
        match_threshold: 0.5, // Adjust as needed
        match_count: limit
      });
    
    // Add form filter if specified
    if (formId) {
      vectorQuery = vectorQuery.eq('form_id', formId);
    }
    
    // Execute the query
    const { data, error } = await vectorQuery;
    
    if (error) {
      console.error('Error searching vector database:', error);
      throw error;
    }
    
    return data as ConversationResult[];
  } catch (error) {
    console.error('Failed to search similar conversations:', error);
    throw new Error('Failed to search for similar conversations');
  }
}
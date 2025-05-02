import { createClient } from '@/lib/supabase/client';
import { deleteFormBlock } from './deleteFormBlock';

/**
 * Delete a form and all of its associated data
 * 
 * @param formId - The ID of the form to delete
 * @returns Success status
 */
export async function deleteForm(formId: string): Promise<{ success: boolean }> {
  const supabase = createClient();

  // First, get all blocks associated with this form
  const { data: blocks, error: blocksError } = await supabase
    .from('form_blocks')
    .select('id')
    .eq('form_id', formId);

  if (blocksError) {
    console.error('Error fetching form blocks:', blocksError);
    throw blocksError;
  }

  // Delete each block and its associated data
  if (blocks && blocks.length > 0) {
    for (const block of blocks) {
      await deleteFormBlock(block.id);
    }
  }

  // Delete form metrics
  const { error: metricsError } = await supabase
    .from('form_metrics')
    .delete()
    .eq('form_id', formId);

  if (metricsError) {
    console.error('Error deleting form metrics:', metricsError);
    throw metricsError;
  }

  // Delete form views
  const { error: viewsError } = await supabase
    .from('form_views')
    .delete()
    .eq('form_id', formId);

  if (viewsError) {
    console.error('Error deleting form views:', viewsError);
    throw viewsError;
  }

  // Delete form interactions
  const { error: interactionsError } = await supabase
    .from('form_interactions')
    .delete()
    .eq('form_id', formId);

  if (interactionsError) {
    console.error('Error deleting form interactions:', interactionsError);
    throw interactionsError;
  }

  // Delete form responses
  const { error: responsesError } = await supabase
    .from('form_responses')
    .delete()
    .eq('form_id', formId);

  if (responsesError) {
    console.error('Error deleting form responses:', responsesError);
    throw responsesError;
  }
    
  // NOTE: We no longer need to manually delete form_versions or form_block_versions
  // because we've added ON DELETE CASCADE to the foreign key constraints.
  // When we delete a form, all its versions and block versions will be automatically deleted.
  
  // Finally delete the form itself
  const { error: deleteError } = await supabase
    .from('forms')
    .delete()
    .eq('form_id', formId);

  if (deleteError) {
    console.error('Error deleting form:', deleteError);
    throw deleteError;
  }

  return { success: true };
}

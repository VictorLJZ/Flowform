import { createClient } from '@/lib/supabase/client';

/**
 * Delete a form block and its associated data
 * 
 * @param blockId - The ID of the block to delete
 * @returns Success status
 */
export async function deleteFormBlock(blockId: string): Promise<{ success: boolean }> {
  const supabase = createClient();

  // First, fetch the block to check its type
  const { data: block, error: fetchError } = await supabase
    .from('form_blocks')
    .select('*')
    .eq('id', blockId)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      // Block not found, return success
      return { success: true };
    }
    console.error('Error fetching form block:', fetchError);
    throw fetchError;
  }

  // Begin a transaction to ensure we delete everything properly
  // Delete associated data depending on block type
  if (block.type === 'dynamic') {
    // Delete dynamic block configurations
    const { error: configError } = await supabase
      .from('dynamic_block_configs')
      .delete()
      .eq('block_id', blockId);

    if (configError) {
      console.error('Error deleting dynamic block configuration:', configError);
      throw configError;
    }

    // Delete dynamic block responses
    const { error: responseError } = await supabase
      .from('dynamic_block_responses')
      .delete()
      .eq('block_id', blockId);

    if (responseError) {
      console.error('Error deleting dynamic block responses:', responseError);
      throw responseError;
    }
  } else if (block.type === 'static') {
    // Delete static block answers
    const { error: answerError } = await supabase
      .from('static_block_answers')
      .delete()
      .eq('block_id', blockId);

    if (answerError) {
      console.error('Error deleting static block answers:', answerError);
      throw answerError;
    }

    // Delete block options if they exist
    const { error: optionsError } = await supabase
      .from('block_options')
      .delete()
      .eq('block_id', blockId);

    if (optionsError) {
      console.error('Error deleting block options:', optionsError);
      throw optionsError;
    }
  }

  // Delete block metrics
  const { error: metricsError } = await supabase
    .from('block_metrics')
    .delete()
    .eq('block_id', blockId);

  if (metricsError) {
    console.error('Error deleting block metrics:', metricsError);
    throw metricsError;
  }

  // Finally, delete the block itself
  const { error: deleteError } = await supabase
    .from('form_blocks')
    .delete()
    .eq('id', blockId);

  if (deleteError) {
    console.error('Error deleting form block:', deleteError);
    throw deleteError;
  }

  return { success: true };
}

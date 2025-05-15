import { createClient } from '@/lib/supabase/client';
import { DbDynamicBlockConfig } from '@/types/block/DbBlock';
import { FormBlockUpdateInput, FormBlockCreationResult } from '@/types/form-service-types';
import { UiBlock } from '@/types/block';
// Using string for BlockType since we don't have a centralized type
import { invalidateFormCache } from './invalidateCache';
import { checkFormResponses } from './checkFormResponses';
import { createFormVersion } from './createFormVersion';


/**
 * Update an existing form block
 * 
 * @param blockId - The ID of the block to update
 * @param blockData - The block data to update
 * @param dynamicConfig - Optional dynamic block configuration updates
 * @returns The updated block with dynamic config if applicable
 */
export async function updateFormBlock(
  blockId: string,
  blockData: Omit<FormBlockUpdateInput, 'id'>,
  dynamicConfig?: DbDynamicBlockConfig | null
): Promise<FormBlockCreationResult> {
  const supabase = createClient();

  // First, fetch the current block to check its type
  const { data: existingBlock, error: fetchError } = await supabase
    .from('form_blocks')
    .select('*')
    .eq('id', blockId)
    .single();

  if (fetchError) {
    console.error('Error fetching form block:', fetchError);
    throw fetchError;
  }
  
  const formId = existingBlock.form_id;
  
  // Check if the form has responses - if so, we need to create a version before updating
  const hasResponses = await checkFormResponses(formId);
  
  if (hasResponses) {
    // Get all blocks for this form to create a complete version
    const { data: blocks, error: blocksError } = await supabase
      .from('form_blocks')
      .select('*')
      .eq('form_id', formId) as { 
        data: Array<{
          id: string;
          type: string;
          title?: string;
          description?: string | null;
          required?: boolean;
          order_index?: number;
          settings?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
          [key: string]: unknown;
        }> | null; 
        error: Error | null 
      };
      
    if (blocksError) {
      console.error('Error fetching all form blocks:', blocksError);
      throw blocksError;
    }
    
    // Map database blocks to frontend format for versioning
    const frontendBlocks = (blocks || []).map(block => ({
      id: block.id,
      formId: formId,
      blockTypeId: `${block.type}_${(block as { subtype?: string }).subtype || 'default'}`,
      type: (block.type === 'dynamic' ? 'dynamic' : 'static') as string,
      title: block.title || '',
      description: block.description || '',
      required: block.required || false,
      orderIndex: block.order_index || 0,
      settings: block.settings || {},
      subtype: (block as { subtype?: string }).subtype || 'default',
      createdAt: block.created_at || new Date().toISOString(),
      updatedAt: block.updated_at || new Date().toISOString()
    } as UiBlock));
    
    // Get user ID for versioning
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (userId) {
      // Create a version before making changes
      const version = await createFormVersion(formId, userId, frontendBlocks);
      console.log(`Created form version ${version?.version_number} before updating block`);
    }
  }

  // Now update the form block
  const { data: updatedBlock, error: updateError } = await supabase
    .from('form_blocks')
    .update({
      ...blockData,
      updated_at: new Date().toISOString()
    })
    .eq('id', blockId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating form block:', updateError);
    throw updateError;
  }

  // If this is a dynamic block and we have config updates, apply them
  if (existingBlock.type === 'dynamic' && dynamicConfig) {
    // Instead of updating a separate config table, we'll update the settings in the form_blocks table
    // Convert dynamic config to settings property 
    const updatedSettings = {
      ...updatedBlock.settings,
      temperature: dynamicConfig.temperature || 0.7,
      maxQuestions: dynamicConfig.max_questions || 5,
      contextInstructions: dynamicConfig.ai_instructions || ''
    };
    
    // Update the block with these settings
    const { data: blockWithSettings, error: settingsError } = await supabase
      .from('form_blocks')
      .update({ settings: updatedSettings })
      .eq('id', blockId)
      .select()
      .single();
      
    if (settingsError) {
      console.error('Error updating block settings:', settingsError);
      throw settingsError;
    }
    
    // Return the updated block with settings
    return blockWithSettings;
  }

  // If it's a dynamic block, no need to fetch config - it's in the settings
  if (existingBlock.type === 'dynamic') {
    return updatedBlock;
  }

  // Invalidate form cache after successful update
  invalidateFormCache(updatedBlock.form_id);

  return updatedBlock;
}

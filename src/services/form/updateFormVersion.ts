import { createClient } from '@/lib/supabase/client';
import { mapToDbBlockType } from '@/utils/blockTypeMapping';
import type { UiBlock as FrontendUiBlock } from '@/types/block';
import type { FormBlockVersion } from '@/types/form-version-types';

/**
 * Update an existing form version's blocks to match the current form state
 * Used when republishing a form that has no responses (so no new version is created)
 * 
 * @param versionId The ID of the form version to update
 * @param blocks The current blocks in the form
 * @returns Whether the update was successful
 */
export async function updateFormVersion(
  versionId: string,
  blocks: FrontendUiBlock[]
): Promise<boolean> {
  const supabase = createClient();
  
  try {
    // First, delete all existing block versions for this version
    const { error: deleteError } = await supabase
      .from('form_block_versions')
      .delete()
      .eq('form_version_id', versionId);
      
    if (deleteError) {
      console.error('Error deleting existing block versions:', deleteError);
      return false;
    }
    
    // Then create new block versions for all current blocks
    const blockVersions: Partial<FormBlockVersion>[] = blocks.map(block => {
      const { type, subtype } = mapToDbBlockType(block.subtype);
      return {
        block_id: block.id,
        form_version_id: versionId,
        title: block.title || '',
        description: block.description || null,
        type,
        subtype,
        required: !!block.required,
        order_index: block.orderIndex || 0,
        settings: block.settings || {},
        is_deleted: false
      };
    });
    
    // Insert the new block versions
    if (blockVersions.length > 0) {
      const { error: insertError } = await supabase
        .from('form_block_versions')
        .insert(blockVersions);
        
      if (insertError) {
        console.error('Error creating updated block versions:', insertError);
        return false;
      }
    }
    
    // No need to update timestamps as they're handled automatically by Supabase RLS
    // Just log the success since the block versions were updated successfully
    
    console.log(`Successfully updated form version ${versionId} with ${blocks.length} blocks`);
    return true;
  } catch (error) {
    console.error('Error in updateFormVersion:', error);
    return false;
  }
}

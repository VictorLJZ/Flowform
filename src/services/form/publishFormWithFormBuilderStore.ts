import { createClient } from '@/lib/supabase/client';
import { FormVersion } from '@/types/form-version-types';
import { Form } from '@/types/supabase-types';
import { invalidateFormCacheClient } from './invalidateCacheClient';
import { createFormVersion } from './createFormVersion';
import { updateFormVersion } from './updateFormVersion';
import { getFormWithBlocksClient } from './getFormWithBlocksClient';
import { mapFromDbBlockType } from '@/utils/blockTypeMapping';
import type { FormBlock, BlockType } from '@/types/block-types';

/**
 * Publish a form with proper versioning using blocks from the form builder store
 * - Creates version 1 on first publish
 * - Creates a new version when republishing if the form has responses
 * - Updates form status to published and sets published_at timestamp
 * 
 * @param formId The ID of the form to publish
 * @param blocks Current blocks from the form builder store
 * @returns Object containing updated form and version information
 */
export async function publishFormWithFormBuilderStore(
  formId: string,
  blocks: FormBlock[]
): Promise<{ form: Form; version?: FormVersion | null }> {
  const supabase = createClient();

  try {
    // Step 1: Get the current form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*, created_by')
      .eq('form_id', formId)
      .single();

    if (formError) {
      console.error('Error fetching form for publishing:', formError);
      throw formError;
    }
    
    // SAFEGUARD: If blocks array is empty, retrieve the blocks from the database
    // This prevents blocks from being incorrectly marked as deleted due to empty array
    let blocksToUse = blocks;
    if (!blocks || blocks.length === 0) {
      console.warn('Empty blocks array provided to publishFormWithFormBuilderStore. Retrieving blocks from database to prevent data loss.');
      
      const formWithBlocks = await getFormWithBlocksClient(formId);
      if (formWithBlocks && formWithBlocks.blocks && formWithBlocks.blocks.length > 0) {
        // Convert database blocks to the format expected by createFormVersion/updateFormVersion
        blocksToUse = formWithBlocks.blocks.map(dbBlock => {
          const blockTypeId = mapFromDbBlockType(dbBlock.type || 'static', dbBlock.subtype || 'short_text');
          const blockType: BlockType = dbBlock.type === 'dynamic' ? 'dynamic' : 
                                       dbBlock.type === 'integration' ? 'integration' : 
                                       dbBlock.type === 'layout' ? 'layout' : 'static';
          
          return {
            id: dbBlock.id,
            blockTypeId: blockTypeId,
            type: blockType,
            title: dbBlock.title || '',
            description: dbBlock.description || '',
            required: !!dbBlock.required,
            order: dbBlock.order_index || 0,
            settings: dbBlock.settings || {}
          };
        });
        console.log(`Retrieved ${blocksToUse.length} blocks from database for publishing.`);
      } else {
        console.error('Failed to retrieve blocks from database. Cannot proceed with publishing.');
        throw new Error('No blocks found for this form. Cannot publish an empty form.');
      }
    }

    // Step 2: Check if the form already has versions
    const { data: existingVersions, error: versionError } = await supabase
      .from('form_versions')
      .select('*')
      .eq('form_id', formId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (versionError) {
      console.error('Error checking for existing versions:', versionError);
      throw versionError;
    }

    let version: FormVersion | null | undefined;
    const isFirstPublish = !existingVersions || existingVersions.length === 0;
    
    // Step 3: Check if the CURRENT VERSION has responses (only matters for republishing)
    let currentVersionHasResponses = false;
    if (!isFirstPublish && existingVersions.length > 0) {
      // Get the current version number
      const currentVersionNumber = existingVersions[0].version_number;
      
      // Check if there are any responses for this specific version
      const { count, error: responseError } = await supabase
        .from('form_responses')
        .select('id', { count: 'exact', head: true })
        .eq('form_id', formId)
        .eq('form_version_id', existingVersions[0].id);
  
      if (responseError) {
        console.error('Error checking for form responses:', responseError);
        throw responseError;
      }
      
      currentVersionHasResponses = (count ?? 0) > 0;
      
      console.log(`Version ${currentVersionNumber} has ${count ?? 0} responses`);
    }
    
    // Step 4: Version handling based on publish scenario
    if (isFirstPublish) {
      // Case 1: First publish - create version 1
      const newVersion = await createFormVersion(
        formId,
        form.created_by,
        blocksToUse
      );
      
      // Assign to outer variable and log if successful
      version = newVersion;
      
      if (newVersion) {
        console.log(`Created initial form version ${newVersion.version_number} during first publish`);
      } else {
        console.warn('Initial form version creation returned null');
      }
    } else if (currentVersionHasResponses) {
      // Case 2: Republish with responses - create a new incremental version
      const newVersion = await createFormVersion(
        formId,
        form.created_by,
        blocksToUse
      );
      
      // Assign to outer variable and log if successful
      version = newVersion;
      
      if (newVersion) {
        console.log(`Created incremental form version ${newVersion.version_number} (previous version had responses)`);
      } else {
        console.warn('Incremental form version creation returned null');
      }
    } else {
      // Case 3: Republish without responses - update the existing version
      // Get the most recent version ID
      const currentVersionId = existingVersions[0].id;
      
      // Update the existing version with the current blocks
      const updateSuccess = await updateFormVersion(currentVersionId, blocks);
      
      if (updateSuccess) {
        // Set the version for the return value
        version = existingVersions[0];
        console.log(`Updated existing version ${existingVersions[0].version_number} with latest blocks (no responses yet)`);
      } else {
        console.warn('Failed to update existing version');
      }
    }
    
    // Step 5: Update the form to published status with timestamp
    const updateData = {
      status: 'published',
      published_at: form.published_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: updatedForm, error: updateError } = await supabase
      .from('forms')
      .update(updateData)
      .eq('form_id', formId)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating form publication status:', updateError);
      throw updateError;
    }
    
    // Invalidate form cache after successful update
    invalidateFormCacheClient(formId);
    
    return {
      form: updatedForm,
      version
    };
  } catch (error) {
    console.error('Failed to publish form with form builder store blocks:', error);
    throw error;
  }
}

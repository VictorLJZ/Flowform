import { createClient } from '@/lib/supabase/client';
import { SaveFormInput, SaveFormOutput } from '@/types/form-service-types';
import type { FormBlock as FrontendFormBlock } from '@/types/block-types';
import { mapToDbBlockType } from '@/utils/blockTypeMapping';
import { v4 as uuidv4 } from 'uuid';
import { DbForm, ApiForm } from '@/types/form';
import { dbToApiForm } from '@/utils/type-utils';
import { mutate } from 'swr';
import { useWorkspaceStore } from '@/stores/workspaceStore';

/**
 * Save a complete form with all its blocks
 * Handles creating a new form or updating an existing one
 * Synchronizes blocks by adding new ones, updating changed ones, and removing deleted ones
 * 
 * @param formData Form data to save
 * @param blocks Form blocks to save
 * @returns Object containing saved form, blocks, and success status
 */
export async function saveFormWithBlocks(
  formData: SaveFormInput, 
  blocks: FrontendFormBlock[]
): Promise<SaveFormOutput> {
  const supabase = createClient();
  
  try {
    // Extract and ensure critical fields with proper types
    const {
      form_id,
      title = 'Untitled Form',
      description = '',
      workspace_id,
      created_by,
      status = 'draft',
      settings,
      theme
    } = formData;
    
    // Create or update form based on whether form_id exists
    const isNewForm = !form_id;
    let formId: string | undefined = form_id;
    
    // Step 1: Create or update the form
    if (isNewForm) {
      // Create a new form
      const newFormId = uuidv4();
      const { error } = await supabase
        .from('forms')
        .insert({
          form_id: newFormId,
          title,
          description,
          workspace_id,
          created_by,
          status,
          settings,
          theme
        })
        .select('*')
        .single();
        
      if (error) {
        console.error('Error creating form:', error);
        throw new Error(error.message);
      }
      
      // Set the form_id for block creation
      formId = newFormId;
    } else {
      // Update existing form
      const { error } = await supabase
        .from('forms')
        .update({
          title,
          description,
          workspace_id,
          status,
          settings,
          theme,
          updated_at: new Date().toISOString()
        })
        .eq('form_id', formId);
        
      if (error) {
        console.error('Error updating form:', error);
        throw new Error(error.message);
      }
    }
    
    // Step 2: Handle form blocks
    // Get existing blocks from the database
    const { data: existingBlocks, error: getBlocksError } = await supabase
      .from('form_blocks')
      .select('id')
      .eq('form_id', formId);
      
    if (getBlocksError) {
      console.error('Error fetching existing blocks:', getBlocksError);
      throw new Error(getBlocksError.message);
    }
    
    const existingBlockIds = existingBlocks
      ? existingBlocks.map(block => block.id)
      : [];
      
    // Determine blocks to keep, blocks to delete, and blocks to create
    const clientBlockIds = blocks.map(block => block.id);
    const blocksToDelete = existingBlockIds.filter(id => !clientBlockIds.includes(id));
    
    // Delete blocks that don't exist in the client anymore
    if (blocksToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('form_blocks')
        .delete()
        .in('id', blocksToDelete);
        
      if (deleteError) {
        console.error('Error deleting blocks:', deleteError);
        throw new Error(deleteError.message);
      }
    }
    
    // Upsert blocks 
    const blocksToUpsert = blocks.map((block, index) => {
      const { type, subtype } = mapToDbBlockType(block.blockTypeId);
      return {
        id: block.id, // Now properly UUID format from the frontend
        form_id: formId,
        type,
        subtype,
        title: block.title || '',
        description: block.description || null,
        required: !!block.required,
        order_index: index,
        settings: block.settings || {}
      };
    });
    
    // Save all blocks at once with upsert
    const { data: savedBlocks, error: upsertError } = await supabase
      .from('form_blocks')
      .upsert(blocksToUpsert)
      .select('*');
      
    if (upsertError) {
      console.error('Error upserting blocks:', upsertError);
      throw new Error(upsertError.message);
    }
    
    // Get the updated form data
    const { data: updatedForm, error: getFormError } = await supabase
      .from('forms')
      .select('*')
      .eq('form_id', formId)
      .single();
      
    if (getFormError) {
      console.error('Error fetching updated form:', getFormError);
      throw new Error(getFormError.message);
    }
    
    // --- BEGINNING OF MODIFIED CODE FOR OPTIMISTIC UPDATE ---
    const currentWorkspaceId = useWorkspaceStore.getState().currentWorkspaceId;
    if (currentWorkspaceId) {
      const swrKey = ['recent-forms', currentWorkspaceId];
      
      // Convert DB form to API form
      const apiUpdatedForm = dbToApiForm(updatedForm as DbForm);
      
      // Optimistically update the recent forms list
      mutate(
        swrKey,
        (currentData: ApiForm[] | undefined): ApiForm[] => {
          let newData: ApiForm[];
          if (currentData) {
            // Check if the updated form is already in the list
            const existingFormIndex = currentData.findIndex(form => form.formId === apiUpdatedForm.formId);
            if (existingFormIndex !== -1) {
              // Replace existing form
              newData = [...currentData];
              newData[existingFormIndex] = apiUpdatedForm;
            } else {
              // Add new form to the beginning
              newData = [apiUpdatedForm, ...currentData];
            }
          } else {
            // If no current data, start with the updated form
            newData = [apiUpdatedForm];
          }
          // Sort by updatedAt (descending) and limit to 5 (consistent with useRecentForms)
          return newData
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);
        },
        { revalidate: true } // Revalidate in the background to ensure consistency
      );
      console.log(`[saveFormWithBlocks] Optimistically mutated 'recent-forms' for workspace: ${currentWorkspaceId}`);
    } else {
      console.warn('[saveFormWithBlocks] Could not mutate recent-forms: No currentWorkspaceId found.');
    }
    // --- END OF MODIFIED CODE FOR OPTIMISTIC UPDATE ---

    // Convert DB form to API form for return value
    const apiForm = dbToApiForm(updatedForm as DbForm);
    
    return {
      success: true,
      form: apiForm,
      blocks: savedBlocks || []
    };
  } catch (error) {
    console.error('Error in saveFormWithBlocks:', error);
    throw error;
  }
}

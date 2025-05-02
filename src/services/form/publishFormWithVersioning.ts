import { createClient } from '@/lib/supabase/client';
import { FormVersion } from '@/types/form-version-types';
import { Form } from '@/types/supabase-types';
import { invalidateFormCacheClient } from './invalidateCacheClient';
import { createFormVersion } from './createFormVersion';

/**
 * Publish a form with proper versioning
 * - Creates version 1 on first publish
 * - Creates a new version when republishing if the form has responses
 * - Updates form status to published and sets published_at timestamp
 * 
 * @param formId The ID of the form to publish
 * @returns Object containing updated form and version information
 */
export async function publishFormWithVersioning(
  formId: string
): Promise<{ form: Form; version?: FormVersion | null }> {
  const supabase = createClient();

  try {
    // Step 1: Get the current form with its blocks
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*, created_by')
      .eq('form_id', formId)
      .single();

    if (formError) {
      console.error('Error fetching form for publishing:', formError);
      throw formError;
    }

    // Step 2: Get the form blocks to create the version
    const { data: blocks, error: blocksError } = await supabase
      .from('form_blocks')
      .select('*')
      .eq('form_id', formId);

    if (blocksError) {
      console.error('Error fetching form blocks for publishing:', blocksError);
      throw blocksError;
    }

    // Step 3: Check if the form already has versions
    const { data: existingVersions, error: versionError } = await supabase
      .from('form_versions')
      .select('id, version_number')
      .eq('form_id', formId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (versionError) {
      console.error('Error checking for existing versions:', versionError);
      throw versionError;
    }

    let version: FormVersion | null | undefined;
    const isFirstPublish = existingVersions?.length === 0;
    
    // Step 4: Check if the form has responses (only matters for republishing)
    let hasResponses = false;
    if (!isFirstPublish) {
      const { count, error: responseError } = await supabase
        .from('form_responses')
        .select('id', { count: 'exact', head: true })
        .eq('form_id', formId);
  
      if (responseError) {
        console.error('Error checking for form responses:', responseError);
        throw responseError;
      }
      
      hasResponses = (count ?? 0) > 0;
    }
    
    // Step 5: Create a version if:
    // - It's the first publish (version 1)
    // - Or it's a republish AND the form has responses
    if (isFirstPublish || hasResponses) {
      const newVersion = await createFormVersion(
        formId,
        form.created_by,
        blocks.map(b => ({
          id: b.id,
          blockTypeId: b.type === 'dynamic' ? 'ai_conversation' : b.subtype,
          type: b.type,
          title: b.title || '',
          description: b.description || '',
          required: b.required,
          order: b.order_index,
          settings: b.settings || {}
        }))
      );
      
      // Assign to outer variable and log if successful
      version = newVersion;
      
      if (newVersion) {
        console.log(`Created form version ${newVersion.version_number} during publish`);
      } else {
        console.warn('Form version creation returned null');
      }
    }
    
    // Step 6: Update the form to published status with timestamp
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
    console.error('Failed to publish form with versioning:', error);
    throw error;
  }
}

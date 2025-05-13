import { createClient } from '@/lib/supabase/client';
import { DbForm, ApiForm } from '@/types/form';
import { FormUpdateInput } from '@/types/form-service-types';
import { invalidateFormCacheClient } from './invalidateCacheClient';
import { dbToApiForm } from '@/utils/type-utils';
import { apiToDbFormStatus } from '@/utils/type-utils';

/**
 * Update an existing form
 * 
 * @param formId - The ID of the form to update
 * @param formData - The form data to update
 * @returns The updated form in API format
 */
export async function updateForm(formId: string, formData: FormUpdateInput): Promise<ApiForm> {
  const supabase = createClient();

  // Add updated_at timestamp
  const updateData: Partial<DbForm> = {
    updated_at: new Date().toISOString()
  };

  // Convert input fields to DB format (snake_case)
  if (formData.title !== undefined) updateData.title = formData.title;
  if (formData.description !== undefined) updateData.description = formData.description === undefined ? null : formData.description;
  if (formData.status !== undefined) updateData.status = apiToDbFormStatus(formData.status);
  if (formData.theme !== undefined) updateData.theme = formData.theme === undefined ? null : formData.theme;
  if (formData.settings !== undefined) updateData.settings = formData.settings === undefined ? null : formData.settings;
  if (formData.published_at !== undefined) updateData.published_at = formData.published_at === undefined ? null : formData.published_at;

  // Handle form publication if status is changed to published
  if (formData.status === 'published' && !formData.published_at) {
    updateData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('forms')
    .update(updateData)
    .eq('form_id', formId)
    .select()
    .single();

  if (error) {
    console.error('Error updating form:', error);
    throw error;
  }

  // Invalidate form cache after successful update
  invalidateFormCacheClient(formId);

  // Transform DB result to API format before returning
  return dbToApiForm(data as DbForm);
}

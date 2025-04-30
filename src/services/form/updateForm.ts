import { createClient } from '@/lib/supabase/client';
import { Form } from '@/types/supabase-types';
import { FormUpdateInput } from '@/types/form-service-types';
import { invalidateFormCacheClient } from './invalidateCacheClient';

/**
 * Update an existing form
 * 
 * @param formId - The ID of the form to update
 * @param formData - The form data to update
 * @returns The updated form
 */
export async function updateForm(formId: string, formData: FormUpdateInput): Promise<Form> {
  const supabase = createClient();

  // Add updated_at timestamp
  const updateData = {
    ...formData,
    updated_at: new Date().toISOString()
  };

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

  return data;
}

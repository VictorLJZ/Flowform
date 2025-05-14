import { createClient } from '@/lib/supabase/client';
import { DbForm, ApiForm } from '@/types/block';
import { FormInput } from '@/types/form-service-types';
import { dbToApiForm } from '@/utils/type-utils';

/**
 * Create a new form in a workspace
 * 
 * @param formData - The form data to create
 * @returns The newly created form in API format
 */
export async function createForm(formData: FormInput): Promise<ApiForm> {
  const supabase = createClient();

  // Note: Using the same FormInput interface but internally we know
  // it maps to our DB layer types because the field names match
  const { data, error } = await supabase
    .from('forms')
    .insert({
      workspace_id: formData.workspace_id,
      title: formData.title,
      description: formData.description || null,
      status: formData.status || 'draft',
      created_by: formData.created_by,
      theme: formData.theme || null,
      settings: formData.settings || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating form:', error);
    throw error;
  }

  // Transform DB result to API format before returning
  return dbToApiForm(data as DbForm);
}

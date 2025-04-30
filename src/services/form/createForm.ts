import { createClient } from '@/lib/supabase/client';
import { Form } from '@/types/supabase-types';
import { FormInput } from '@/types/form-service-types';

/**
 * Create a new form in a workspace
 * 
 * @param formData - The form data to create
 * @returns The newly created form
 */
export async function createForm(formData: FormInput): Promise<Form> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('forms')
    .insert({
      workspace_id: formData.workspace_id,
      title: formData.title,
      description: formData.description,
      status: formData.status || 'draft',
      created_by: formData.created_by,
      theme: formData.theme || {},
      settings: formData.settings || {},
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating form:', error);
    throw error;
  }

  return data;
}

import { createClient } from '@/lib/supabase/client';

/**
 * Check if a form has any responses
 * @param formId The ID of the form to check
 * @returns true if form has responses, false otherwise
 */
export async function checkFormResponses(formId: string): Promise<boolean> {
  if (!formId) return false;
  
  const supabase = createClient();
  const { count, error } = await supabase
    .from('form_responses')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', formId);
    
  if (error) {
    console.error('Error checking for form responses:', error);
    return false;
  }
  
  return (count || 0) > 0;
}

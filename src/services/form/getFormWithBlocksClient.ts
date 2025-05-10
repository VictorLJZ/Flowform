import { CompleteForm } from '@/types/supabase-types';

/**
 * Client-side version of getFormWithBlocks
 * Fetches form data via API route and returns the complete form
 */
export async function getFormWithBlocksClient(
  formId: string
): Promise<CompleteForm | null> {
  const res = await fetch(`/api/forms/${formId}`, { credentials: 'include' });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error || `API error: ${res.status}`);
  }
  const data = await res.json();

  if (!res.ok || !data.form) {
    throw new Error('Failed to fetch form data');
  }
  return data.form as CompleteForm;
}

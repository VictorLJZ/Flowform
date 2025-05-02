import { CompleteForm } from '@/types/supabase-types';

/**
 * Client-side version of getLatestFormVersionWithBlocks
 * Fetches the latest version of a form via API route
 */
export async function getLatestFormVersionWithBlocksClient(
  formId: string
): Promise<CompleteForm | null> {
  const res = await fetch(`/api/forms/${formId}/latest`, { credentials: 'include' });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error || `API error: ${res.status}`);
  }
  const data = await res.json();
  return data.form as CompleteForm;
}

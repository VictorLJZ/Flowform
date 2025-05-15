import { CompleteForm } from '@/types/form';

/**
 * Client-side version of getVersionedFormWithBlocks
 * Fetches the latest published version of a form via API route
 * 
 * @param formId - The ID of the form to retrieve
 * @returns The complete versioned form with blocks or null if not found
 */
export async function getVersionedFormWithBlocksClient(
  formId: string
): Promise<CompleteForm | null> {
  const res = await fetch(`/api/forms/${formId}/versioned`, { credentials: 'include' });
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

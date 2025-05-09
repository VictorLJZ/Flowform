import { CompleteForm, WorkflowEdge } from '@/types/supabase-types';

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

  // === ADDED LOGGING START ===
  if (data.form && data.form.workflow_edges && data.form.workflow_edges.length > 0) {
    console.log(`🔎 [getFormWithBlocksClient] Received workflow_edges from API for form ${formId}:`);
    data.form.workflow_edges.forEach((edge: WorkflowEdge) => {
      console.log(`  Edge ID: ${edge.id}, default_target_id: ${edge.default_target_id}, type: ${typeof edge.default_target_id}, property_exists: ${Object.prototype.hasOwnProperty.call(edge, 'default_target_id')}`);
    });
  } else {
    console.log(`🔎 [getFormWithBlocksClient] No workflow_edges in API response for form ${formId}, or data.form is undefined.`);
  }
  // === ADDED LOGGING END ===

  if (!res.ok || !data.form) {
    throw new Error('Failed to fetch form data');
  }
  return data.form as CompleteForm;
}

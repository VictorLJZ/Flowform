import { createClient } from '@/lib/supabase/client';
import { FormView } from '@/types/supabase-types';

/**
 * Track a form view event
 * 
 * @param formId - The ID of the form being viewed
 * @param metadata - Optional metadata about the view (device, referrer, etc.)
 * @returns The created form view record
 */
export async function trackFormView(
  formId: string,
  metadata: Record<string, unknown> = {}
): Promise<FormView> {
  const supabase = createClient();

  // Enrich metadata with browser information when available
  const enrichedMetadata = {
    ...metadata,
    timestamp: new Date().toISOString(),
    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
    referrer: typeof document !== 'undefined' ? document.referrer : null,
    screen_size: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : null,
  };

  // Create a new form view record
  const { data, error } = await supabase
    .from('form_views')
    .insert({
      form_id: formId,
      metadata: enrichedMetadata
    })
    .select()
    .single();

  if (error) {
    console.error('Error tracking form view:', error);
    throw error;
  }

  return data;
}

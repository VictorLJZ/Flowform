import { DbForm, ApiForm, UiForm } from '@/types/block';
import { createClient } from '@/lib/supabase/client';
import { useWorkspaceSWR, createWorkspaceFetcher } from './swr';
import { dbToApiForm } from '@/utils/type-utils';
import { apiToUiForm } from '@/utils/type-utils';

/**
 * Fetches all forms for a given workspace.
 * Automatically refreshes when the workspace ID changes.
 * Implements the new type system with proper layer separation.
 * 
 * @param workspaceId Optional workspace ID to override the current workspace
 * @returns UI-formatted forms data, loading state, error, and mutate function
 */
export function useForms(workspaceId?: string | null) {
  // Create a workspace-aware fetcher that handles workspace ID automatically
  const formsFetcher = createWorkspaceFetcher<ApiForm[]>(async (wsId: string) => {
    console.log(`[useForms] Fetching forms for workspace: ${wsId}`);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('workspace_id', wsId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(`[useForms] Error fetching forms for workspace ${wsId}:`, error);
      throw error;
    }
    
    console.log(`[useForms] Fetched ${data?.length || 0} forms for workspace ${wsId}`);
    
    // Transform DB data to API format
    const dbForms = (data || []) as DbForm[];
    return dbForms.map(dbForm => dbToApiForm(dbForm));
  });

  // Use our workspace-aware SWR hook with the API type
  const { data, error, isLoading, mutate } = useWorkspaceSWR<ApiForm[]>(
    'forms',
    formsFetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 5000, // Deduplicate requests within 5 seconds
    },
    workspaceId // Pass the explicit workspaceId if provided
  );

  // Transform API forms to UI forms for component consumption
  const uiForms: UiForm[] = data ? data.map(form => apiToUiForm(form)) : [];

  return { 
    forms: uiForms, 
    error, 
    isLoading, 
    mutate 
  };
}

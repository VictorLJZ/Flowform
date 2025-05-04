import { Form } from '@/types/supabase-types';
import { createClient } from '@/lib/supabase/client';
import { useWorkspaceSWR, createWorkspaceFetcher } from './swr';

/**
 * Fetches all forms for a given workspace.
 * Automatically refreshes when the workspace ID changes.
 * 
 * @param workspaceId Optional workspace ID to override the current workspace
 * @returns Forms data, loading state, error, and mutate function
 */
export function useForms(workspaceId?: string | null) {
  // Create a workspace-aware fetcher that handles workspace ID automatically
  const formsFetcher = createWorkspaceFetcher(async (wsId: string) => {
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
    return data || [];
  });

  // Use our new workspace-aware SWR hook
  const { data, error, isLoading, mutate } = useWorkspaceSWR<Form[]>(
    'forms',
    formsFetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 5000, // Deduplicate requests within 5 seconds
    },
    workspaceId // Pass the explicit workspaceId if provided
  );

  return { 
    forms: data ?? [], 
    error, 
    isLoading, 
    mutate 
  };
}

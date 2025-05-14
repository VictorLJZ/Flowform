import { DbForm, ApiForm, UiForm } from '@/types/block';
import { createClient } from '@/lib/supabase/client';
import { useWorkspaceSWR, createWorkspaceFetcher } from './swr';
import { dbToApiForm } from '@/utils/type-utils';
import { apiToUiForm } from '@/utils/type-utils';

/**
 * Hook to fetch recent forms across all workspaces the user has access to.
 * Follows the workspace-aware pattern.
 * Implements the new type system with proper layer separation.
 * 
 * @param limit Maximum number of forms to return
 * @returns UI-formatted forms data, loading state, error, and mutate function
 */
export function useRecentForms(limit = 5) {
  // Create a workspace-aware fetcher that handles workspace ID automatically
  const recentFormsFetcher = createWorkspaceFetcher<ApiForm[]>(async (wsId: string) => {
    console.log(`[useRecentForms] Fetching recent forms for workspace: ${wsId}`);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('workspace_id', wsId)
      .order('updated_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error(`[useRecentForms] Error fetching forms for workspace ${wsId}:`, error);
      throw error;
    }
    
    console.log(`[useRecentForms] Fetched ${data?.length || 0} forms for workspace ${wsId}`);
    
    // Transform DB data to API format
    const dbForms = (data || []) as DbForm[];
    return dbForms.map(dbForm => dbToApiForm(dbForm));
  });

  // Use our workspace-aware SWR hook with the API type
  const { data, error, isLoading, mutate } = useWorkspaceSWR<ApiForm[]>(
    'recent-forms',
    recentFormsFetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 5000, // Deduplicate requests within 5 seconds
    }
  );

  // Transform API forms to UI forms for component consumption
  const uiForms: UiForm[] = data ? data.map(form => apiToUiForm(form)) : [];

  return { 
    recentForms: uiForms.slice(0, limit), 
    error, 
    isLoading, 
    refresh: mutate 
  };
}

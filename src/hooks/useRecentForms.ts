import { Form } from '@/types/supabase-types';
import { createClient } from '@/lib/supabase/client';
import { useWorkspaceSWR, createWorkspaceFetcher } from './swr';

/**
 * Hook to fetch recent forms across all workspaces the user has access to.
 * Follows the workspace-aware pattern.
 * 
 * @param limit Maximum number of forms to return
 * @returns Forms data, loading state, error, and mutate function
 */
export function useRecentForms(limit = 5) {
  // Create a workspace-aware fetcher that handles workspace ID automatically
  const recentFormsFetcher = createWorkspaceFetcher(async (wsId: string) => {
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
    return data || [];
  });

  // Use our workspace-aware SWR hook
  const { data, error, isLoading, mutate } = useWorkspaceSWR<Form[]>(
    'recent-forms',
    recentFormsFetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 5000, // Deduplicate requests within 5 seconds
    }
  );

  return { 
    recentForms: data ? data.slice(0, limit) : [], 
    error, 
    isLoading, 
    refresh: mutate 
  };
}

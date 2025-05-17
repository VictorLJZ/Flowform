import { ApiForm, UiForm } from '@/types/form';
import { useWorkspaceSWR } from './swr';
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
  // Use the workspace-aware SWR hook directly
  const { data, error, isLoading, mutate } = useWorkspaceSWR<ApiForm[]>(
    null, // Use default workspace from context
    `recent-forms?limit=${limit}`,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 5000, // Deduplicate requests within 5 seconds
    }
  );
  
  // When data is fetched, it will go through our workspace-specific fetcher internally

  // Transform API forms to UI forms for component consumption
  const uiForms: UiForm[] = data ? data.map(form => apiToUiForm(form)) : [];

  return { 
    recentForms: uiForms.slice(0, limit), 
    error, 
    isLoading, 
    refresh: mutate 
  };
}

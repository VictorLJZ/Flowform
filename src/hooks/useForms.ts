import { ApiForm, UiForm } from '@/types/form';
import { useWorkspaceSWR } from './swr';
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
  // Use our workspace-aware SWR hook directly with the API type
  const { data, error, isLoading, mutate } = useWorkspaceSWR<ApiForm[]>(
    workspaceId,
    'forms',
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
    forms: uiForms, 
    error, 
    isLoading, 
    mutate 
  };
}

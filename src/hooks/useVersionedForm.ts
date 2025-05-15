import useSWR from 'swr';
import { getLatestFormVersionWithBlocksClient } from '@/services/form/getLatestFormVersionWithBlocksClient';
import { CompleteForm } from '@/types/form';
import { KeyedMutator } from 'swr';
// Note: We're using CompleteForm from supabase-types for complete form data including blocks
// For just the form entity itself, we use ApiForm and UiForm from the new type system

interface UseVersionedFormReturn {
  form: CompleteForm | null;
  isLoading: boolean;
  error: Error | null;
  mutate: KeyedMutator<CompleteForm | null>; // Using SWR's KeyedMutator type
}

/**
 * Hook to fetch the latest version of a form with all its blocks
 * This is used by the form viewer to always show the most recent version
 * 
 * Note: This hook uses standard SWR rather than workspace-aware SWR since
 * it fetches by form ID directly and the form data is already scoped to
 * a workspace at the database level.
 */
export function useVersionedForm(id?: string): UseVersionedFormReturn {
  // Create a cache key that includes the form ID
  const key = id ? ['versionedForm', id] : null;
  
  // Define the SWR fetcher function
  const fetcher = async ([, formId]: [string, string]): Promise<CompleteForm | null> => {
    console.log(`[useVersionedForm] Fetching latest version for form: ${formId}`);
    return await getLatestFormVersionWithBlocksClient(formId);
  };
  
  // Use SWR to fetch data
  const { data, error, isLoading, mutate } = useSWR<CompleteForm | null>(key, fetcher, {
    revalidateOnFocus: false, // Prevent unnecessary refetches on window focus
    dedupingInterval: 5000, // Cache results for 5 seconds
    onError: (err) => {
      console.error(`[useVersionedForm] Error fetching form ${id}:`, err);
    }
  });
  
  return { 
    form: data || null, // Ensure we don't return undefined, only CompleteForm or null
    isLoading, 
    error: error || null,
    mutate
  };
}

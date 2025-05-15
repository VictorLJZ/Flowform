import useSWR from 'swr'
import { getFormWithBlocksClient } from '@/services/form/getFormWithBlocksClient'
import { CompleteForm } from '@/types/form-types'
// Note: We're using CompleteForm from supabase-types for complete form data including blocks
// For just the form entity itself, we use ApiForm and UiForm from the new type system

/**
 * Fetch a single form with its blocks by ID.
 * 
 * Note: This hook doesn't need to use the workspace-aware SWR utilities
 * since forms are already scoped to a workspace at the database level,
 * and we're fetching by form ID directly.
 */
export function useForm(formId?: string) {
  // Only fetch if formId is available
  const key = formId ? ['form', formId] : null
  
  const fetcher = async ([, id]: [string, string]): Promise<CompleteForm | null> => {
    return await getFormWithBlocksClient(id)
  }
  
  const { data, error, isLoading, mutate } = useSWR<CompleteForm | null>(key, fetcher, {
    revalidateOnFocus: true,
    // Handle errors consistently
    onError: (err) => {
      console.error(`[useForm] Error fetching form ${formId}:`, err)
    }
  })
  
  return { form: data ?? null, error, isLoading, mutate }
}

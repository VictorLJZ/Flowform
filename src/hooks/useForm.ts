import useSWR from 'swr'
import { getFormWithBlocksClient } from '@/services/form/getFormWithBlocksClient'

/**
 * Fetch a single form with its blocks by ID.
 */
export function useForm(formId?: string) {
  const key = formId ? ['form', formId] : null
  const fetcher = async ([, id]: [string, string]) => {
    return await getFormWithBlocksClient(id)
  }
  const { data, error, isLoading, mutate } = useSWR(key, fetcher)
  return { form: data ?? null, error, isLoading, mutate }
}

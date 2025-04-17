import useSWR from 'swr'
import { getFormWithBlocks } from '@/services/form/getFormWithBlocks'

/**
 * Fetch a single form with its blocks by ID.
 */
export function useForm(formId?: string) {
  const key = formId ? ['form', formId] : null
  const fetcher = async ([, id]: [string, string]) => {
    return await getFormWithBlocks(id)
  }
  const { data, error, isLoading, mutate } = useSWR(key, fetcher)
  return { form: data ?? null, error, isLoading, mutate }
}

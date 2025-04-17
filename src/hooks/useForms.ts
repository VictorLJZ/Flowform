import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

/**
 * Fetches all forms for a given workspace.
 */
export function useForms(workspaceId?: string | null) {
  const key = workspaceId ? ['forms', workspaceId] : null
  const fetcher = async ([, wid]: [string, string]) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('workspace_id', wid)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
  const { data, error, isLoading, mutate } = useSWR(key, fetcher)
  return { forms: data ?? [], error, isLoading, mutate }
}

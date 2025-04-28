import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

/**
 * Fetches all forms for a given workspace.
 * Automatically refreshes when the workspace ID changes.
 */
export function useForms(workspaceId?: string | null) {
  // Only set key when workspaceId is available
  const key = workspaceId ? ['forms', workspaceId] : null
  
  const fetcher = async ([, wid]: [string, string]) => {
    console.log(`[useForms] Fetching forms for workspace: ${wid}`)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('workspace_id', wid)
      .order('created_at', { ascending: false })
    if (error) {
      console.error(`[useForms] Error fetching forms for workspace ${wid}:`, error)
      throw error
    }
    console.log(`[useForms] Fetched ${data?.length || 0} forms for workspace ${wid}`)
    return data
  }
  
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: true,
    revalidateIfStale: true,
    dedupingInterval: 5000, // Deduplicate requests within 5 seconds
  })
  return { forms: data ?? [], error, isLoading, mutate }
}

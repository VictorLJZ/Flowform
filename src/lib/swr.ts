import { createClient } from '@/lib/supabase/client'

/**
 * Global SWR fetcher for Supabase tables.
 * Key is the table name; selects all columns by default.
 */
export async function fetcher<T = unknown>(table: string): Promise<T> {
  const supabase = createClient()
  const { data, error } = await supabase.from(table).select('*')
  if (error) throw error
  return data as T
}

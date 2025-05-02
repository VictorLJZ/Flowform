import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with the service role key for bypassing RLS
 * IMPORTANT: This should ONLY be used for public endpoints that need to access
 * data without authentication, such as public form views
 */
export function createPublicClient(): SupabaseClient {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      // Disable global auth state management since this is for public access
      global: {
        headers: {
          'x-flowform-public-access': 'true'
        }
      }
    }
  )
}

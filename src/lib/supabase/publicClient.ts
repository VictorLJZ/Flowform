import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for public-facing endpoints
 * Uses the anon key with appropriate RLS policies for security
 * 
 * This client is intended for public form views and other public operations
 * that should be secured through Row Level Security policies in the database
 */
export function createPublicClient(): SupabaseClient {
  // Use the anon key with proper RLS policies (never use service role key in public endpoints)
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

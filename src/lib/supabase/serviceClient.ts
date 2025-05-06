import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase service client for server-side analytics operations
 * 
 * This client is intended for use with trusted server-side endpoints only,
 * particularly analytics tracking routes where we need privileged write access.
 * 
 * This function uses the service role key but still maintains proper security by:
 * 1. Only being used server-side in API routes
 * 2. Having thorough input validation before any database operations
 * 3. Only performing specific, narrowly-scoped operations
 */
export function createServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'x-flowform-analytics-service': 'true'
        }
      }
    }
  );
}

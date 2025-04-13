import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client for server-side operations
 * that bypasses Row Level Security
 * IMPORTANT: This should only be used in trusted server environments
 * like API routes or server components
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
}

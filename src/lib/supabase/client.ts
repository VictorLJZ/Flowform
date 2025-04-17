import { createBrowserClient } from '@supabase/ssr'
import { type SupabaseClient } from '@supabase/supabase-js'

export function createClient(): SupabaseClient {
  const newSupabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Debugging utility
    (window as any).supabase = newSupabaseClient;
    // Optional: Add a log to confirm exposure
    // console.log('[Supabase Client] Exposed client to window.supabase for debugging.'); 
  }
  
  return newSupabaseClient;
}

export type { SupabaseClient };

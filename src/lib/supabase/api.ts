import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for API routes that can access the auth session
 * This preserves authentication context for server components and API routes
 */
export async function createAPIClient() {
  // Await the cookie store since it's now a Promise in newer Next.js versions
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Map the cookies to the format expected by Supabase
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesToSet) {
          // API routes in App Router can't set cookies in the response
          // This is a no-op, but needed to match the interface
        },
      },
    }
  );
}

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

/**
 * Gets the authenticated user from the request's Authorization header
 * Uses JWT token verification instead of cookie parsing
 * Designed specifically for API route authentication
 */
export async function getAuthenticatedUser() {
  try {
    // Get the authorization header safely (handling async nature of headers)
    const headersList = headers();
    const authorization = headersList.get('authorization') || '';
    
    // If no auth header is present, return null
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return { user: null, error: 'No authorization header' };
    }
    
    // Extract the JWT token
    const token = authorization.replace('Bearer ', '');
    
    // Create a standard Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Set the session using the JWT token
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data?.user) {
      return { user: null, error: error?.message || 'Invalid token' };
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Error validating auth token:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

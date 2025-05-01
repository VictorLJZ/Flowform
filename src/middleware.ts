import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Log the request path for debugging
  console.log("Middleware processing:", request.nextUrl.pathname, 
              "Search:", request.nextUrl.search || "none")

  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  // Log auth results for debugging
  console.log("Auth check result:", user ? "Authenticated" : "Not authenticated", 
              authError ? `Error: ${authError.message}` : "")

  // Path is the pathname of the URL (e.g. /dashboard)
  const path = request.nextUrl.pathname
  
  // Check if this is an OAuth callback with a code but not in the callback URL
  if (path === '/' && request.nextUrl.searchParams.get('code')) {
    console.log("Detected code parameter on homepage, redirecting to auth callback")
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    // Keep the original query parameters
    return NextResponse.redirect(url)
  }

  // If this is an API route, add the auth token to the request headers
  // This ensures our API routes have access to the user's authentication token
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // We already have the verified user from above, now get the token
    // Note: We still need getSession for the token, but we've verified the user with getUser() above
    const { data: { session }} = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    if (accessToken) {
      // Clone the request and add the Authorization header
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);
      
      // Create a new request with the updated headers
      const newRequest = new Request(
        request.url,
        {
          headers: requestHeaders,
          method: request.method,
          body: request.body,
          redirect: request.redirect,
          cache: request.cache,
          credentials: request.credentials,
          integrity: request.integrity,
          keepalive: request.keepalive,
          mode: request.mode,
          signal: request.signal,
        }
      );
      
      // Return the response with the new request
      return NextResponse.next({
        request: newRequest,
      });
    }
    
    // For debugging: Log the path and conditions to trace the issue
    // Allow both form API and sessions API
    const isFormApiEndpoint = request.nextUrl.pathname.match(/^\/api\/forms\/[^/]+/) !== null;
    const isFormSessionsEndpoint = request.nextUrl.pathname.match(/^\/api\/forms\/[^/]+\/sessions/) !== null;
    const isPublicApiEndpoint = request.nextUrl.pathname.startsWith('/api/public/');
    const isFEndpoint = request.nextUrl.pathname.startsWith('/api/f/');
    
    console.log('AUTH CHECK for API route:', {
      path: request.nextUrl.pathname,
      isAuthenticated: !!user,
      isFormApiEndpoint,
      isFormSessionsEndpoint,
      isPublicApiEndpoint,
      isFEndpoint,
      shouldAllow: !!user || isPublicApiEndpoint || isFormApiEndpoint || isFEndpoint
    });
    
    // For API routes, if no token is found and route requires authentication,
    // return a 401 Unauthorized response UNLESS the route is explicitly public
    if (
      !user && 
      !isPublicApiEndpoint &&
      !isFormApiEndpoint && // Allow all form API endpoints for public access
      !isFEndpoint
    ) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  } else {
    // For non-API routes, check authentication and redirect to login if needed
    // Public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/pricing',
      '/features',  // Always lowercase
      '/about',
      '/contact',
      '/blog',
      '/privacy',
      '/terms',
    ];
    
    // Check if the path starts with any of these prefixes
    const publicPathPrefixes = [
      '/f/',
      '/login',
      '/auth/',
      '/signup',
      '/company/',
      '/features/',  // Always lowercase
      '/resources/',
    ];
    
    const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname) || 
                         publicPathPrefixes.some(prefix => request.nextUrl.pathname.startsWith(prefix));
    
    if (!user && !isPublicRoute) {
      // For protected routes, redirect to login
      console.log("Redirecting to login (not authenticated)")
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as is.
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

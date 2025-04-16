import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Log the request path for debugging
  console.log("Middleware processing:", request.nextUrl.pathname, 
              "Search:", request.nextUrl.search || "none")

  let supabaseResponse = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          // Preserve options only on the response cookies, not request cookies
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
    // Get the session to extract the access token
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
    
    // For API routes, if no token is found and route requires authentication,
    // return a 401 Unauthorized response
    if (
      !user && 
      !request.nextUrl.pathname.startsWith('/api/public/')
    ) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  } else {
    // For non-API routes, check authentication and redirect to login if needed
    // Allow public routes: '/', '/f/*', '/login', '/auth/*'
    if (
      !user && 
      !request.nextUrl.pathname.startsWith('/f/') && 
      !request.nextUrl.pathname.startsWith('/login') && 
      !request.nextUrl.pathname.startsWith('/auth') &&
      request.nextUrl.pathname !== '/'
    ) {
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

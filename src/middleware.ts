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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
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

  // Check if the user is authenticated and if the route requires authentication
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

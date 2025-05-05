import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Log only in development
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    console.log("Middleware:", request.nextUrl.pathname);
  }

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

  // Get the user with error handling
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Ignore auth session errors - middleware should continue even if auth fails
  }

  // Path is the pathname of the URL
  const path = request.nextUrl.pathname
  
  // Handle OAuth callback redirects
  if (path === '/' && request.nextUrl.searchParams.get('code')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    
    return NextResponse.redirect(url, {
      headers: {
        'Cache-Control': 'no-store, no-cache'
      }
    })
  }

  // Handle API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Add auth token to API requests if available
    if (user) {
      const { data: { session }} = await supabase.auth.getSession()
      const accessToken = session?.access_token
      
      if (accessToken) {
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('Authorization', `Bearer ${accessToken}`)
        
        return NextResponse.next({
          request: new Request(request.url, {
            headers: requestHeaders,
            method: request.method,
            body: request.body,
            redirect: request.redirect,
            signal: request.signal
          })
        })
      }
    }
    
    // Determine if route should be public or protected
    const isPublicRoute = 
      request.nextUrl.pathname.startsWith('/api/public/') ||
      request.nextUrl.pathname.startsWith('/api/f/') ||
      request.nextUrl.pathname.match(/^\/api\/forms\/[^/]+/) !== null ||
      request.nextUrl.pathname.startsWith('/api/conversation') ||
      request.nextUrl.pathname.startsWith('/api/analytics/track/form-view') ||
      request.nextUrl.pathname.startsWith('/api/analytics/track/form-completion') ||
      request.nextUrl.pathname.startsWith('/api/analytics/batch')
    
    // Return 401 for protected API routes that require auth
    if (!user && !isPublicRoute) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  } 
  // Handle regular page routes
  else {
    // Define public routes that don't require authentication
    const publicRoutes = ['/', '/pricing', '/features', '/about', '/contact', 
                         '/blog', '/privacy', '/terms']
    
    // Define public path prefixes
    const publicPathPrefixes = ['/f/', '/login', '/auth/', '/signup', 
                               '/forgot-password', '/company/', '/features/', '/resources/']
    
    // Add special cases to avoid redirect loops
    const isAuthRedirect = request.nextUrl.searchParams.has('_auth')
    const isPublicRoute = publicRoutes.includes(path) || 
                         publicPathPrefixes.some(prefix => path.startsWith(prefix)) ||
                         isAuthRedirect
    
    // Redirect unauthenticated users to login for protected routes
    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('returnTo', path)
      
      return NextResponse.redirect(url, {
        headers: {
          'Cache-Control': 'no-store, no-cache'
        }
      })
    }
  }

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


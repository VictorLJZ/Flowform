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
  
  // Extract workspace ID from path for authorization checks
  let workspaceId: string | null = null
  
  // Get workspaceId from the URL path for dashboard routes
  const workspaceMatch = path.match(/\/dashboard\/workspace\/([^\/]+)(?:\/.*)?$/)
  if (workspaceMatch && workspaceMatch[1]) {
    workspaceId = workspaceMatch[1]
  }
  
  // For API routes, check the query parameters
  if (path.startsWith('/api/') && !workspaceId) {
    workspaceId = request.nextUrl.searchParams.get('workspace_id')
  }
  
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
  
  // Handle redirection from query parameter URLs to path-based URLs
  if (path === '/dashboard' && request.nextUrl.searchParams.has('workspace')) {
    const workspaceId = request.nextUrl.searchParams.get('workspace')
    if (workspaceId) {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/workspace/${workspaceId}`
      url.searchParams.delete('workspace')
      
      return NextResponse.redirect(url, {
        headers: {
          'Cache-Control': 'no-store, no-cache'
        }
      })
    }
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
      request.nextUrl.pathname.startsWith('/api/analytics/track/block-view') ||
      request.nextUrl.pathname.startsWith('/api/analytics/track/block-submit') ||
      request.nextUrl.pathname.startsWith('/api/analytics/batch')
    
    // Return 401 for protected API routes that require auth
    if (!user && !isPublicRoute) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // For API routes that specify a workspace ID, check access authorization
    if (workspaceId && user) {
      try {
        // Check if the user has access to the workspace
        const { data: workspaceMembers, error } = await supabase
          .from('workspace_members')
          .select('user_id, workspace_id')
          .eq('workspace_id', workspaceId)
          .eq('user_id', user.id);
        
        // If there's an error or no data (user isn't a member), return unauthorized
        if (error || !workspaceMembers || workspaceMembers.length === 0) {
          console.log(`[Middleware] User ${user.id} unauthorized for workspace ${workspaceId}`);
          
          return NextResponse.json(
            { error: 'You do not have access to this workspace' },
            { status: 403 }
          );
        }
        
        // If we get here, user has access to the workspace
        console.log(`[Middleware] User ${user.id} authorized for workspace ${workspaceId}`);
      } catch (error) {
        console.error('[Middleware] Error checking workspace access:', error);
        // Fall through - we'll let the API route handle the error
      }
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
    
    // If this is a workspace path, check if the user has access to this workspace
    if (workspaceId) {
      try {
        // Check if the user has access to the workspace
        const { data: workspaceMembers, error } = await supabase
          .from('workspace_members')
          .select('user_id, workspace_id, role')
          .eq('workspace_id', workspaceId)
          .eq('user_id', user?.id)
        
        // If there's an error or no data (user isn't a member), redirect to dashboard
        if (error || !workspaceMembers || workspaceMembers.length === 0) {
          console.log(`[Middleware] User ${user?.id} unauthorized for workspace ${workspaceId}`);
          
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          url.searchParams.delete('workspace');
          
          return NextResponse.redirect(url, {
            headers: {
              'Cache-Control': 'no-store, no-cache'
            }
          });
        }
        
        // If we get here, user has access to the workspace
        console.log(`[Middleware] User ${user?.id} authorized for workspace ${workspaceId}`);
      } catch (error) {
        console.error('[Middleware] Error checking workspace access:', error);
        // Fall through - we'll let the request proceed and let the error be handled by the page
      }
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


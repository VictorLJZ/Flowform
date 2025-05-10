import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper function to get the Stripe checkout URL for a plan
function getStripeCheckoutUrl(plan: string, isAnnual: boolean = false): string {
  // Using the actual Stripe payment links from PricingPlans.tsx
  switch (plan.toLowerCase()) {
    case 'pro':
      return isAnnual 
        ? 'https://buy.stripe.com/00g5mg0j6d9w1X228a' // Annual Pro plan
        : 'https://buy.stripe.com/cN2eWQc1O4D08lqeUU'; // Monthly Pro plan
    case 'business':
      return isAnnual 
        ? 'https://buy.stripe.com/00gdSMfe03yWgRW003' // Annual Business plan
        : 'https://buy.stripe.com/14kaGAfe0c5s1X2145'; // Monthly Business plan
    default:
      return '/dashboard';
  }
}

export async function GET(request: Request) {
  const isDev = process.env.NODE_ENV === 'development';
  
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const returnTo = requestUrl.searchParams.get('returnTo')
    const plan = requestUrl.searchParams.get('plan')
    const annual = requestUrl.searchParams.get('annual')
    const isAnnual = annual === 'true'
    
    // Only log in development
    if (isDev) {
      console.log('Auth callback:', { 
        returnTo, 
        plan,
        hasCode: !!code
      })
    }
    
    if (!code) {
      return NextResponse.redirect(new URL('/login?error=Missing+authorization+code', request.url))
    }
    
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }
    
    // Verify the session was created properly by getting the user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=Failed+to+verify+user+after+authentication', request.url)
      )
    }
    
    // Get the user ID to initialize workspace
    if (user) {
      try {
        if (isDev) console.log('Initializing workspace for user')
        
        // Check if user already has workspaces (to avoid duplicate initialization)
        const { data: existingWorkspaces } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
        
        if (existingWorkspaces && existingWorkspaces.length > 0) {
          if (isDev) console.log('User already has workspaces, skipping')
        } else {
          // Create workspace directly instead of using the initializeDefaultWorkspace function
          // to avoid client-side Supabase issues
          
          // Get user display name for workspace name
          const userDisplayName = 
            user.user_metadata?.name || 
            user.user_metadata?.full_name || 
            user.email?.split('@')[0] || 
            'User';
          
          const defaultWorkspaceName = `${userDisplayName}'s Workspace`;
          
          // First create the workspace record
          const { data: workspace, error: workspaceError } = await supabase
            .from('workspaces')
            .insert({
              name: defaultWorkspaceName,
              description: 'My default workspace',
              created_by: user.id,
              logo_url: null,
              settings: null
            })
            .select('*')
          
          if (workspaceError) {
            console.error('Error creating workspace:', workspaceError)
          } else if (workspace && workspace.length > 0) {
            if (isDev) console.log('Created workspace successfully')
            
            // Add user as workspace owner
            const { error: memberError } = await supabase
              .from('workspace_members')
              .insert({
                workspace_id: workspace[0].id,
                user_id: user.id,
                role: 'owner'
              })
            
            if (memberError) {
              console.error('Error adding workspace member:', memberError)
            }
          }
        }
      } catch (err) {
        // Log error but don't block the authentication flow
        console.error('Failed to initialize workspace:', err)
      }
    }
    
    // Determine where to redirect after successful login
    let redirectUrl = '/dashboard' // Default redirect
    
    // Handle specific plan checkout if plan parameter exists
    if (plan && (plan === 'pro' || plan === 'business')) {
      // Redirect to the appropriate Stripe checkout
      redirectUrl = getStripeCheckoutUrl(plan, isAnnual)
    } 
    // Or use the returnTo parameter if it exists and is a relative URL (security check)
    else if (returnTo && returnTo.startsWith('/')) {
      redirectUrl = returnTo
    }
    
    if (isDev) console.log('Redirecting to:', redirectUrl)
    
    // Create a session cookie to ensure auth state persists
    // This makes the auth state more stable and prevents flickering
    const session = await supabase.auth.getSession();
    if (session.data.session) {
      // Set an auth state flag to help identify authenticated requests
      const authFlag = `_auth=${Date.now()}`;
      
      // Check if it's already an absolute URL
      if (redirectUrl.startsWith('http')) {
        const url = new URL(redirectUrl);
        url.searchParams.append('_auth', Date.now().toString());
        
        return NextResponse.redirect(url, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            // Set a cookie to indicate fresh login that our client-side code can read
            'Set-Cookie': `just_logged_in=true; Path=/; Max-Age=60; SameSite=Strict; Secure`
          }
        });
      }
      
      // For relative URLs, construct proper URL with auth flag
      try {
        const requestOrigin = new URL(request.url).origin;
        const redirectUri = new URL(redirectUrl, requestOrigin);
        
        // Add the auth flag
        redirectUri.searchParams.append('_auth', Date.now().toString());
        
        return NextResponse.redirect(redirectUri, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Set-Cookie': `auth_redirect=true; Path=/; Max-Age=5; SameSite=Strict; Secure; just_logged_in=true; Path=/; Max-Age=60; SameSite=Strict; Secure`
          }
        });
      } catch (error) {
        // Log the error and fallback to direct redirect with cache prevention headers
        console.error('[auth/callback] Error setting cookies:', error)
        return NextResponse.redirect(`${redirectUrl}?${authFlag}`, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Set-Cookie': `auth_redirect=true; Path=/; Max-Age=5; SameSite=Strict; Secure; just_logged_in=true; Path=/; Max-Age=60; SameSite=Strict; Secure`
          }
        });
      }
    }
  } catch {
    // No error variable needed - just redirecting to login page with generic error
    return NextResponse.redirect(
      new URL('/login?error=An+unexpected+error+occurred', request.url)
    )
  }
}

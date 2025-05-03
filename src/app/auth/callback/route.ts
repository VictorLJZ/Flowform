import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { initializeDefaultWorkspace } from '@/services/workspace/initializeDefaultWorkspace'

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
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const returnTo = requestUrl.searchParams.get('returnTo')
    const plan = requestUrl.searchParams.get('plan')
    const annual = requestUrl.searchParams.get('annual')
    const isAnnual = annual === 'true'
    
    // Debug logging
    console.log('Auth callback parameters:', {
      returnTo,
      plan,
      annual,
      isAnnual,
      fullUrl: request.url,
      searchParams: Object.fromEntries(requestUrl.searchParams.entries())
    })
    
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
    
    // Get the user ID to initialize workspace
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      try {
        console.log('[Auth Callback] Initializing default workspace for user:', user.id)
        
        // Check if user already has workspaces (to avoid duplicate initialization)
        const { data: existingWorkspaces } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
        
        if (existingWorkspaces && existingWorkspaces.length > 0) {
          console.log('[Auth Callback] User already has workspaces, skipping initialization')
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
            console.error('[Auth Callback] Error creating workspace:', workspaceError)
          } else if (workspace && workspace.length > 0) {
            console.log('[Auth Callback] Successfully created workspace:', workspace[0].id)
            
            // Add user as workspace owner
            const { error: memberError } = await supabase
              .from('workspace_members')
              .insert({
                workspace_id: workspace[0].id,
                user_id: user.id,
                role: 'owner'
              })
            
            if (memberError) {
              console.error('[Auth Callback] Error adding workspace member:', memberError)
            } else {
              console.log('[Auth Callback] Successfully added user as workspace owner')
            }
          }
        }
      } catch (err) {
        // Log error but don't block the authentication flow
        console.error('[Auth Callback] Failed to initialize workspace:', err)
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
    
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch {
    // No error variable needed - just redirecting to login page with generic error
    return NextResponse.redirect(
      new URL('/login?error=An+unexpected+error+occurred', request.url)
    )
  }
}

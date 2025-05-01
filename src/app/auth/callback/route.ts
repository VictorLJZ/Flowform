import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper function to get the Stripe checkout URL for a plan
function getStripeCheckoutUrl(plan: string): string {
  // Using the actual Stripe payment links from PricingPlans.tsx
  switch (plan.toLowerCase()) {
    case 'pro':
      return 'https://buy.stripe.com/cN2eWQc1O4D08lqeUU';
    case 'business':
      return 'https://buy.stripe.com/14kaGAfe0c5s1X2145';
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
    
    // Debug logging
    console.log('Auth callback parameters:', {
      returnTo,
      plan,
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
    
    // Determine where to redirect after successful login
    let redirectUrl = '/dashboard' // Default redirect
    
    // Handle specific plan checkout if plan parameter exists
    if (plan && (plan === 'pro' || plan === 'business')) {
      // Redirect to the appropriate Stripe checkout
      redirectUrl = getStripeCheckoutUrl(plan)
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

'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const returnTo = formData.get('returnTo') as string
  const plan = formData.get('plan') as string
  
  // Debug logging
  console.log('Login parameters:', { returnTo, plan });
  
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    // Handle error on client side
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }
  
  // Check if we need to redirect to a specific place after login
  if (returnTo && returnTo.length > 0) {
    // If we have a plan parameter, this is probably coming from the pricing page
    if (plan && (plan === 'pro' || plan === 'business')) {
      // Redirect to the appropriate Stripe checkout for the selected plan
      const checkoutUrl = getStripeCheckoutUrl(plan);
      return redirect(checkoutUrl);
    }
    
    // Otherwise just redirect to the returnTo URL
    // Make sure it's a relative URL to prevent open redirect vulnerabilities
    if (returnTo.startsWith('/')) {
      return redirect(returnTo);
    }
  }
  
  // Default redirect to dashboard
  return redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  
  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }
  
  return redirect('/login?message=Check your email for the confirmation link')
}

interface LoginParams {
  returnTo?: string | null;
  plan?: string | null;
}

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

export async function loginWithGoogle(params?: LoginParams) {
  // Debug logging
  console.log('Google login parameters:', params)
  
  const supabase = await createClient()
  
  // Get the current origin for local development or production
  const origin = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Build the callback URL with the returnTo and plan parameters if present
  let callbackUrl = `${origin}/auth/callback`;
  if (params?.returnTo || params?.plan) {
    callbackUrl += '?';
    const queryParams = [];
    if (params.returnTo) {
      queryParams.push(`returnTo=${encodeURIComponent(params.returnTo)}`);
    }
    if (params.plan) {
      queryParams.push(`plan=${encodeURIComponent(params.plan)}`);
    }
    callbackUrl += queryParams.join('&');
  }
  
  // Debug logging
  console.log('Built callback URL:', callbackUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  
  if (error) {
    return {
      error: error.message
    }
  }
  
  return {
    url: data.url
  }
}

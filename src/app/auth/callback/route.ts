import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    console.log("Auth callback called with code:", code ? "Present" : "Missing")
    
    if (!code) {
      return NextResponse.redirect(new URL('/login?error=Missing+authorization+code', request.url))
    }
    
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error("Error exchanging code for session:", error.message)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }
    
    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error("Unexpected error in auth callback:", error)
    return NextResponse.redirect(
      new URL('/login?error=An+unexpected+error+occurred', request.url)
    )
  }
} 
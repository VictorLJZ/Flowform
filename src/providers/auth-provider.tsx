"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Session, User, AuthChangeEvent } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {}
})

export function AuthProvider({ 
  children,
  initialSession,
}: { 
  children: React.ReactNode
  initialSession: Session | null
}) {
  // Initialize state with null values and verify with getUser below
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  // Verify authentication when component mounts
  useEffect(() => {
    // Securely verify user on mount
    const verifyAuth = async () => {
      try {
        // Always verify the user with the Supabase Auth server
        const { data: userData } = await supabase.auth.getUser()

        if (userData?.user) {
          // Only if we have a verified user, get a verified session
          const { data } = await supabase.auth.getSession()
          setUser(userData.user)
          setSession(data.session)
        } else {
          setUser(null)
          setSession(null)
        }
      } catch (error) {
        console.error('Error verifying authentication:', error)
        setUser(null)
        setSession(null)
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent) => {
      // Always re-verify the user securely with the Supabase Auth server on any auth change
      const { data: userData } = await supabase.auth.getUser()
      
      // Only set the authenticated user if verified by the server
      if (userData?.user) {
        setUser(userData.user)
        // Get a verified session
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
      } else {
        setUser(null)
        setSession(null)
      }

      if (event === 'SIGNED_OUT') {
        router.push('/')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

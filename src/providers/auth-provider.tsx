"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Session, User, AuthChangeEvent } from "@supabase/supabase-js"
import { createClient } from "@/supabase/client"
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
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [session, setSession] = useState<Session | null>(initialSession)
  const [isLoading, setIsLoading] = useState(!initialSession)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    console.log("Setting up auth subscription with initial session:", {
      hasInitialSession: !!initialSession,
      initialUser: initialSession?.user?.email
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, currentSession: Session | null) => {
      console.log("Auth state change:", { event, email: currentSession?.user?.email });
      
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setIsLoading(false)

      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to home");
        router.push('/')
      }
    })

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signOut = async () => {
    console.log("Initiating sign out");
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error during sign out:", error);
        throw error
      }
      
      console.log("Sign out successful, clearing state");
      setUser(null)
      setSession(null)
      router.push('/')
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  console.log("Current auth state:", {
    isLoading,
    hasUser: !!user,
    userEmail: user?.email,
    hasSession: !!session
  });

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

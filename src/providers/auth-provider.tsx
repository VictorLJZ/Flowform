"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Session, AuthChangeEvent } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useWorkspaceStore } from "@/stores/workspaceStore"
import { useAuthStore } from "@/stores/authStore"
import { User } from "@/types/auth-types"

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
  // Use the authStore instead of local state
  const { user, login, signUp, logout, setUser, error, isLoading: authLoading } = useAuthStore()
  
  // Maintain session state for Supabase API calls
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
          

          // Update auth store with user data
          setUser({
            id: userData.user.id,
            email: userData.user.email || '',
            user_metadata: userData.user.user_metadata || {},
            app_metadata: userData.user.app_metadata || {}
          })
          
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
        // Update auth store with user data
        setUser({
          id: userData.user.id,
          email: userData.user.email || '',
          user_metadata: userData.user.user_metadata || {},
          app_metadata: userData.user.app_metadata || {}
        })
        
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
    await logout()
    router.push('/')
  }

  // Setup workspace state when user is authenticated
  useEffect(() => {
    const setupWorkspaceState = async () => {
      if (!user) return
      
      const { setUserId, setUserEmail, fetchWorkspaces, ensureDefaultWorkspace } = useWorkspaceStore.getState()
      
      try {
        // Set user data in workspace store
        setUserId(user.id)
        setUserEmail(user.email || '')
        
        // Fetch workspaces and ensure default workspace
        await fetchWorkspaces()
        await ensureDefaultWorkspace()
      } catch (error) {
        console.error('Error setting up workspace state:', error)
      }
    }
    
    setupWorkspaceState()
  }, [user])
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading: isLoading || authLoading, 
      signOut 
    }}>
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

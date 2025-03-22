"use client"

import { createClient } from "@/supabase/supabase_client"
import { useAuthStore } from "@/store/auth-store"
import { AuthModal } from "@/components/auth/auth-modal"
import { ReactNode, useEffect } from "react"

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setLoading } = useAuthStore()
  const supabase = createClient()
  
  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error("Auth session check error:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    checkSession()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, setUser, setLoading])
  
  return (
    <>
      {children}
      <AuthModal />
    </>
  )
}

"use client"

import { Session } from "@supabase/supabase-js"
import { AuthProvider } from "@/providers/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Toaster } from "@/components/ui/toaster"
import { WorkspaceValidator } from "@/components/providers/workspace-validator"

export function Providers({
  children,
  initialSession, // We'll keep this parameter for backward compatibility but won't use it directly
}: {
  children: React.ReactNode
  initialSession: Session | null
}) {
  // We don't need to maintain session state here anymore 
  // AuthProvider will handle secure authentication verification
  // This eliminates security issues from using unverified session data
  
  return (
    <>
      {/* Pass null instead of potentially unverified session data */}
      <AuthProvider initialSession={null}>
        {/* Add workspace validator to validate workspace data */}
        <WorkspaceValidator />
        {children}
      </AuthProvider>
      <Toaster />
    </>
  )
}

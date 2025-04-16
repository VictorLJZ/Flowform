"use client"

import { Session } from "@supabase/supabase-js"
import { AuthProvider } from "@/providers/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Toaster } from "@/components/ui/toaster"
import { WorkspaceValidator } from "@/components/providers/workspace-validator"
import { NetworkTracerProvider } from "@/components/providers/network-tracer-provider"
import { TabFocusMonitor } from "@/components/providers/tab-focus-monitor"

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
        {/* Network tracer for debugging Supabase requests */}
        <NetworkTracerProvider>
          {/* Add workspace validator to validate workspace data */}
          <WorkspaceValidator />
          {/* Add TabFocusMonitor to handle tab switching and Supabase reconnection */}
          <TabFocusMonitor />
          {children}
        </NetworkTracerProvider>
      </AuthProvider>
      <Toaster />
    </>
  )
}

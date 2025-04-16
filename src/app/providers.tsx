"use client"

// Session import removed as it's no longer needed
import { AuthProvider } from "@/providers/auth-provider"
// Import only what we actually use
import { Toaster } from "@/components/ui/toaster"
import { WorkspaceValidator } from "@/components/providers/workspace-validator"
import { NetworkTracerProvider } from "@/components/providers/network-tracer-provider"
import { TabFocusMonitor } from "@/components/providers/tab-focus-monitor"

export function Providers({
  children
}: {
  children: React.ReactNode
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

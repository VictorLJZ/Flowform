"use client"

// Session import removed as it's no longer needed
import { AuthProvider } from "@/providers/auth-provider"
// Import only what we actually use
import { Toaster } from "@/components/ui/toaster"
// NetworkTracerProvider import removed
import { SWRConfig } from "swr"
import { fetcher } from "@/lib/swr"

export function Providers({
  children
}: {
  children: React.ReactNode
}) {
  // We don't need to maintain session state here anymore 
  // AuthProvider will handle secure authentication verification
  // This eliminates security issues from using unverified session data
  
  return (
    <SWRConfig value={{ fetcher, revalidateOnFocus: true }}>
      {/* Fix: Remove initialSession prop as it's no longer used/accepted */}
      <AuthProvider>
        {/* NetworkTracerProvider wrapper removed */}
        {children}
      </AuthProvider>
      <Toaster />
    </SWRConfig>
  )
}

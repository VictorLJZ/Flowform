"use client"

import { AuthProvider } from "@/providers/auth-provider"
import { Toaster } from "@/components/ui/toaster"
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

import { Providers } from "./providers"

export async function InitProviders({
  children
}: {
  children: React.ReactNode
}) {
  // We don't need to pass initialSession anymore since AuthProvider will securely verify on mount
  // This prevents security warnings about using unverified session data
  return (
    <Providers initialSession={null}>
      {children}
    </Providers>
  )
}

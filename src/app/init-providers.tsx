import { Providers } from "./providers"

export async function InitProviders({
  children
}: {
  children: React.ReactNode
}) {
  // AuthProvider inside Providers will handle session verification
  return (
    <Providers>
      {children}
    </Providers>
  )
}

import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";
import { StoreHydrator } from "@/components/store-hydrator";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/auth-provider";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "FlowForm",
  description: "A form builder application with AI-powered features",
};

async function getInitialSession() {
  try {
    // Create the Supabase client with cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Cookie setting is handled on the client
          },
          remove(name: string, options: any) {
            // Cookie removal is handled on the client
          },
        },
      }
    );

    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session;
  } catch (error) {
    console.error("Error fetching initial session:", error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSession = await getInitialSession();

  return (
    <html lang="en">
      <body className={`${fontVariables} antialiased`}>
        <AuthProvider initialSession={initialSession}>
          <StoreHydrator />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

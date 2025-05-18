"use client";

import { WorkspaceProvider } from "@/providers/workspace-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ReactNode, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InviteLayoutProps {
  children: ReactNode;
}

// Error component to display if there's an issue with the invitation
function InviteErrorState() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md p-6">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-destructive">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              There was an error loading this invitation.
            </p>
            <p className="text-xs text-muted-foreground">
              Please try again or contact support if the issue persists.
            </p>
            <div className="mt-4">
              <a href="/" className="text-primary hover:underline">
                Return to Home
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InviteLayout({ children }: InviteLayoutProps) {
  // Track if we've mounted the component safely
  const [hasMounted, setHasMounted] = useState(false);
  // Track errors during rendering
  const [hasError, setHasError] = useState(false);
  
  // Only render after the component has mounted on the client side
  useEffect(() => {
    try {
      // Check for auth parameter in URL
      const url = new URL(window.location.href);
      const hasAuthParam = url.searchParams.has('_auth');
      
      // If we detect the auth param, it means we just came from login
      if (hasAuthParam) {
        console.log('Detected auth redirect parameter');
        // Give auth time to initialize
        setTimeout(() => {
          setHasMounted(true);
        }, 500);
      } else {
        // No auth param, regular load
        setHasMounted(true);
      }
    } catch (err) {
      console.error('Error initializing invitation layout:', err);
      setHasError(true);
    }
  }, []);
  
  if (hasError) {
    return <InviteErrorState />;
  }
  
  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Preparing Invitation</CardTitle>
            <CardContent className="flex justify-center py-6 mt-4">
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Just a moment...</p>
              </div>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  try {
    return (
      <AuthProvider>
        <WorkspaceProvider>
          {children}
        </WorkspaceProvider>
      </AuthProvider>
    );
  } catch (error) {
    console.error('Error in invite layout rendering:', error);
    return <InviteErrorState />;
  }
}

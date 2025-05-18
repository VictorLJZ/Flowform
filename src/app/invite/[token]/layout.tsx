"use client";

import { WorkspaceProvider } from "@/providers/workspace-provider";
import { ReactNode, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

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
      setHasMounted(true);
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
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  try {
    return (
      <WorkspaceProvider>
        {children}
      </WorkspaceProvider>
    );
  } catch (error) {
    console.error('Error in invite layout rendering:', error);
    return <InviteErrorState />;
  }
}

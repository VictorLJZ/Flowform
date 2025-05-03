"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { eventBus, AUTH_EVENTS } from "@/lib/events";

/**
 * A wrapper component for routes that require authentication
 * Will automatically redirect to login page if user is not authenticated
 */
export function ProtectedRoute({ 
  children,
  redirectTo = "/login"
}: { 
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { session, isLoading, isLoggedOut } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated and not loading
    if (!isLoading && isLoggedOut) {
      console.log("[AUTH] Protected route accessed while logged out, redirecting to", redirectTo);
      router.replace(redirectTo);
      
      // Broadcast the session expired/missing event
      eventBus.emit(AUTH_EVENTS.SESSION_EXPIRED, {
        timestamp: new Date(),
        redirectedFrom: window.location.pathname
      });
    }
  }, [isLoggedOut, isLoading, router, redirectTo]);

  // While loading auth state, show nothing
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  // Only render children when authenticated
  return !isLoggedOut ? <>{children}</> : null;
}

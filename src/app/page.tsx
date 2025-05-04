"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import MegaNavbar from "@/components/layout/public/MegaNavbar";
import FooterBar from "@/components/layout/public/FooterBar";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Testimonials from "@/components/sections/Testimonials";
import CallToAction from "@/components/sections/CallToAction";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuthSession();
  const [showContent, setShowContent] = useState(false);
  
  // Handle authenticated user redirect
  useEffect(() => {
    // Skip during loading state
    if (isLoading) return;
    
    if (user) {
      // Check if we're in a redirect loop
      const isRecentRedirect = sessionStorage.getItem('last_redirect');
      const now = Date.now();
      
      if (isRecentRedirect && now - parseInt(isRecentRedirect) < 2000) {
        // Likely in a redirect loop, stay on homepage
        if (process.env.NODE_ENV === 'development') {
          console.log('[Home] Potential loop detected, showing homepage');
        }
        setShowContent(true);
        return;
      }
      
      // Remember when we redirected
      sessionStorage.setItem('last_redirect', now.toString());
      sessionStorage.setItem('redirect_source', 'home');
      router.push('/dashboard');
      return;
    }
    
    // User is not authenticated, show homepage
    setShowContent(true);
  }, [user, isLoading, router]);
  
  // Don't render anything while checking authentication
  if (!showContent) return null;

  return (
    <>
      <MegaNavbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <CallToAction />
      </main>
      <FooterBar />
    </>
  );
}

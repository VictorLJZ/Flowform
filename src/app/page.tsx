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
  
  // Handle page visibility
  useEffect(() => {
    // Skip during loading state
    if (isLoading) return;
    
    // Only redirect on first login or if coming directly from auth flow
    const isFirstLogin = sessionStorage.getItem('just_logged_in') === 'true';
    const comingFromAuth = document.referrer.includes('/login') || 
                          document.referrer.includes('/auth') || 
                          document.referrer.includes('/signup');
    
    if (user && (isFirstLogin || comingFromAuth)) {
      // Clear the first login flag
      sessionStorage.removeItem('just_logged_in');
      
      // Redirect to dashboard
      router.push('/dashboard');
      return;
    }
    
    // In all other cases, show the homepage content
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

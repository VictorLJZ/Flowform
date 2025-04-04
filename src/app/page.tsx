"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Navbar from "@/components/layout/Navbar"
import Hero from "@/components/sections/Hero"
import Features from "@/components/sections/Features"
import Testimonials from "@/components/sections/Testimonials"
import CallToAction from "@/components/sections/CallToAction"

export default function Home() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [gradientPosition, setGradientPosition] = useState({ x: 0, y: 0 });
  
  // Handle mouse movement for dynamic gradient effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Calculate percentage position relative to button
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setGradientPosition({ x, y });
    }
  };
  
  // Apply dynamic gradient position
  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.style.backgroundPosition = `${gradientPosition.x}% ${gradientPosition.y}%`;
      if (buttonRef.current.firstChild && buttonRef.current.firstChild instanceof HTMLElement) {
        buttonRef.current.firstChild.style.backgroundPosition = `${100 - gradientPosition.x}% ${100 - gradientPosition.y}%`;
      }
    }
  }, [gradientPosition]);
  
  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTransitioning(true);
    
    // Delay navigation to allow animation to play
    setTimeout(() => {
      router.push('/dashboard');
    }, 800); // Match this timing with the CSS animation duration
  };
  
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <CallToAction />
      </main>
    </>
  );
}

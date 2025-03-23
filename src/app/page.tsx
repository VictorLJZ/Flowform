"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

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
    <div className={styles.homepage}>
      <div className={styles.noiseOverlay}></div>
      
      {/* Page transition overlay */}
      <div className={`${styles.pageTransition} ${isTransitioning ? styles.pageTransitionActive : ''}`}></div>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto">
        <div className="text-center max-w-3xl">
          <h2 className={`text-6xl mb-6 ${styles.animateTitle}`}>FlowForm</h2>
          <p className={`text-xl text-white mb-8 max-w-2xl mx-auto ${styles.animateDescription}`}>
            Create, manage, and analyze forms with powerful AI assistance. Streamline your data collection and boost productivity.
          </p>
          <div className={styles.animateButton} onMouseMove={handleMouseMove}>
            <button 
              ref={buttonRef}
              onClick={handleGetStarted}
              className={`${styles.pillButton} ${styles.gradientAnimation}`}
            >
              Get Started
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

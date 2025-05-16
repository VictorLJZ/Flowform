"use client"

import { useState, useEffect } from 'react'

/**
 * Hook to detect viewport size and return appropriate viewport mode
 * @param mobileBreakpoint - Breakpoint width in pixels below which viewport is considered mobile
 * @returns Current viewport mode ('mobile' or 'desktop')
 */
export function useViewportDetection(mobileBreakpoint = 768): 'desktop' | 'mobile' {
  // Default to 'desktop' server-side to avoid hydration mismatches
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop')
  
  useEffect(() => {
    // Function to determine viewport mode based on window width
    const determineViewportMode = () => {
      const isMobile = window.innerWidth < mobileBreakpoint
      setViewportMode(isMobile ? 'mobile' : 'desktop')
    }
    
    // Set initial viewport mode
    determineViewportMode()
    
    // Add resize listener
    window.addEventListener('resize', determineViewportMode)
    
    // Clean up
    return () => {
      window.removeEventListener('resize', determineViewportMode)
    }
  }, [mobileBreakpoint])
  
  return viewportMode
}

"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"

interface SlideAspectRatioContainerProps {
  children: ReactNode
  className?: string
  aspectRatio?: "16:9" | "4:3" | "1:1"
  isBuilder?: boolean
  viewportMode?: 'desktop' | 'mobile'
}

export function SlideAspectRatioContainer({
  children,
  className,
  aspectRatio = "16:9",
  isBuilder = false,
  viewportMode
}: SlideAspectRatioContainerProps) {
  // Get viewport mode from store if not explicitly provided
  const storeViewportMode = useFormBuilderStore(state => state.viewportMode);
  const effectiveViewportMode = viewportMode || storeViewportMode;
  
  // Handle differently in builder vs viewer mode
  if (!isBuilder) {
    // In viewer mode, pass height through to children
    return <div className="w-full h-full">{children}</div>
  }
  
  // Calculate padding-top based on aspect ratio to maintain proportion
  let paddingTopPercentage = "56.25%" // Default 16:9 ratio (9/16 = 0.5625 or 56.25%)
  
  // For desktop view
  if (effectiveViewportMode === 'desktop') {
    if (aspectRatio === "4:3") {
      paddingTopPercentage = "75%" // 4:3 ratio (3/4 = 0.75 or 75%)
    } else if (aspectRatio === "1:1") {
      paddingTopPercentage = "100%" // 1:1 square ratio
    }
    
    return (
      <div className={cn("w-full flex items-start justify-center", className)} style={{ height: "calc(100% - 24px)" }}>
        {/* Aspect ratio container */}
        <div 
          className="relative w-full max-w-5xl bg-background rounded-md shadow-md overflow-hidden mt-[-20px]"
          style={{ paddingTop: paddingTopPercentage }}
        >
          {/* Content container that fills the aspect ratio container */}
          <div className="absolute inset-0 w-full h-full">
            {children}
          </div>
        </div>
      </div>
    )
  } else {
    // For mobile view, use a phone aspect ratio but scaled down
    // to fit within the builder view without scrolling
    return (
      <div className={cn("w-full flex items-start justify-center", className)} style={{ height: "calc(100% - 24px)" }}>
        {/* Mobile view container with fixed dimensions */}
        <div 
          className="relative bg-background rounded-md shadow-md overflow-hidden mx-auto mt-[-150px]"
          style={{ 
            width: '400px', // Further increased width for mobile view
            height: '800px', // Further increased height while maintaining approximately 9:16 ratio
            maxHeight: 'calc(100% - 24px)' // Ensure it doesn't overflow the container
          }}
        >
          {/* Content container that fills the mobile view */}
          <div className="w-full h-full">
            {children}
          </div>
        </div>
      </div>
    )
  }
}

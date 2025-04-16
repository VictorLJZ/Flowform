"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SlideAspectRatioContainerProps {
  children: ReactNode
  className?: string
  aspectRatio?: "16:9" | "4:3" | "1:1"
  isBuilder?: boolean
}

export function SlideAspectRatioContainer({
  children,
  className,
  aspectRatio = "16:9",
  isBuilder = false
}: SlideAspectRatioContainerProps) {
  // Only apply aspect ratio container in builder mode
  if (!isBuilder) {
    return <>{children}</>
  }
  
  // Calculate padding-top based on aspect ratio to maintain proportion
  let paddingTopPercentage = "56.25%" // Default 16:9 ratio (9/16 = 0.5625 or 56.25%)
  
  if (aspectRatio === "4:3") {
    paddingTopPercentage = "75%" // 4:3 ratio (3/4 = 0.75 or 75%)
  } else if (aspectRatio === "1:1") {
    paddingTopPercentage = "100%" // 1:1 square ratio
  }
  
  return (
    <div className={cn("w-full mx-auto max-w-5xl", className)}>
      {/* Aspect ratio container */}
      <div 
        className="relative w-full bg-background rounded-md shadow-md overflow-hidden"
        style={{ paddingTop: paddingTopPercentage }}
      >
        {/* Content container that fills the aspect ratio container */}
        <div className="absolute inset-0 w-full h-full">
          {children}
        </div>
      </div>
    </div>
  )
}

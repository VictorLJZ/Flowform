"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MobileViewportContainerProps {
  children: ReactNode
  className?: string
  deviceType?: 'phone' | 'tablet'
}

/**
 * Component that simulates mobile device viewport in the form builder
 * Wraps content in a container that visually represents a mobile device
 */
export function MobileViewportContainer({
  children,
  className,
  deviceType = 'phone'
}: MobileViewportContainerProps) {
  // Set dimensions based on device type
  // Using common mobile viewport sizes
  const dimensions = {
    phone: {
      width: '375px',
      height: '667px',
    },
    tablet: {
      width: '768px',
      height: '1024px',
    }
  }
  
  return (
    <div className="flex items-center justify-center w-full h-full py-6">
      <div 
        className={cn(
          "relative border-4 border-gray-800 rounded-[24px] shadow-xl bg-white overflow-hidden",
          className
        )}
        style={{ 
          width: dimensions[deviceType].width,
          height: dimensions[deviceType].height,
        }}
      >
        {/* Device notch/speaker */}
        {deviceType === 'phone' && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/4 h-5 bg-gray-800 rounded-b-lg z-10" />
        )}
        
        {/* Content container */}
        <div className="absolute inset-0 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { MediaBackgroundLayout as MediaBackgroundLayoutType } from "@/types/layout-types"
import Image from "next/image"

interface MediaBackgroundLayoutProps {
  id: string
  children: ReactNode
  overlayColor?: string
  overlayOpacity?: number
  contentPosition?: 'top' | 'center' | 'bottom'
  textAlignment?: 'left' | 'center' | 'right'
  textColor?: 'light' | 'dark'
  mediaId?: string
  sizingMode?: 'contain' | 'cover' | 'fill'
  opacity?: number
  className?: string
  settings?: Partial<MediaBackgroundLayoutType>
  onUpdate?: (updates: Partial<{ settings: any }>) => void
}

export function MediaBackgroundLayout({
  id,
  children,
  overlayColor = '#000000',
  overlayOpacity = 50,
  contentPosition = 'center',
  textAlignment = 'center',
  textColor = 'light',
  mediaId,
  sizingMode = 'cover',
  opacity = 100,
  className,
  settings,
  onUpdate,
}: MediaBackgroundLayoutProps) {
  const { mode } = useFormBuilderStore()
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
  // Use settings if provided, otherwise use props
  const effectiveOverlayColor = settings?.overlayColor || overlayColor
  const effectiveOverlayOpacity = settings?.overlayOpacity || overlayOpacity
  const effectiveContentPosition = settings?.contentPosition || contentPosition
  const effectiveTextAlignment = settings?.textAlignment || textAlignment
  const effectiveTextColor = settings?.textColor || textColor
  const effectiveMediaId = settings?.mediaId || mediaId
  const effectiveSizingMode = settings?.sizingMode || sizingMode
  const effectiveOpacity = settings?.opacity || opacity
  
  // Content position classes
  const contentPositionClasses = {
    'top': 'justify-start pt-16',
    'center': 'justify-center',
    'bottom': 'justify-end pb-16',
  }
  
  // Text alignment classes
  const textAlignmentClasses = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
  }
  
  // Text color classes
  const textColorClasses = {
    'light': 'text-white',
    'dark': 'text-gray-900',
  }
  
  // Placeholder for when no media is set
  const mediaPlaceholder = (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <span className="text-gray-400">
        {isBuilder ? "Click to add background media" : "No background media"}
      </span>
    </div>
  )
  
  return (
    <div 
      className={cn(
        "w-full h-full relative",
        className
      )}
    >
      {/* Background media */}
      {effectiveMediaId ? (
        <div className="absolute inset-0 w-full h-full">
          <Image 
            src={effectiveMediaId}
            alt="Background media"
            fill
            style={{ 
              objectFit: effectiveSizingMode,
              opacity: effectiveOpacity / 100
            }}
          />
        </div>
      ) : mediaPlaceholder}
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ 
          backgroundColor: effectiveOverlayColor,
          opacity: effectiveOverlayOpacity / 100
        }}
      ></div>
      
      {/* Content */}
      <div 
        className={cn(
          "relative w-full h-full flex flex-col items-center",
          contentPositionClasses[effectiveContentPosition]
        )}
      >
        <div className={cn(
          "w-full max-w-2xl px-8 py-8",
          textAlignmentClasses[effectiveTextAlignment],
          textColorClasses[effectiveTextColor]
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}

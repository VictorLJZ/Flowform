"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
// import { useFormBuilderStore } from "@/stores/formBuilderStore" // Not currently used
import { MediaBackgroundLayout as MediaBackgroundLayoutType } from "@/types/layout-types"
import { MediaRenderer } from '@/components/form/media/MediaRenderer'

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
  onUpdate?: (updates: Partial<{
    settings: Partial<MediaBackgroundLayoutType>
  }>) => void
}

export function MediaBackgroundLayout({
  // id param removed as it was unused
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
  settings
  // onUpdate param removed as it was unused
}: MediaBackgroundLayoutProps) {
  // const { mode } = useFormBuilderStore() // Not currently used
  
  // Determine if we're in builder mode - Not currently used
  // const isBuilder = mode === 'builder'
  
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
  
  return (
    <div 
      className={cn(
        "w-full h-full relative",
        className
      )}
    >
      {/* Background media */}
      <div className="absolute inset-0 w-full h-full">
        <MediaRenderer
          mediaId={effectiveMediaId}
          sizingMode={effectiveSizingMode}
          opacity={effectiveOpacity}
        />
      </div>
      
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
          "w-full max-w-2xl px-6 py-8", // Changed from px-8 to px-6 to match StandardSlideLayout
          textAlignmentClasses[effectiveTextAlignment],
          textColorClasses[effectiveTextColor],
          "text-left space-y-4" // Added text-left to match StandardSlideLayout
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}

"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { MediaTopLayout as MediaTopLayoutType } from "@/types/layout-types"
import Image from "next/image"

interface MediaTopLayoutProps {
  id: string
  children: ReactNode
  mediaProportion?: number
  textAlignment?: 'left' | 'center' | 'right'
  spacing?: 'compact' | 'normal' | 'spacious'
  mediaId?: string
  sizingMode?: 'contain' | 'cover' | 'fill'
  opacity?: number
  className?: string
  settings?: Partial<MediaTopLayoutType>
  onUpdate?: (updates: Partial<{
    settings: Partial<MediaTopLayoutType>
  }>) => void
}

export function MediaTopLayout({
  children,
  textAlignment = 'center',
  spacing = 'normal',
  mediaId,
  sizingMode = 'cover',
  opacity = 100,
  className,
  settings
}: MediaTopLayoutProps) {
  const { mode } = useFormBuilderStore();
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
  // Use settings if provided, otherwise use props
  const effectiveMediaProportion = settings?.mediaProportion || 0.4 // Default 40% height for media
  const effectiveTextAlignment = settings?.textAlignment || textAlignment
  const effectiveSpacing = settings?.spacing || spacing
  const effectiveMediaId = settings?.mediaId || mediaId
  const effectiveSizingMode = settings?.sizingMode || sizingMode
  const effectiveOpacity = settings?.opacity || opacity
  
  // Spacing classes
  const spacingClasses = {
    'compact': 'space-y-2',
    'normal': 'space-y-4',
    'spacious': 'space-y-8',
  }
  
  // Alignment classes
  const alignmentClasses = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
  }
  
  // Placeholder for when no media is set
  const mediaPlaceholder = (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <span className="text-gray-400">
        {isBuilder ? "Click to add media" : "No media"}
      </span>
    </div>
  )
  
  // Media element
  const mediaElement = effectiveMediaId ? (
    <div className="w-full h-full relative overflow-hidden">
      <Image 
        src={effectiveMediaId}
        alt="Slide media"
        fill
        style={{ 
          objectFit: effectiveSizingMode,
          opacity: effectiveOpacity / 100
        }}
      />
    </div>
  ) : mediaPlaceholder
  
  // Calculate the height of the media section
  const mediaHeightPercentage = Math.round(effectiveMediaProportion * 100)
  const contentHeightPercentage = 100 - mediaHeightPercentage
  
  return (
    <div 
      className={cn(
        "w-full h-full flex flex-col",
        className
      )}
    >
      {/* Media section - Top */} 
      <div 
        className="w-full relative overflow-hidden"
        style={{ height: `${mediaHeightPercentage}%` }}
      >
        {mediaElement}
      </div>
      
      {/* Content section - Bottom */} 
      <div 
        className="w-full px-5 py-4"
        style={{ height: `${contentHeightPercentage}%` }}
      >
        <div className={cn(
          "w-full h-full flex flex-col justify-center",
          alignmentClasses[effectiveTextAlignment],
          spacingClasses[effectiveSpacing],
          "text-left space-y-4" // Added consistent base styling for all slide content
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}

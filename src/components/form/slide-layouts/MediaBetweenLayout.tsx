"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { MediaBetweenLayout as MediaBetweenLayoutType } from "@/types/layout-types"
import Image from "next/image"

interface MediaBetweenLayoutProps {
  id: string
  children: ReactNode
  mediaProportion?: number
  textAlignment?: 'left' | 'center' | 'right'
  spacing?: 'compact' | 'normal' | 'spacious'
  mediaId?: string
  sizingMode?: 'contain' | 'cover' | 'fill'
  opacity?: number
  className?: string
  settings?: Partial<MediaBetweenLayoutType>
  onUpdate?: (updates: Partial<{
    settings: Partial<MediaBetweenLayoutType>
  }>) => void
}

export function MediaBetweenLayout({
  children,
  textAlignment = 'center',
  spacing = 'normal',
  mediaId,
  sizingMode = 'cover',
  opacity = 100,
  className,
  settings
}: MediaBetweenLayoutProps) {
  const { mode } = useFormBuilderStore();
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
  // Use settings if provided, otherwise use props
  const effectiveMediaProportion = settings?.mediaProportion || 0.3 // Default 30% height for media
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
  
  // Calculate the heights for all sections
  const mediaHeightPercentage = Math.round(effectiveMediaProportion * 100)
  const contentHeightPercentage = Math.round((100 - mediaHeightPercentage) / 2)
  
  // Split the children into two parts - title/description and the form input
  // This is a bit of a hack, but assuming React.Children.toArray(children) will return
  // an array where the first elements are title/description and the last elements are the form inputs
  const childrenArray = React.Children.toArray(children)
  
  // For simplicity, we'll use the first half of children for top section,
  // and second half for bottom section
  const midpoint = Math.ceil(childrenArray.length / 2)
  const topChildren = childrenArray.slice(0, midpoint)
  const bottomChildren = childrenArray.slice(midpoint)
  
  return (
    <div 
      className={cn(
        "w-full h-full flex flex-col",
        className
      )}
    >
      {/* Top content section */} 
      <div 
        className="w-full px-5 pt-4"
        style={{ height: `${contentHeightPercentage}%` }}
      >
        <div className={cn(
          "w-full h-full flex flex-col justify-end",
          alignmentClasses[effectiveTextAlignment],
          spacingClasses[effectiveSpacing],
          "text-left space-y-4" // Added consistent base styling for all slide content
        )}>
          {topChildren}
        </div>
      </div>
      
      {/* Media section - Middle */} 
      <div 
        className="w-full relative overflow-hidden my-3"
        style={{ height: `${mediaHeightPercentage}%` }}
      >
        {mediaElement}
      </div>
      
      {/* Bottom content section */} 
      <div 
        className="w-full px-5 pb-4"
        style={{ height: `${contentHeightPercentage}%` }}
      >
        <div className={cn(
          "w-full h-full flex flex-col justify-start",
          alignmentClasses[effectiveTextAlignment],
          spacingClasses[effectiveSpacing],
          "text-left space-y-4" // Added consistent base styling for all slide content
        )}>
          {bottomChildren}
        </div>
      </div>
    </div>
  )
}

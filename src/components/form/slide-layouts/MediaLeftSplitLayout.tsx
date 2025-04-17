"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { MediaLeftSplitLayout as MediaLeftSplitLayoutType } from "@/types/layout-types"
import Image from "next/image"

interface MediaLeftSplitLayoutProps {
  id: string
  children: ReactNode
  textAlignment?: 'left' | 'center' | 'right'
  spacing?: 'compact' | 'normal' | 'spacious'
  mediaId?: string
  sizingMode?: 'contain' | 'cover' | 'fill'
  opacity?: number
  className?: string
  settings?: Partial<MediaLeftSplitLayoutType>
  onUpdate?: (updates: Partial<{
    settings: Partial<MediaLeftSplitLayoutType>
  }>) => void
}

export function MediaLeftSplitLayout({
  // id param removed as it was unused
  children,
  textAlignment = 'left',
  spacing = 'normal',
  mediaId,
  sizingMode = 'cover',
  opacity = 100,
  className,
  settings
  // onUpdate param removed as it was unused
}: MediaLeftSplitLayoutProps) {
  const { mode } = useFormBuilderStore()
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
  // Use settings if provided, otherwise use props
  const effectiveTextAlignment = settings?.textAlignment || textAlignment
  const effectiveSpacing = settings?.spacing || spacing
  const effectiveMediaId = settings?.mediaId || mediaId
  // Force cover for split layout, ignore settings
  const effectiveSizingMode = 'cover' 
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
          objectFit: 'cover', // Force cover
          opacity: effectiveOpacity / 100
        }}
      />
    </div>
  ) : mediaPlaceholder
  
  return (
    <div 
      className={cn(
        "w-full h-full grid grid-cols-2 gap-0", // Ensure no gap
        className
      )}
    >
      {/* Media section - First Column */}
      <div className="col-span-1 h-full">
        {mediaElement}
      </div>
      
      {/* Content section - Second Column */}
      <div 
        className="col-span-1 h-full flex flex-col justify-center py-[15%] px-[7.5%]"
      >
        <div className={cn(
          "w-full",
          alignmentClasses[effectiveTextAlignment],
          spacingClasses[effectiveSpacing],
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}

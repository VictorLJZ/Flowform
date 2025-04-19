"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { MediaRightLayout as MediaRightLayoutType } from "@/types/layout-types"
import Image from "next/image"

interface MediaRightLayoutProps {
  id: string
  children: ReactNode
  textAlignment?: 'left' | 'center' | 'right'
  spacing?: 'compact' | 'normal' | 'spacious'
  mediaId?: string
  sizingMode?: 'contain' | 'cover' | 'fill'
  opacity?: number
  className?: string
  settings?: Partial<MediaRightLayoutType>
  onUpdate?: (updates: Partial<{
    settings: Partial<MediaRightLayoutType>
  }>) => void
}

export function MediaRightLayout({
  children,
  textAlignment = 'left',
  spacing = 'normal',
  mediaId,
  sizingMode = 'contain', // Default to contain for this layout
  opacity = 100,
  className,
  settings
}: MediaRightLayoutProps) {
  const { mode } = useFormBuilderStore()
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
  // Use settings if provided, otherwise use props
  const effectiveTextAlignment = settings?.textAlignment || textAlignment
  const effectiveSpacing = settings?.spacing || spacing
  const effectiveMediaId = settings?.mediaId || mediaId
  const effectiveSizingMode = settings?.sizingMode === 'cover' || settings?.sizingMode === 'fill' ? 'contain' : (settings?.sizingMode || sizingMode) // Force contain if cover/fill selected
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
      {/* Note: Removed fill prop, using objectFit style directly. Added w-full, h-full and relative positioning for contained image sizing */}
      <Image 
        src={effectiveMediaId}
        alt="Slide media"
        layout="fill" // Use layout="fill" to make objectFit work correctly
        style={{ 
          objectFit: effectiveSizingMode, // Should be 'contain'
          opacity: effectiveOpacity / 100
        }}
      />
    </div>
  ) : mediaPlaceholder
  
  return (
    <div 
      className={cn(
        "w-full h-full grid grid-cols-2 gap-0", // Use grid layout
        className
      )}
    >
      {/* Content section - First Column */}
      <div 
        className="col-span-1 h-full flex flex-col justify-center py-[15%] pl-[15%] pr-[7.5%]" // Apply padding here
      >
        <div className={cn(
          "w-full", // Remove padding here
          alignmentClasses[effectiveTextAlignment],
          spacingClasses[effectiveSpacing],
        )}>
          {children}
        </div>
      </div>
      
      {/* Media section - Second Column with Padding */} 
      <div 
        className="col-span-1 h-full flex items-center justify-center py-[15%] pr-[15%] pl-[7.5%]" // Takes second column, add padding and centering
      >
        {/* Wrapper for the media element itself to control size within the padded area */} 
        <div className="w-full h-full relative">
          {mediaElement}
        </div>
      </div>
    </div>
  )
}

"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
// import { useFormBuilderStore } from "@/stores/formBuilderStore" // Not currently used
import { MediaBottomLayout as MediaBottomLayoutType } from "@/types/layout-types"
import { MediaRenderer } from '@/components/form/media/MediaRenderer'

interface MediaBottomLayoutProps {
  id: string
  children: ReactNode
  mediaProportion?: number
  textAlignment?: 'left' | 'center' | 'right'
  spacing?: 'compact' | 'normal' | 'spacious'
  mediaId?: string
  sizingMode?: 'contain' | 'cover' | 'fill'
  opacity?: number
  className?: string
  settings?: Partial<MediaBottomLayoutType>
  onUpdate?: (updates: Partial<{
    settings: Partial<MediaBottomLayoutType>
  }>) => void
}

export function MediaBottomLayout({
  children,
  textAlignment = 'center',
  spacing = 'normal',
  mediaId,
  sizingMode = 'cover',
  opacity = 100,
  className,
  settings
}: MediaBottomLayoutProps) {
  // const { mode } = useFormBuilderStore(); // Not currently used
  
  // Determine if we're in builder mode - Not currently used
  // const isBuilder = mode === 'builder'
  
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
  
  // Media element using MediaRenderer component
  const mediaElement = (
    <MediaRenderer
      mediaId={effectiveMediaId}
      sizingMode={effectiveSizingMode}
      opacity={effectiveOpacity}
      className="w-full h-full"
    />
  )
  
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
      {/* Content section - Top */} 
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
      
      {/* Media section - Bottom */} 
      <div 
        className="w-full relative overflow-hidden"
        style={{ height: `${mediaHeightPercentage}%` }}
      >
        {mediaElement}
      </div>
    </div>
  )
}

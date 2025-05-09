"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
// import { useFormBuilderStore } from "@/stores/formBuilderStore" // Not currently used
import { MediaLeftLayout as MediaLeftLayoutType } from "@/types/layout-types"
import { MediaRenderer } from '@/components/form/media/MediaRenderer'

interface MediaLeftLayoutProps {
  id: string
  children: ReactNode
  mediaProportion?: number
  textAlignment?: 'left' | 'center' | 'right'
  spacing?: 'compact' | 'normal' | 'spacious'
  mediaId?: string
  sizingMode?: 'contain' | 'cover' | 'fill'
  opacity?: number
  className?: string
  settings?: Partial<MediaLeftLayoutType>
  onUpdate?: (updates: Partial<{
    settings: Partial<MediaLeftLayoutType>
  }>) => void
}

export function MediaLeftLayout({
  // id param removed as it was unused
  children,
  textAlignment = 'left',
  spacing = 'normal',
  mediaId,
  sizingMode = 'contain', // Default to contain for this layout
  opacity = 100,
  className,
  settings
  // onUpdate param removed as it was unused
}: MediaLeftLayoutProps) {
  // const { mode } = useFormBuilderStore(); // Not currently used
  
  // Determine if we're in builder mode - Not currently used
  // const isBuilder = mode === 'builder'
  
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
  
  // Media element using MediaRenderer component
  const mediaElement = (
    <MediaRenderer
      mediaId={effectiveMediaId}
      sizingMode={effectiveSizingMode}
      opacity={effectiveOpacity}
      className="w-full h-full"
    />
  )
  
  return (
    <div 
      className={cn(
        "w-full h-full grid grid-cols-2 gap-0", // Use grid layout
        className
      )}
    >
      {/* Media section - First Column with Padding */} 
      <div 
        className="col-span-1 h-full flex items-center justify-center py-[15%] pl-[15%] pr-[7.5%]" // Takes first column, add padding and centering
      >
        {/* Wrapper for the media element itself */} 
        <div className="w-full h-full relative">
          {mediaElement}
        </div>
      </div>
      
      {/* Content section - Second Column */} 
      <div 
        className="col-span-1 h-full flex flex-col justify-center py-[15%] pr-[15%] pl-[7.5%]" // Apply padding here
      >
        <div className={cn(
          "w-full", // Remove padding here
          alignmentClasses[effectiveTextAlignment],
          spacingClasses[effectiveSpacing],
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}

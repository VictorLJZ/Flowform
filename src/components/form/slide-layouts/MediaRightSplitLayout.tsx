"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { MediaRightSplitLayout as MediaRightSplitLayoutType } from "@/types/layout-types"
import { MediaRenderer } from '@/components/form/media/MediaRenderer'

interface MediaRightSplitLayoutProps {
  id: string
  children: ReactNode
  textAlignment?: 'left' | 'center' | 'right'
  spacing?: 'compact' | 'normal' | 'spacious'
  mediaId?: string
  sizingMode?: 'contain' | 'cover' | 'fill'
  opacity?: number
  className?: string
  settings?: Partial<MediaRightSplitLayoutType>
  onUpdate?: (updates: Partial<{
    settings: Partial<MediaRightSplitLayoutType>
  }>) => void
}

export function MediaRightSplitLayout({
  // id param removed as it was unused
  children,
  textAlignment = 'left',
  spacing = 'normal',
  mediaId,
  opacity = 100,
  className,
  settings
  // onUpdate param removed as it was unused
}: MediaRightSplitLayoutProps) {
  const { mode } = useFormBuilderStore()
  
  // Determine if we're in builder mode - Not currently used
  // const isBuilder = mode === 'builder'
  
  // Use settings if provided, otherwise use props
  const effectiveTextAlignment = settings?.textAlignment || textAlignment
  const effectiveSpacing = settings?.spacing || spacing
  const effectiveMediaId = settings?.mediaId || mediaId
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
      sizingMode="cover" // Force cover for split layouts
      opacity={effectiveOpacity}
      className="w-full h-full"
    />
  )
  
  const isViewer = mode === 'viewer'

  return (
    <div 
      className={cn(
        "w-full h-full grid grid-cols-2 gap-0",
        isViewer && "min-h-full",
        className
      )}
    >
      {/* Content section - First Column */}
      <div 
        className={cn(
          "col-span-1 h-full flex flex-col justify-center", 
          isViewer ? "py-8 px-[7.5vw]" : "py-[15%] px-[7.5%]"
        )}
      >
        <div className={cn(
          "w-full",
          alignmentClasses[effectiveTextAlignment],
          spacingClasses[effectiveSpacing],
        )}>
          {children}
        </div>
      </div>
      
      {/* Media section - Second Column */}
      <div className="col-span-1 h-full">
        {mediaElement}
      </div>
    </div>
  )
}

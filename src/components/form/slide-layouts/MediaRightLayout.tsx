"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { MediaRightLayout as MediaRightLayoutType } from "@/types/layout-types"
import Image from "next/image"

interface MediaRightLayoutProps {
  id: string
  children: ReactNode
  mediaProportion?: number
  textAlignment?: 'left' | 'center' | 'right'
  spacing?: 'compact' | 'normal' | 'spacious'
  mediaId?: string
  sizingMode?: 'contain' | 'cover' | 'fill'
  opacity?: number
  className?: string
  settings?: Partial<MediaRightLayoutType>
  onUpdate?: (updates: Partial<{ settings: any }>) => void
}

export function MediaRightLayout({
  id,
  children,
  mediaProportion = 0.4,
  textAlignment = 'left',
  spacing = 'normal',
  mediaId,
  sizingMode = 'cover',
  opacity = 100,
  className,
  settings,
  onUpdate,
}: MediaRightLayoutProps) {
  const { mode } = useFormBuilderStore()
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
  // Use settings if provided, otherwise use props
  const effectiveMediaProportion = settings?.mediaProportion || mediaProportion
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
  
  return (
    <div 
      className={cn(
        "w-full h-full flex",
        className
      )}
    >
      {/* Content section */}
      <div 
        className="h-full flex flex-col justify-center"
        style={{ width: `${(1 - effectiveMediaProportion) * 100}%` }}
      >
        <div className={cn(
          "px-8 py-8 w-full",
          alignmentClasses[effectiveTextAlignment],
          spacingClasses[effectiveSpacing],
        )}>
          {children}
        </div>
      </div>
      
      {/* Media section */}
      <div 
        className="h-full"
        style={{ width: `${effectiveMediaProportion * 100}%` }}
      >
        {mediaElement}
      </div>
    </div>
  )
}

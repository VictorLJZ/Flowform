"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { StandardSlideLayout as StandardSlideLayoutType } from "@/types/layout-types"

interface StandardSlideLayoutProps {
  id: string
  children: ReactNode
  alignment?: 'left' | 'center' | 'right'
  spacing?: 'compact' | 'normal' | 'spacious'
  className?: string
  settings?: Partial<StandardSlideLayoutType>
  onUpdate?: (updates: Partial<{
    settings: Partial<StandardSlideLayoutType>
  }>) => void
}

export function StandardSlideLayout({
  children,
  alignment = 'left',
  spacing = 'normal',
  className,
  settings,
  // onUpdate removed as it was unused
}: StandardSlideLayoutProps) {
  // mode removed as it was unused
  const { } = useFormBuilderStore()
  
  // Use settings if provided, otherwise use props
  const effectiveAlignment = settings?.alignment || alignment
  const effectiveSpacing = settings?.spacing || spacing
  
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
  
  // Get mode from store to adapt to viewer vs builder
  const { mode } = useFormBuilderStore()
  const isViewer = mode === 'viewer'
  
  return (
    <div 
      className={cn(
        "w-full h-full flex flex-col justify-center items-center",
        isViewer && "min-h-[calc(100vh-60px)]",  // Full height in viewer mode
        className
      )}
    >
      <div className={cn(
        "w-full max-w-2xl px-6 py-8",
        isViewer && "flex-1 flex flex-col",  // Full height content area in viewer mode
        alignmentClasses[effectiveAlignment],
        spacingClasses[effectiveSpacing],
      )}>
        {children}
      </div>
    </div>
  )
}

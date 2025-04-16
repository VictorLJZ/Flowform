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
  onUpdate?: (updates: Partial<{ settings: any }>) => void
}

export function StandardSlideLayout({
  id,
  children,
  alignment = 'center',
  spacing = 'normal',
  className,
  settings,
  onUpdate,
}: StandardSlideLayoutProps) {
  const { mode } = useFormBuilderStore()
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
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
  
  return (
    <div 
      className={cn(
        "w-full h-full flex flex-col justify-center items-center",
        className
      )}
    >
      <div className={cn(
        "w-full max-w-2xl px-6 py-8",
        alignmentClasses[effectiveAlignment],
        spacingClasses[effectiveSpacing],
      )}>
        {children}
      </div>
    </div>
  )
}

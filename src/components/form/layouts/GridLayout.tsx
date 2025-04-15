"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"

type GridColumns = 1 | 2 | 3 | 4

interface GridLayoutProps {
  id: string
  children: ReactNode
  columns?: GridColumns
  gapX?: 'none' | 'small' | 'medium' | 'large'
  gapY?: 'none' | 'small' | 'medium' | 'large'
  className?: string
  settings?: {
    columns?: GridColumns
    gapX?: 'none' | 'small' | 'medium' | 'large'
    gapY?: 'none' | 'small' | 'medium' | 'large'
  }
  onUpdate?: (updates: Partial<{ settings: any }>) => void
}

export function GridLayout({
  id,
  children,
  columns = 2,
  gapX = 'medium',
  gapY = 'medium',
  className,
  settings,
  onUpdate,
}: GridLayoutProps) {
  const { mode } = useFormBuilderStore()
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
  // Use settings if provided, otherwise use props
  const effectiveColumns = settings?.columns || columns
  const effectiveGapX = settings?.gapX || gapX
  const effectiveGapY = settings?.gapY || gapY
  
  // Define the gap classes
  const gapXClasses = {
    'none': 'gap-x-0',
    'small': 'gap-x-2',
    'medium': 'gap-x-4',
    'large': 'gap-x-8',
  }
  
  const gapYClasses = {
    'none': 'gap-y-0',
    'small': 'gap-y-2',
    'medium': 'gap-y-4',
    'large': 'gap-y-8',
  }
  
  // Define the grid column classes
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
  }
  
  return (
    <div 
      className={cn(
        "w-full grid",
        columnClasses[effectiveColumns],
        gapXClasses[effectiveGapX],
        gapYClasses[effectiveGapY],
        isBuilder && "border border-dashed border-gray-300 p-4 rounded-md",
        className
      )}
    >
      {children}
    </div>
  )
}

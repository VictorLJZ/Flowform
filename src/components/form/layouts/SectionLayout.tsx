"use client"

import React, { ReactNode, useRef, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { useAutosave } from "@/services/form/autosaveForm"

interface SectionLayoutProps {
  id: string
  title: string
  description?: string
  children: ReactNode
  className?: string
  settings?: {
    titleSize?: 'small' | 'medium' | 'large'
    separator?: boolean
    spacing?: 'compact' | 'normal' | 'spacious'
  }
  onUpdate?: (updates: Partial<{ 
    title: string, 
    description: string, 
    settings: any 
  }>) => void
}

export function SectionLayout({
  id,
  title,
  description,
  children,
  className,
  settings = {
    titleSize: 'medium',
    separator: true,
    spacing: 'normal'
  },
  onUpdate,
}: SectionLayoutProps) {
  const titleRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)
  const { mode } = useFormBuilderStore()
  const autosave = useAutosave()
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
  // Define title size classes
  const titleSizeClasses = {
    'small': 'text-lg font-medium',
    'medium': 'text-xl font-semibold',
    'large': 'text-2xl font-bold',
  }
  
  // Define spacing classes
  const spacingClasses = {
    'compact': 'space-y-2',
    'normal': 'space-y-4',
    'spacious': 'space-y-6',
  }
  
  // Get effective settings
  const effectiveTitleSize = settings.titleSize || 'medium'
  const effectiveSpacing = settings.spacing || 'normal'
  const showSeparator = settings.separator !== false
  
  // Update title ref when title prop changes
  useEffect(() => {
    if (titleRef.current && isBuilder && titleRef.current.textContent !== title) {
      titleRef.current.textContent = title || ''
    }
    if (descriptionRef.current && isBuilder && descriptionRef.current.textContent !== description) {
      descriptionRef.current.textContent = description || ''
    }
  }, [title, description, isBuilder])
  
  // Handle title update
  const handleTitleUpdate = (e: React.FormEvent<HTMLDivElement>) => {
    if (isBuilder && onUpdate) {
      const target = e.target as HTMLDivElement
      onUpdate({ title: target.textContent || '' })
    }
  }
  
  // Handle description update
  const handleDescriptionUpdate = (e: React.FormEvent<HTMLDivElement>) => {
    if (isBuilder && onUpdate) {
      const target = e.target as HTMLDivElement
      onUpdate({ description: target.textContent || '' })
    }
  }
  
  // Handle autosave on blur
  const handleBlur = () => {
    if (isBuilder) {
      autosave.scheduleAutosave()
    }
  }
  
  // Render header based on mode
  const renderHeader = () => {
    if (isBuilder) {
      return (
        <div className="mb-4">
          <div 
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            className={cn(
              titleSizeClasses[effectiveTitleSize],
              "outline-none focus-visible:ring-0 focus-visible:ring-offset-0 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
            )}
            data-placeholder="Section title"
            onInput={handleTitleUpdate}
            onBlur={handleBlur}
          />
          
          <div 
            ref={descriptionRef}
            contentEditable
            suppressContentEditableWarning
            className="text-sm text-gray-500 mt-1 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
            data-placeholder="Add a description (optional)"
            onInput={handleDescriptionUpdate}
            onBlur={handleBlur}
          />
        </div>
      )
    }
    
    return (
      <div className="mb-4">
        <div className={cn(titleSizeClasses[effectiveTitleSize])}>
          {title}
        </div>
        
        {description && (
          <div className="text-sm text-gray-500 mt-1">{description}</div>
        )}
      </div>
    )
  }
  
  return (
    <div 
      className={cn(
        "w-full",
        spacingClasses[effectiveSpacing],
        isBuilder && "border border-dashed border-gray-300 p-4 rounded-md",
        className
      )}
    >
      {renderHeader()}
      
      {showSeparator && <Separator className="my-4" />}
      
      <div>
        {children}
      </div>
    </div>
  )
}

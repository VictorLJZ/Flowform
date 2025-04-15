"use client"

import React, { useRef, useEffect, ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { useAutosave } from "@/services/form/autosaveForm"
import { BlockPresentation, defaultBlockPresentation } from "@/types/theme-types"

interface FormBlockWrapperProps {
  id: string
  title: string
  description?: string
  required: boolean
  index?: number
  totalBlocks?: number
  settings?: {
    presentation?: BlockPresentation
  }
  onUpdate?: (updates: Partial<{ title: string, description: string, settings: any }>) => void
  children: ReactNode
  className?: string
}

export function FormBlockWrapper({
  id,
  title,
  description,
  required,
  index,
  totalBlocks,
  settings,
  onUpdate,
  children,
  className
}: FormBlockWrapperProps) {
  const titleRef = useRef<HTMLDivElement>(null)
  const { mode, getBlockPresentation } = useFormBuilderStore()
  const autosave = useAutosave()
  
  // Get block presentation from settings or use default
  const presentation = settings?.presentation || getBlockPresentation(id) || defaultBlockPresentation
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
  // Update title ref when title prop changes
  useEffect(() => {
    if (titleRef.current && isBuilder && titleRef.current.textContent !== title) {
      titleRef.current.textContent = title || ''
    }
  }, [title, isBuilder])
  
  // Handle title update
  const handleTitleUpdate = (e: React.FormEvent<HTMLDivElement>) => {
    if (isBuilder && onUpdate) {
      const target = e.target as HTMLDivElement
      onUpdate({ title: target.textContent || '' })
    }
  }
  
  // Handle description update
  const handleDescriptionUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isBuilder && onUpdate) {
      onUpdate({ description: e.target.value })
    }
  }
  
  // Handle autosave on blur
  const handleBlur = () => {
    if (isBuilder) {
      autosave.scheduleAutosave()
    }
  }
  
  // If we're in viewer mode, render a simplified version
  if (!isBuilder) {
    return (
      <div 
        className={cn(
          "w-full transition-all",
          presentation.layout === 'centered' && "text-center",
          presentation.layout === 'right' && "text-right",
          presentation.spacing === 'compact' && "space-y-1",
          presentation.spacing === 'normal' && "space-y-2",
          presentation.spacing === 'spacious' && "space-y-4",
          className
        )}
      >
        <div className={cn(
          "font-medium",
          presentation.titleSize === 'small' && "text-base",
          presentation.titleSize === 'medium' && "text-xl",
          presentation.titleSize === 'large' && "text-2xl"
        )}>
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
        
        {description && (
          <div className="text-sm text-gray-500">{description}</div>
        )}
        
        <div className="mt-2">
          {children}
        </div>
      </div>
    )
  }
  
  // Full builder mode layout
  return (
    <Card className="shadow-sm rounded-none w-full h-full border-0">
      <CardContent className="h-full flex flex-col justify-center" style={{ padding: '1.5rem 15%' }}>
        <div className="w-full">
          {/* Slide counter with arrow - only in builder mode */}
          {typeof index === 'number' && typeof totalBlocks === 'number' && (
            <div className="flex items-center mb-5">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {index + 1}
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                  <path 
                    fill="currentColor"
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M8.47 1.97a.75.75 0 0 1 1.06 0l4.897 4.896a1.25 1.25 0 0 1 0 1.768L9.53 13.53a.75.75 0 0 1-1.06-1.06l3.97-3.97H1.75a.75.75 0 1 1 0-1.5h10.69L8.47 3.03a.75.75 0 0 1 0-1.06Z" 
                  />
                </svg>
              </div>
            </div>
          )}
          
          {/* Editable title */}
          <div className="mb-3">
            <div className="flex items-baseline">
              <div 
                ref={titleRef}
                contentEditable
                suppressContentEditableWarning
                className="font-semibold outline-none focus-visible:ring-0 focus-visible:ring-offset-0 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
                style={{ fontSize: '1.75rem', lineHeight: '2.25rem', minWidth: '1rem' }}
                data-placeholder="Question title"
                onInput={handleTitleUpdate}
                onBlur={handleBlur}
              />
              
              {required && (
                <span className="text-primary font-medium ml-1" style={{ fontSize: '1.5rem' }}>*</span>
              )}
            </div>
            
            {/* Optional description */}
            <Textarea
              value={description || ''}
              onChange={handleDescriptionUpdate}
              onBlur={handleBlur}
              className="border-none resize-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Add a description (optional)"
              rows={2}
            />
          </div>
          
          {/* Block content */}
          <div 
            className={cn(
              "mt-4",
              className
            )}
          >
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

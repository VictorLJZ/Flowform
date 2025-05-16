"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import { BlockPresentation } from "@/types/theme-types"
import { SlideLayout } from "@/types/layout-types"

interface DateBlockProps {
  id: string
  title: string
  description?: string
  required: boolean
  index?: number
  totalBlocks?: number
  settings: {
    placeholder?: string
    minDate?: string
    maxDate?: string
    includeTime?: boolean
    format?: string
    presentation?: BlockPresentation
    layout?: SlideLayout
  }
  value?: string
  onChange?: (type: "answer", value: string) => void
  onUpdate?: (updates: Partial<{
    title: string;
    description: string | null;
    settings: {
      layout?: SlideLayout,
      presentation?: BlockPresentation,
      placeholder?: string,
      min?: string,
      max?: string
    } | null;
  }>) => void
  onNext?: () => void
  isNextDisabled?: boolean
  // Analytics props
  analytics?: {
    trackFocus?: (data?: Record<string, unknown>) => void
    trackBlur?: (data?: Record<string, unknown>) => void
    trackChange?: (data?: Record<string, unknown>) => void
    blockRef?: React.RefObject<HTMLDivElement | null>
  }
}

export function DateBlock({
  id,
  title,
  description,
  required,
  index,
  totalBlocks,
  settings,
  analytics,
  value,
  onChange,
  onUpdate,
  onNext,
  isNextDisabled = false
}: DateBlockProps) {
  const { mode } = useFormBuilderStore()
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isBuilder = mode === 'builder'
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    
    if (onChange) {
      try {
        onChange("answer", dateValue);
      } catch (error) {
        console.warn('Falling back to legacy onChange pattern');
        // @ts-ignore - Deliberately ignoring type errors for backward compatibility
        onChange(dateValue);
      }
    }
    
    // Validate date range if set
    if (!isBuilder && dateValue) {
      const selectedDate = new Date(dateValue)
      
      if (settings?.minDate) {
        const minDate = new Date(settings.minDate)
        if (selectedDate < minDate) {
          setError(`Date must be on or after ${settings.minDate}`)
          return
        }
      }
      
      if (settings?.maxDate) {
        const maxDate = new Date(settings.maxDate)
        if (selectedDate > maxDate) {
          setError(`Date must be on or before ${settings.maxDate}`)
          return
        }
      }
      
      setError(null)
    }
  }

  // The actual date input field component that will be wrapped
  // Create a sample date for builder mode display
  const currentDate = new Date().toISOString().split('T')[0];
  const sampleDateTime = new Date().toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  
  const dateField = (
    <div className="w-full">
      <Input
        type={settings?.includeTime ? "datetime-local" : "date"}
        placeholder={settings?.placeholder || "YYYY-MM-DD"}
        min={settings?.minDate}
        max={settings?.maxDate}
        value={isBuilder ? (settings?.includeTime ? sampleDateTime : currentDate) : value}
        onChange={handleInputChange}
        disabled={isBuilder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "w-full text-base placeholder:text-gray-500 placeholder:text-left transition-all",
          isBuilder && "opacity-70 cursor-not-allowed",
          focused && "ring-2 ring-primary/50",
          error && "border-red-500"
        )}
      />
      
      {error && !isBuilder && (
        <div className="text-red-500 text-sm mt-1">
          {error}
        </div>
      )}
      
      {(settings?.minDate || settings?.maxDate) && (
        <div className="text-xs text-gray-500 mt-1">
          {settings.minDate && `From: ${settings.minDate}`}
          {settings.minDate && settings.maxDate && ' • '}
          {settings.maxDate && `To: ${settings.maxDate}`}
        </div>
      )}
    </div>
  )

  return (
    <SlideWrapper
      id={id}
      title={title}
      description={description}
      required={required}
      index={index}
      totalBlocks={totalBlocks}
      settings={{
        presentation: settings.presentation,
        layout: settings.layout || { type: 'standard' }
      }}
      onUpdate={onUpdate}
      onNext={onNext}
      isNextDisabled={isNextDisabled}
      blockRef={analytics?.blockRef}
    >
      {dateField}
    </SlideWrapper>
  );
}

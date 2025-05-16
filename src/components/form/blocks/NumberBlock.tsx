"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import { BlockPresentation } from "@/types/theme-types"
import { SlideLayout } from "@/types/layout-types"

interface NumberBlockProps {
  id: string
  title: string
  description?: string
  required: boolean
  index?: number
  totalBlocks?: number
  settings: {
    placeholder?: string
    min?: number
    max?: number
    step?: number
    prefix?: string
    suffix?: string
    presentation?: BlockPresentation
    layout?: SlideLayout
  }
  value?: number | string
  onChange?: (type: "answer", value: number | string) => void
  onUpdate?: (updates: Partial<{
    title: string;
    description: string | null;
    settings: {
      placeholder?: string,
      min?: number,
      max?: number,
      step?: number,
      presentation?: BlockPresentation,
      layout?: SlideLayout
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

export function NumberBlock({
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
  isNextDisabled
}: NumberBlockProps) {
  const { mode } = useFormBuilderStore()
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isBuilder = mode === 'builder'
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Handle empty input case
    if (!inputValue) {
      setError(null)
      if (onChange) {
        try {
          onChange("answer", '');
        } catch (error) {
          console.warn('Falling back to legacy onChange pattern');
          // @ts-ignore - Deliberately ignoring type errors for backward compatibility
          onChange('');
        }
      }
      return
    }
    
    const numericValue = parseFloat(inputValue)
    
    // Check if it's a valid number
    if (isNaN(numericValue)) {
      setError('Please enter a valid number')
      if (onChange) {
        try {
          onChange("answer", inputValue);
        } catch (error) {
          console.warn('Falling back to legacy onChange pattern');
          // @ts-ignore - Deliberately ignoring type errors for backward compatibility
          onChange(inputValue);
        }
      }
      return
    }
    
    // Validate min and max if set
    if (settings?.min !== undefined && numericValue < settings.min) {
      setError(`Value must be at least ${settings.min}`)
    } else if (settings?.max !== undefined && numericValue > settings.max) {
      setError(`Value must be at most ${settings.max}`)
    } else {
      setError(null)
    }
    
    if (onChange) {
      try {
        onChange("answer", numericValue);
      } catch (error) {
        console.warn('Falling back to legacy onChange pattern');
        // @ts-ignore - Deliberately ignoring type errors for backward compatibility
        onChange(numericValue);
      }
    }
  }

  // The actual number input field component that will be wrapped
  const numberField = (
    <div className="w-full">
      <div className="relative">
        {settings?.prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {settings.prefix}
          </div>
        )}
        
        <Input
          type="number"
          placeholder={settings?.placeholder || "0"}
          min={settings?.min}
          max={settings?.max}
          step={settings?.step || 1}
          value={isBuilder ? '' : value}
          onChange={handleInputChange}
          disabled={isBuilder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "w-full text-base placeholder:text-gray-500 transition-all",
            settings?.prefix && "pl-8",
            settings?.suffix && "pr-8",
            isBuilder && "opacity-70 cursor-not-allowed",
            focused && "ring-2 ring-primary/50",
            error && "border-red-500"
          )}
        />
        
        {settings?.suffix && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {settings.suffix}
          </div>
        )}
      </div>
      
      {error && !isBuilder && (
        <div className="text-red-500 text-sm mt-1">
          {error}
        </div>
      )}
      
      {settings?.min !== undefined && settings?.max !== undefined && (
        <div className="text-xs text-gray-500 mt-1">
          Range: {settings.min} to {settings.max}
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
      {numberField}
    </SlideWrapper>
  );
}

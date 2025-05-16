"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import { BlockPresentation } from "@/types/theme-types"
import { SlideLayout } from "@/types/layout-types"

interface EmailBlockProps {
  // Analytics props
  analytics?: {
    trackFocus?: (data?: Record<string, unknown>) => void
    trackBlur?: (data?: Record<string, unknown>) => void
    trackChange?: (data?: Record<string, unknown>) => void
    blockRef?: React.RefObject<HTMLDivElement | null>
  }
  id: string
  title: string
  description?: string
  required: boolean
  index?: number
  totalBlocks?: number
  settings: {
    placeholder?: string
    validateFormat?: boolean
    presentation?: BlockPresentation
    layout?: SlideLayout
  }
  value?: string
  onChange?: (type: "answer", value: string) => void
  onUpdate?: (updates: Partial<{
    title: string;
    description: string | null;
    settings: {
      placeholder?: string,
      presentation?: BlockPresentation,
      layout?: SlideLayout
    } | null;
  }>) => void
  // Navigation props
  onNext?: () => void
  isNextDisabled?: boolean
}

export function EmailBlock({
  analytics,
  id,
  title,
  description,
  required,
  index,
  totalBlocks,
  settings,
  value,
  onChange,
  onUpdate,
  onNext,
  isNextDisabled
}: EmailBlockProps) {
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { mode } = useFormBuilderStore()
  const isBuilder = mode === 'builder'
  
  // Helper to validate email format
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      // Make the implementation flexible to handle both old and new versions
      try {
        onChange("answer", newValue);
      } catch (error) {
        // If the above fails, try the legacy pattern
        console.warn('Falling back to legacy onChange pattern');
        // @ts-ignore - Deliberately ignoring type errors for backward compatibility
        onChange(newValue);
      }
    }
    
    // Track value change for analytics
    if (analytics?.trackChange) {
      analytics.trackChange({
        input_type: 'email',
        value_length: newValue.length,
        has_value: newValue.trim().length > 0,
        is_valid: isValidEmail(newValue)
      });
    }
    
    // Validate email format if enabled and not empty
    if (settings?.validateFormat && newValue && !isBuilder) {
      const isValid = isValidEmail(newValue)
      
      if (!isValid) {
        setError('Please enter a valid email address')
      } else {
        setError(null)
      }
    } else {
      setError(null)
    }
  }

  // The actual email input field component that will be wrapped
  const emailField = (
    <div className="w-full">
      <Input
        type="email"
        placeholder={settings?.placeholder || "email@example.com"}
        value={isBuilder ? '' : value}
        onChange={handleInputChange}
        disabled={isBuilder}
        onFocus={() => {
          setFocused(true);
          // Track focus event for analytics
          if (analytics?.trackFocus) {
            analytics.trackFocus({ field_type: 'email' });
          }
        }}
        onBlur={() => {
          setFocused(false);
          // Track blur event for analytics
          if (analytics?.trackBlur) {
            analytics.trackBlur({
              field_type: 'email',
              input_length: value?.length || 0,
              is_valid: value ? isValidEmail(value) : false
            });
          }
        }}
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
      {emailField}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </SlideWrapper>
  );
}

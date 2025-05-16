"use client"

import React, { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import { BlockPresentation } from "@/types/theme-types"
import { SlideLayout } from "@/types/layout-types"

interface TextAreaBlockProps {
  id: string
  title: string
  description?: string
  required: boolean
  index?: number
  totalBlocks?: number
  settings: {
    placeholder?: string
    maxRows?: number
    maxLength?: number
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
      rows?: number,
      maxLength?: number,
      presentation?: BlockPresentation,
      layout?: SlideLayout
    } | null;
  }>) => void
  // Navigation props
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

export function TextAreaBlock({
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
}: TextAreaBlockProps) {
  const { mode } = useFormBuilderStore()
  const [focused, setFocused] = useState(false)
  const isBuilder = mode === 'builder'
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      try {
        onChange("answer", newValue);
      } catch {
        console.warn('Falling back to legacy onChange pattern');
        (onChange as unknown as (value: string) => void)(newValue);
      }
    }
  }

  // The actual textarea field component that will be wrapped
  const textareaField = (
    <>
      <Textarea
        placeholder={settings?.placeholder || "Type your detailed answer here..."}
        maxLength={settings?.maxLength}
        rows={settings?.maxRows || 5}
        value={isBuilder ? '' : value}
        onChange={handleInputChange}
        disabled={isBuilder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "w-full text-base placeholder:text-gray-500 placeholder:text-left transition-all",
          isBuilder && "opacity-70 cursor-not-allowed",
          focused && "ring-2 ring-primary/50"
        )}
      />
      
      {settings?.maxLength && (
        <div className="text-xs text-right mt-1 text-gray-500">
          Max {settings.maxLength} characters
        </div>
      )}
    </>
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
      className="w-full"
    >
      {textareaField}
    </SlideWrapper>
  );
}

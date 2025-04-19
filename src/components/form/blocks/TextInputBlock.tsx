"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import { BlockPresentation } from "@/types/theme-types"
import { SlideLayout } from "@/types/layout-types"

interface TextInputBlockProps {
  id: string
  title: string
  description?: string
  required: boolean
  index?: number
  totalBlocks?: number
  settings: {
    placeholder?: string
    maxLength?: number
    presentation?: BlockPresentation
    layout?: SlideLayout
  }
  value?: string
  onChange?: (value: string) => void
  onUpdate?: (updates: Partial<{
    title: string,
    description: string,
    settings: {
      placeholder?: string,
      maxLength?: number,
      presentation?: BlockPresentation,
      layout?: SlideLayout
    }
  }>) => void
  // Navigation props
  onNext?: () => void
  isNextDisabled?: boolean
}

export function TextInputBlock({
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
}: TextInputBlockProps) {
  const { mode } = useFormBuilderStore()
  const [focused, setFocused] = useState(false)
  const isBuilder = mode === 'builder'
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  // The actual input field component that will be wrapped
  const inputField = (
    <>
      <Input
        type="text"
        placeholder={settings?.placeholder || "Type your answer here..."}
        maxLength={settings?.maxLength}
        value={isBuilder ? '' : value}
        onChange={handleInputChange}
        disabled={isBuilder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "w-full transition-all",
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
    >
      {inputField}
    </SlideWrapper>
  );
}

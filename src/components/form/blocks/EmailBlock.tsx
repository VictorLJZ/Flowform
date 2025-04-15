"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { FormBlockWrapper } from "@/components/form/FormBlockWrapper"
import { BlockPresentation } from "@/types/theme-types"

interface EmailBlockProps {
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
  }
  value?: string
  onChange?: (value: string) => void
  onUpdate?: (updates: Partial<{ title: string, description: string, settings: any }>) => void
}

export function EmailBlock({
  id,
  title,
  description,
  required,
  index,
  totalBlocks,
  settings,
  value,
  onChange,
  onUpdate
}: EmailBlockProps) {
  const { mode } = useFormBuilderStore()
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isBuilder = mode === 'builder'
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value
    
    if (onChange) {
      onChange(emailValue)
    }
    
    // Validate email format if enabled and not empty
    if (settings?.validateFormat && emailValue && !isBuilder) {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)
      
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
    </div>
  )

  return (
    <FormBlockWrapper
      id={id}
      title={title}
      description={description}
      required={required}
      index={index}
      totalBlocks={totalBlocks}
      settings={{ presentation: settings.presentation }}
      onUpdate={onUpdate}
    >
      {emailField}
    </FormBlockWrapper>
  );
}

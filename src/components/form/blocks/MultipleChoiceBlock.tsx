"use client"

import React, { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { FormBlockWrapper } from "@/components/form/FormBlockWrapper"
import { BlockPresentation } from "@/types/theme-types"

interface Option {
  id: string
  label: string
  value?: string
}

interface MultipleChoiceBlockProps {
  id: string
  title: string
  description?: string
  required: boolean
  index?: number
  totalBlocks?: number
  settings: {
    options?: Option[]
    allowOther?: boolean
    presentation?: BlockPresentation
  }
  value?: string
  onChange?: (value: string) => void
  onUpdate?: (updates: Partial<{ title: string, description: string, settings: any }>) => void
}

export function MultipleChoiceBlock({
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
}: MultipleChoiceBlockProps) {
  const { mode } = useFormBuilderStore()
  const isBuilder = mode === 'builder'
  
  const handleValueChange = (value: string) => {
    if (onChange) {
      onChange(value)
    }
  }

  // The actual radio group component that will be wrapped
  const radioGroupField = (
    <RadioGroup 
      disabled={isBuilder}
      value={value || ""} 
      onValueChange={handleValueChange}
      className="space-y-3 mt-1"
    >
      {(settings?.options || []).map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <RadioGroupItem value={option.id} id={option.id} />
          <Label 
            htmlFor={option.id} 
            className={cn(
              isBuilder && "opacity-70"
            )}
          >
            {option.label}
          </Label>
        </div>
      ))}
      
      {settings?.allowOther && (
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="other" id={`${id}-other`} />
          <Label 
            htmlFor={`${id}-other`}
            className={cn(
              isBuilder && "opacity-70"
            )}
          >
            Other
          </Label>
        </div>
      )}
    </RadioGroup>
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
      {radioGroupField}
    </FormBlockWrapper>
  );
}
